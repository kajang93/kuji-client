#!/usr/bin/env python3
# 검증한 정적 릴리스를 원자 전환하고 HTTP 확인 실패 시 이전 사이트로 복구한다.
import argparse
import ctypes
import fcntl
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import time
from urllib.parse import urlparse, urljoin
import urllib.request
import uuid


def digest(path):
    value = hashlib.sha256()
    with Path(path).open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            value.update(block)
    return value.hexdigest()


class References(HTMLParser):
    def __init__(self):
        super().__init__(); self.paths = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'script' and values.get('src'):
            self.paths.append(values['src'])
        if tag == 'link' and values.get('rel') in {'stylesheet', 'modulepreload'} and values.get('href'):
            self.paths.append(values['href'])


def verify_artifact(source, revision):
    source = Path(source)
    if source.is_symlink() or not source.is_dir() or not (source / 'index.html').is_file():
        raise ValueError('배포할 정적 파일 경로와 index.html이 필요합니다.')
    manifest = json.loads((source / 'kuji-release.json').read_text())
    if manifest.get('revision') != revision or not isinstance(manifest.get('files'), dict) or 'index.html' not in manifest['files']:
        raise ValueError('배포 커밋과 정적 파일 목록이 일치하지 않습니다.')
    actual = set()
    for path in source.rglob('*'):
        if path.is_symlink():
            raise ValueError('업로드된 정적 파일에 심볼릭 링크를 허용하지 않습니다.')
        if path.is_file() and path.name != 'kuji-release.json':
            name = path.relative_to(source).as_posix(); actual.add(name)
            if path.name == '.env' or path.suffix.lower() in {'.pem', '.key', '.p12', '.jks'}:
                raise ValueError('정적 파일에 비공개 설정이나 키를 배포할 수 없습니다.')
            if manifest['files'].get(name) != digest(path):
                raise ValueError('정적 파일 해시가 일치하지 않습니다.')
    if actual != set(manifest['files']):
        raise ValueError('정적 파일이 누락되거나 예기치 않은 파일이 포함되었습니다.')
    parser = References(); parser.feed((source / 'index.html').read_text())
    if not parser.paths:
        raise ValueError('진입 페이지의 실행 파일을 확인하지 못했습니다.')
    for value in parser.paths:
        url = urlparse(value)
        if url.scheme or url.netloc:
            continue
        path = url.path.lstrip('/')
        if '..' in Path(path).parts or not (source / path).is_file():
            raise ValueError('진입 페이지가 참조하는 실행 파일이 없습니다.')
    return manifest


def exchange(first, second):
    library = ctypes.CDLL(None, use_errno=True)
    rename = getattr(library, 'renameat2', None)
    if rename is None:
        raise RuntimeError('원자 전환을 지원하는 Linux renameat2가 필요합니다. 기존 사이트는 변경하지 않습니다.')
    rename.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
    rename.restype = ctypes.c_int
    if rename(-100, os.fsencode(first), -100, os.fsencode(second), 2) != 0:
        raise OSError(ctypes.get_errno(), '정적 사이트 원자 전환에 실패했습니다.')


def expected_http_files(source):
    parser = References(); parser.feed((source / 'index.html').read_text())
    names = ['index.html'] + [urlparse(value).path.lstrip('/') for value in parser.paths if not urlparse(value).scheme and not urlparse(value).netloc]
    return {name: digest(source / name) for name in names}


def ready(url, expected, attempts=15, interval=2):
    for attempt in range(attempts):
        try:
            valid = True
            for name, checksum in expected.items():
                request = urllib.request.Request(urljoin(url, name), headers={'Cache-Control': 'no-cache'})
                with urllib.request.urlopen(request, timeout=5) as response:
                    body = response.read(8 * 1024 * 1024 + 1)
                    if response.status != 200 or hashlib.sha256(body).hexdigest() != checksum:
                        valid = False
                        break
            if valid:
                return True
        except Exception:
            pass
        if attempt + 1 < attempts:
            time.sleep(interval)
    return False


def deploy(source, revision, current=Path('/var/www/html'), releases=Path('/var/www/kuji-releases'), url='https://kujishop.shop/', attempts=15, interval=2):
    if not re.fullmatch(r'[a-f0-9]{40}', revision):
        raise ValueError('배포 커밋 식별자가 올바르지 않습니다.')
    source, current, releases = Path(source), Path(current), Path(releases)
    manifest = verify_artifact(source, revision)
    if not current.exists() or not current.is_dir():
        raise ValueError('롤백할 기존 사이트를 확인하지 못했습니다.')
    previous_files = expected_http_files(current)
    old_root = current.resolve()
    releases.mkdir(parents=True, exist_ok=True, mode=0o755)
    staging = releases / ('previous-' + str(time.time_ns()) + '-' + uuid.uuid4().hex[:8])
    previous_is_link = current.is_symlink()
    release = releases / (revision + '-' + uuid.uuid4().hex[:12])
    shutil.copytree(source, release)
    for path in release.rglob('*'):
        os.chmod(path, 0o755 if path.is_dir() else 0o644)
    os.chmod(release, 0o755)
    # 이전 화면이 참조하는 해시 자산과 기존 공개 미디어를 지우지 않습니다.
    previous_assets = old_root / 'assets'
    if previous_assets.is_dir():
        for path in previous_assets.rglob('*'):
            if path.is_file() and not path.is_symlink():
                target = release / 'assets' / path.relative_to(previous_assets)
                if not target.exists():
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(path, target); os.chmod(target, 0o644)
    for name in ['uploads', 'media']:
        preserved = old_root / name
        if preserved.exists():
            if (release / name).exists():
                raise ValueError('기존 미디어 경로와 신규 정적 파일이 충돌합니다. 기존 사이트는 변경하지 않습니다.')
            destination = preserved.resolve() if previous_is_link else staging / name
            (release / name).symlink_to(destination, target_is_directory=preserved.is_dir())
    staging.symlink_to(release, target_is_directory=True)
    switched = False
    completed = False
    try:
        exchange(staging, current); switched = True
        if not ready(url, expected_http_files(source), attempts, interval):
            raise RuntimeError('새 사이트의 HTTP 준비 확인이 실패했습니다.')
        completed = True
        return {'deployment': 'passed', 'revision': revision, 'readiness': 'passed', 'rollback': 'not-needed'}
    except Exception:
        if switched:
            exchange(staging, current)
            recovered = ready(url, previous_files, attempts, interval)
            print(json.dumps({'deployment': 'failed', 'revision': revision, 'rollback': 'passed' if recovered else 'failed'}), file=sys.stderr)
        raise RuntimeError('정적 사이트 배포가 실패했습니다. 이전 사이트 복구 결과를 확인해 주세요.') from None
    finally:
        if not completed and staging.is_symlink():
            staging.unlink()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--revision', required=True)
    parser.add_argument('--url', default='https://kujishop.shop/')
    args = parser.parse_args()
    try:
        with Path('/run/lock/kuji-frontend-deploy.lock').open('w') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            print(json.dumps(deploy(args.source, args.revision, url=args.url)))
        return 0
    except Exception as error:
        message = str(error) if isinstance(error, (ValueError, RuntimeError)) else '정적 사이트 배포 사전 검사가 실패했습니다.'
        print(json.dumps({'deployment': 'failed', 'errorType': type(error).__name__, 'message': message}), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())

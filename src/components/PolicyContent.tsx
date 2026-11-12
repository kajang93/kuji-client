// 가입·설정·공개 페이지에서 같은 운영정보와 정책 본문을 표시한다.
import type { FC } from 'react';
import { KAKAO_CHANNEL_URL } from '../constants/support';
import {
  POLICY_OPERATOR, POLICY_REFERENCES, POLICY_SECTIONS, POLICY_TITLES, POLICY_UPDATED_AT,
  type PolicyAudience, type PolicyKind,
} from '../constants/policies';

export type PolicyContentProps = { kind: PolicyKind; audience?: PolicyAudience };

export const OperatorDisclosure: FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="space-y-1 text-xs leading-6 text-slate-300">
    <p>서비스 {POLICY_OPERATOR.serviceName} · 운영사업자 {POLICY_OPERATOR.businessName}</p>
    <p>사업자등록번호 {POLICY_OPERATOR.businessNumber}</p>
    {!compact && POLICY_OPERATOR.representativeName && <p>대표자 {POLICY_OPERATOR.representativeName}</p>}
    {!compact && <p>{POLICY_OPERATOR.businessAddress ? `사업장 주소 ${POLICY_OPERATOR.businessAddress}` : '사업장 주소는 판매 개시 전 확인 예정'}</p>}
    {!compact && <p>{POLICY_OPERATOR.salesRegistrationNumber ? `통신판매업 신고번호 ${POLICY_OPERATOR.salesRegistrationNumber}` : POLICY_OPERATOR.salesRegistrationStatus}</p>}
    {POLICY_OPERATOR.privacyOfficer && <p>개인정보 보호책임자 {POLICY_OPERATOR.privacyOfficer}</p>}
    <p>운영·개인정보 문의 <a className="break-all text-cyan-300 underline underline-offset-4" href={`mailto:${POLICY_OPERATOR.email}`}>{POLICY_OPERATOR.email}</a></p>
  </div>
);

export const SidebarServiceInfo: FC = () => (
  <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-left">
    <OperatorDisclosure compact />
    <nav aria-label="서비스 정책" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300">
      <a href="/terms" className="underline underline-offset-4 hover:text-white">이용약관</a>
      <a href="/privacy" className="font-semibold underline underline-offset-4 hover:text-white">개인정보 처리방침</a>
    </nav>
  </div>
);

const PolicyContent: FC<PolicyContentProps> = ({ kind, audience = 'all' }) => (
  <article className="space-y-6 text-sm leading-7 text-slate-200" aria-label={POLICY_TITLES[kind]}>
    <header className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
      <h3 className="text-lg font-semibold text-white">{POLICY_TITLES[kind]}</h3>
      <p className="mt-1 text-xs text-slate-400">최종 정리일 {POLICY_UPDATED_AT}</p>
      <OperatorDisclosure />
    </header>
    {POLICY_SECTIONS[kind].filter(section => !section.audience || audience === 'all' || section.audience === audience).map(section => (
      <section key={section.title} className="space-y-3">
        <h4 className="font-semibold text-amber-300">{section.title}</h4>
        {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        {section.bullets && <ul className="list-disc space-y-2 pl-5">{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
        {section.table && <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full min-w-[260px] text-left text-xs leading-6">
            <thead className="bg-slate-800 text-slate-100"><tr>{section.table.headers.map(header => <th key={header} scope="col" className="px-3 py-2 align-top">{header}</th>)}</tr></thead>
            <tbody>{section.table.rows.map(row => <tr key={row[0]} className="border-t border-slate-700">{row.map((cell, index) => index === 0
              ? <th key={index} scope="row" className="w-1/3 px-3 py-3 align-top font-medium text-slate-100">{cell}</th>
              : <td key={index} className="px-3 py-3 align-top">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>}
      </section>
    ))}
    <footer className="space-y-3 border-t border-slate-700 pt-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <a href={`mailto:${POLICY_OPERATOR.email}?subject=${encodeURIComponent("상품 판매자와 거래조건 문의")}`} className="text-cyan-300 underline underline-offset-4">상품 판매자·거래조건 문의</a>
        <a href={KAKAO_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-4">오시쿠지 카카오톡 문의</a>
        <a href="https://www.privacy.go.kr/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-4">개인정보 침해신고·분쟁조정 안내</a>
      </div>
      <details className="text-xs text-slate-400"><summary className="cursor-pointer">관련 법령과 안내</summary>
        <ul className="mt-2 space-y-2">{POLICY_REFERENCES.map(reference => <li key={reference.href}><a className="underline" href={reference.href} target="_blank" rel="noopener noreferrer">{reference.label}</a></li>)}</ul>
      </details>
    </footer>
  </article>
);

export default PolicyContent;

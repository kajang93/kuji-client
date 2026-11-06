// 결제 없이 오리지널 미리보기 상품 구성과 라스트상 규칙을 보여준다.
import { useEffect, useState, type FC } from 'react';
import { ArrowLeft, Gift, LoaderCircle, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PreviewCollection {
  slug: string;
  title: string;
  description: string;
  image: string;
  examplePrice: number;
  products: { grade: string; name: string; quantity: number }[];
}

const CatalogPreview: FC<{ onBack: () => void }> = ({ onBack }) => {
  const [collections, setCollections] = useState<PreviewCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/catalog-preview/catalog.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('미리보기 목록을 불러오지 못했습니다.');
        return response.json();
      })
      .then(data => {
        if (data.previewOnly !== true || !Array.isArray(data.collections)) throw new Error('미리보기 데이터를 확인해 주세요.');
        setCollections(data.collections);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return (
    <section className="min-h-full bg-slate-950 px-4 pb-12 pt-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <button onClick={onBack} className="mb-7 flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> 홈으로 돌아가기
        </button>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" /> 오리지널 아트 미리보기
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">작은 그림으로 만나는 두 가지 세계</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">화면 확인용 구성 예시입니다. 실제 판매·재고·배송 상품이 아니며 결제와 추첨은 제공하지 않습니다. 이미지는 새로 생성한 콘셉트 일러스트입니다.</p>
        <div role="note" className="mt-6 rounded-2xl border border-amber-200/25 bg-amber-200/[0.06] p-5">
          <p className="flex items-center gap-2 font-semibold text-amber-100"><Gift className="h-5 w-5" /> 라스트상은 마지막 구매자에게</p>
          <p className="mt-2 text-sm leading-6 text-amber-100/80">실제 운영에서는 마지막 일반 티켓을 구매해 잔여 수량을 0으로 만든 분에게 라스트상 1개를 추가로 지급합니다. 라스트상은 랜덤 추첨·유상 티켓 수량·결제 금액에 포함되지 않습니다.</p>
        </div>

        {loading && <p role="status" className="flex items-center gap-2 py-12 text-slate-300"><LoaderCircle className="h-5 w-5 animate-spin" /> 미리보기를 불러오고 있어요.</p>}
        {failed && <p role="alert" className="py-12 text-rose-200">미리보기를 불러오지 못했습니다. 잠시 후 다시 열어주세요.</p>}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {collections.map(collection => {
            const regularCount = collection.products.filter(product => product.grade !== 'LAST').reduce((sum, product) => sum + product.quantity, 0);
            return (
              <article key={collection.slug} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
                <ImageWithFallback src={collection.image} alt={collection.title} loading="lazy" className="aspect-square w-full object-cover" />
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-semibold text-cyan-200">판매하지 않는 구성 예시</p>
                  <h2 className="mt-2 text-xl font-semibold">{collection.title.replace('[미리보기] ', '')}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{collection.description}</p>
                  <p className="mt-4 text-sm text-slate-300">일반 티켓 예시 {regularCount}장 + 라스트상 1개</p>
                  <p className="mt-1 text-xs text-slate-500">예시 가격 {collection.examplePrice.toLocaleString()}원 · 실제 청구 없음</p>
                  <ul className="mt-5 space-y-2">
                    {collection.products.map(product => (
                      <li key={product.grade} className={`flex items-start justify-between gap-3 rounded-xl px-3 py-3 text-sm ${product.grade === 'LAST' ? 'border border-amber-200/25 bg-amber-200/10 text-amber-100' : 'bg-white/5 text-slate-200'}`}>
                        <span>{product.grade === 'LAST' ? product.name : `${product.grade}상 · ${product.name}`}</span>
                        <span className="shrink-0 tabular-nums">{product.quantity}개</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CatalogPreview;

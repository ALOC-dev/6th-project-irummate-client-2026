import { matePostModel } from '../model/matePostModel';

export function MatePostPreview() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">메이트 모집글</h2>
      <p className="mt-2 text-sm text-slate-500">{matePostModel.emptyState}</p>
    </article>
  );
}


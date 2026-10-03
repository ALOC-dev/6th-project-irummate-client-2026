import { roommateModel } from '../model/roommateModel';

export function RoommateSummary() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">룸메이트 추천</h2>
      <p className="mt-2 text-sm text-slate-500">{roommateModel.emptyState}</p>
    </article>
  );
}


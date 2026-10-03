export function ProfileCard({ profile }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold text-slate-900">내 프로필</h2>
      <p className="mt-2 text-sm text-slate-500">{profile?.name ?? '프로필을 준비 중입니다.'}</p>
    </article>
  );
}


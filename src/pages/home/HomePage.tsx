import { useSession } from '@features/auth';
import { DormHomeView } from '@features/dorm';

export default function HomePage() {
  const { user } = useSession();
  return <DormHomeView roomLabel={user?.dormRoom ?? undefined} />;
}

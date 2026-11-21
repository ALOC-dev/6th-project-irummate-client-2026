import { ChatIcon } from '@features/chat';
import { MateCategoryIcon } from '@features/mate-post';
import { NotificationListView } from '@features/notification';

export default function NotificationListPage() {
  return (
    <NotificationListView
      icons={{
        back: <ChatIcon name="arrow-left" />,
        mate: (kind) => <MateCategoryIcon category={kind} />,
      }}
    />
  );
}

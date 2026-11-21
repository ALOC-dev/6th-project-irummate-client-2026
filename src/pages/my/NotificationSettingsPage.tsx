import { useSearchParams } from 'react-router';

import { ChatIcon } from '@features/chat';
import { MateIcon } from '@features/mate-post';
import { NotificationSettingsView } from '@features/notification';

export default function NotificationSettingsPage() {
  // 기기 알림 권한은 아직 읽지 않는다. ?device=off로 '기기 알림 꺼짐' 화면을 미리 볼 수 있다.
  const [searchParams] = useSearchParams();
  return (
    <NotificationSettingsView
      deviceNotificationsEnabled={searchParams.get('device') !== 'off'}
      icons={{ back: <ChatIcon name="arrow-left" />, close: <MateIcon name="x" /> }}
    />
  );
}

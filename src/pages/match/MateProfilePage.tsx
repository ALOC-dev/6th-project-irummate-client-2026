import { PendingReviewGate } from '../PendingReviewGate';
import { ScreenPlaceholder } from '../ScreenPlaceholder';

export default function MateProfilePage() {
  return (
    <PendingReviewGate screenId="MC-02" name="메이트 프로필" feature="매칭" back>
      <ScreenPlaceholder screenId="MC-02" name="메이트 프로필" />
    </PendingReviewGate>
  );
}

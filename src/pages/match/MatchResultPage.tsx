import { PendingReviewGate } from '../PendingReviewGate';
import { ScreenPlaceholder } from '../ScreenPlaceholder';

export default function MatchResultPage() {
  return (
    <PendingReviewGate screenId="MC-03" name="매칭 결과" feature="매칭" back>
      <ScreenPlaceholder screenId="MC-03" name="매칭 결과" />
    </PendingReviewGate>
  );
}

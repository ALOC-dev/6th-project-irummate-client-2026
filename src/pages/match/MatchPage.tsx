import { PendingReviewGate } from '../PendingReviewGate';
import { ScreenPlaceholder } from '../ScreenPlaceholder';

export default function MatchPage() {
  return (
    <PendingReviewGate screenId="MC-01" name="매칭" feature="매칭">
      <ScreenPlaceholder screenId="MC-01" name="매칭" />
    </PendingReviewGate>
  );
}

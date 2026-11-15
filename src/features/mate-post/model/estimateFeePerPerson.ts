import type { MateParticipation } from './types';

interface EstimateFeePerPersonInput {
  estimatedFee?: number;
  nowParticipants: number;
  maxParticipants: number;
  participating: MateParticipation;
}

export function estimateFeePerPerson({
  estimatedFee,
  nowParticipants,
  maxParticipants,
  participating,
}: EstimateFeePerPersonInput) {
  if (estimatedFee === undefined) return undefined;

  const viewerAlreadyIncluded = participating !== 'NONE';
  const participantCount = viewerAlreadyIncluded || nowParticipants >= maxParticipants
    ? nowParticipants
    : nowParticipants + 1;

  return Math.ceil(estimatedFee / Math.max(participantCount, 1));
}

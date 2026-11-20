import { BrandIcon, type BrandIconName } from '@shared/ui';

import type { MateCategory } from '../model/types';
import { MateIcon } from './MateIcon';

const BRAND_ICON: Partial<Record<MateCategory, BrandIconName>> = {
  MEAL: 'meal',
  HOBBY: 'gamepad',
  GROUP_BUY: 'cart',
};

export function MateCategoryIcon({ category, className }: { category: MateCategory; className?: string }) {
  const name = BRAND_ICON[category];
  return name ? <BrandIcon name={name} className={className} /> : <MateIcon name="ellipsis" className={className} />;
}

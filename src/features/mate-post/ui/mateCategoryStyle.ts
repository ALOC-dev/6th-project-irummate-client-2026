import type { MateCategory } from '../model/types';
import type { MateIconName } from './MateIcon';

export const mateCategoryIcon: Record<MateCategory, MateIconName> = {
  MEAL: 'utensils',
  HOBBY: 'palette',
  GROUP_BUY: 'dollar',
  OTHER: 'ellipsis',
};

export const mateCategoryTint: Record<MateCategory, string> = {
  MEAL: 'bg-sun-100 text-sun-600',
  HOBBY: 'bg-mint-100 text-mint-600',
  GROUP_BUY: 'bg-info-soft text-info',
  OTHER: 'bg-peach-100 text-danger',
};

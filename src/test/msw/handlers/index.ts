import { adminHandlers } from './admin';
import { authHandlers } from './auth';
import { chatHandlers } from './chat';
import { dormHandlers } from './dorm';
import { matePostHandlers } from './mate-post';
import { notificationHandlers } from './notification';
import { profileHandlers } from './profile';
import { roommateHandlers } from './roommate';
import { termsHandlers } from './terms';
import { verificationHandlers } from './verification';

// feature 10개의 핸들러 자리. 등록은 끝냈으므로 각자 자기 feature 파일만 고친다.
export const handlers = [
  ...authHandlers,
  ...termsHandlers,
  ...profileHandlers,
  ...verificationHandlers,
  ...roommateHandlers,
  ...adminHandlers,
  ...dormHandlers,
  ...matePostHandlers,
  ...chatHandlers,
  ...notificationHandlers,
];

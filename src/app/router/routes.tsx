import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, type RouteObject } from 'react-router';

import type { BuildTarget } from '@shared/config/env';

import { OnboardingLayout } from '../layouts/OnboardingLayout';
import { StackLayout } from '../layouts/StackLayout';
import { TabLayout } from '../layouts/TabLayout';
import { EntryRedirect } from './EntryRedirect';
import { AdminGate } from './guards/AdminGate';
import { AuthGate } from './guards/AuthGate';
import { CertifiedGate } from './guards/CertifiedGate';
import { OnboardingGate } from './guards/OnboardingGate';
import { paths, routePatterns } from './paths';

// 사용자 페이지는 라우트 lazy로 불러온다.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

// 관리자 페이지는 AdminGate가 통과시킨 뒤에만 내려받도록 React.lazy로 그린다.
// 라우트 lazy는 가드가 막기 전에 모듈을 받기 때문이다(docs/adr/0001).
const AdminHomePage = lazy(() => import('@pages/admin/AdminHomePage'));

const publicRoutes: RouteObject[] = [
  {
    element: <OnboardingLayout />,
    children: [
      { path: paths.login, lazy: page(() => import('@pages/onboarding/LoginPage')) },
      { path: paths.kakaoCallback, lazy: page(() => import('@pages/onboarding/KakaoCallbackPage')) },
    ],
  },
];

const adminRoute: RouteObject = {
  element: <AuthGate />,
  children: [{
    element: <AdminGate />,
    children: [{
      path: paths.admin.home,
      element: <Suspense fallback={null}><AdminHomePage /></Suspense>,
    }],
  }],
};

const userRoute: RouteObject = {
  element: <AuthGate />,
  children: [
    {
      element: <OnboardingGate />,
      children: [{
        element: <OnboardingLayout />,
        children: [
          { path: paths.onboarding.terms, lazy: page(() => import('@pages/onboarding/TermsPage')) },
          { path: paths.onboarding.intro, lazy: page(() => import('@pages/onboarding/IntroPage')) },
          { path: paths.onboarding.profile, lazy: page(() => import('@pages/onboarding/ProfileSetupPage')) },
          { path: paths.onboarding.certification, lazy: page(() => import('@pages/onboarding/CertificationPage')) },
        ],
      }],
    },
    {
      element: <CertifiedGate />,        // 안쪽에 uukdo의 ChatSocketProvider가 들어온다
      children: [
        {
          element: <TabLayout />,
          children: [
            { path: paths.home, lazy: page(() => import('@pages/home/HomePage')) },
            { path: paths.match, lazy: page(() => import('@pages/match/MatchPage')) },
            { path: paths.mate, lazy: page(() => import('@pages/mate/MatePage')) },
            { path: paths.my, lazy: page(() => import('@pages/my/MyPage')) },
          ],
        },
        {
          element: <StackLayout />,
          children: [
            { path: routePatterns.mateProfile, lazy: page(() => import('@pages/match/MateProfilePage')) },
            { path: routePatterns.matchResult, lazy: page(() => import('@pages/match/MatchResultPage')) },
            { path: paths.chats, lazy: page(() => import('@pages/chat/ChatListPage')) },
            { path: routePatterns.chatRoom, lazy: page(() => import('@pages/chat/ChatRoomPage')) },
            { path: paths.survey, lazy: page(() => import('@pages/my/SurveyEditPage')) },
            { path: routePatterns.policy, lazy: page(() => import('@pages/my/PolicyPage')) },
            { path: paths.blocked, lazy: page(() => import('@pages/my/BlockedMatesPage')) },
            { path: paths.notificationSettings, lazy: page(() => import('@pages/my/NotificationSettingsPage')) },
          ],
        },
      ],
    },
  ],
};

const fallbackRoute: RouteObject = { path: '*', element: <Navigate to={paths.entry} replace /> };

// 빌드 대상에 따라 등록할 라우트를 고른다. 관리자 웹은 로그인·카카오 콜백·관리자 화면만 둔다.
export function createRoutes(target: BuildTarget): RouteObject[] {
  const entryRoute: RouteObject = { path: paths.entry, element: <EntryRedirect target={target} /> };
  if (target === 'admin-web') return [entryRoute, ...publicRoutes, adminRoute, fallbackRoute];
  return [entryRoute, ...publicRoutes, userRoute, adminRoute, fallbackRoute];
}

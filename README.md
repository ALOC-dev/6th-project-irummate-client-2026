# 6th-project-irummate-client-2026
Irummate Frontend

## 시작하기

```bash
npm install
npm run dev
```

## 구조

```text
src/
├── app/          # providers, router, 전역 게이트, 단일 소켓 연결
├── pages/        # 라우트 진입점과 화면 조립
├── features/     # auth, roommate, mate-post, chat, profile
└── shared/       # api, platform, ui, lib
```

각 feature는 `api / hooks / components / model / index.js`를 기준으로 확장한다.

# 기여 규칙

규칙의 원문은 [AGENTS.md](AGENTS.md)입니다. 이 문서는 작업 순서만 요약합니다.

## 브랜치

- 기능 단위로 만듭니다. 예: `feat/auth-token-storage`, `chore/stage0-config`
- 하루 한 번 이상 main 기준으로 rebase합니다.

## PR

- PR 하나에는 화면 하나, 또는 같은 목적의 파일 묶음 하나(예: `shared/api`, 프로젝트 설정)를 담습니다.
- 올리기 전에 `npm run lint`, `npm run typecheck`, `npm test`를 통과시킵니다.
- 계약 파일(`paths.ts`, `features/auth/index.ts`, `shared/api/index.ts`, `shared/platform/index.ts`, `shared/ui/index.ts`, `package.json`)을 바꾸면 상대의 리뷰를 받습니다. 선택 필드만 추가하고 기존 이름은 바꾸지 않습니다.
- 상대가 소유한 폴더(`.github/CODEOWNERS`)는 고치지 않고 PR 설명이나 이슈로 요청합니다.

## 커밋

- 1학기 코드를 옮긴 커밋은 메시지에 원본 경로를 적습니다.
- `.env`, `docs-private/`, `CLAUDE.local.md`는 커밋하지 않습니다. 커밋 전에 `git status`로 확인합니다.

## 결정 기록

구조나 방식이 바뀌는 결정은 `docs/adr/`에 번호를 붙여 남깁니다.

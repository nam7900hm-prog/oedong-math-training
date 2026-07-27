# Vercel 배포용 업로드 안내

이 ZIP은 GitHub 저장소의 **최상위 폴더(root)** 에 올리는 소스 파일입니다.

## 반드시 삭제할 잘못된 폴더

기존 GitHub 최상위에 잘못 올라간 다음 폴더는 소스가 아니라 빌드 결과이므로 삭제합니다.

- `assets`
- `client`
- `server`

## 올바른 파일

- `app` — 최신 YR 화면과 교사 문제보관함 기능
- `public` — 공개 이미지와 아이콘
- `package.json` — Vercel용 Next.js 실행 설정
- `package-lock.json`
- `next.config.ts`
- `postcss.config.mjs`
- `tsconfig.json`
- `eslint.config.mjs`
- `next-env.d.ts`
- `vercel.json`

GitHub에서 파일을 올린 뒤 커밋하면 연결된 Vercel 프로젝트가 자동으로 다시 배포합니다.

배포 후 첫 화면의 제목 옆에 컬러풀한 `YR` 표시와 아래 문구가 보여야 최신 버전입니다.

`수학 공부는 반복 반복으로 구구단이 될 때 까지~`

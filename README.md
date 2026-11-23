# blue-meteor-studio.github.io

Blue Meteor Studio의 웹사이트. <https://blue-meteor-studio.github.io> 에서 볼 수 있다.

한 페이지짜리 사이트다: 소개, 대표작(Last Marble Crusher, Ninefall Survivors), footer.

## 빠른 사실

| 항목 | 값 |
|---|---|
| 프레임워크 | [Astro](https://astro.build) 7 (정적 사이트), TypeScript |
| 언어 | 영어 `/`, 한국어 `/ko/`. 브라우저 언어가 한국어면 `/`에서 `/ko/`로 보낸다 |
| 배포 | `main`에 push하면 GitHub Actions가 빌드해 GitHub Pages에 올린다 (`.github/workflows/deploy.yml`) |
| Node | 22.23.4 이상 |
| 글꼴 | 제목은 Barlow Condensed(파일이 저장소에 있다), 본문과 한글은 기기의 시스템 글꼴 |

## 명령어

```sh
npm install        # 처음 한 번
npm run dev        # 개발 서버: http://localhost:4321
npm run build      # 타입 검사(astro check) 후 dist/ 에 빌드. 배포도 이 명령을 쓴다
npm run preview    # 빌드한 dist/ 를 그대로 띄워 본다
```

## 폴더

| 경로 | 내용 |
|---|---|
| `src/pages/` | 주소마다 파일 하나: `index.astro`(영어), `ko/index.astro`(한국어), `404.astro` |
| `src/components/` | 화면 조각. `Home.astro`가 `Hero` → `About` → `Games`를 차례로 놓는다 |
| `src/layouts/Base.astro` | 모든 페이지의 틀: `<head>`(제목, 언어별 주소, 공유 카드), 헤더, footer |
| `src/data/games.ts` | 게임 목록과 게임마다의 문구·스크린샷 (언어별) |
| `src/i18n/index.ts` | 게임 말고 나머지 문구 전부 (언어별), 언어 목록 |
| `src/styles/global.css` | 색과 글꼴 변수, 공통 클래스(`.button`, `.chip`, `.display` …) |
| `src/assets/games/<게임>/<언어>/` | 스크린샷 원본(1920×1080 WebP). 빌드가 크기별로 줄여 낸다 |
| `src/assets/fonts/` | Barlow Condensed 글꼴 파일과 라이선스(OFL) |
| `public/` | 그대로 올라가는 파일: 파비콘, 공유 이미지 `og.png`, `robots.txt` |

## 무엇을 고치려면 어디를

| 하려는 일 | 고칠 곳 |
|---|---|
| 게임 소개 문구, 특징, 플랫폼, 플레이 주소 | `src/data/games.ts` |
| 스크린샷 교체 | `src/assets/games/<게임>/<언어>/`의 파일을 같은 이름으로 바꾼다. 장면을 더하거나 빼면 `src/data/games.ts`의 `shots`도 고친다 |
| 게임 추가 | `src/data/games.ts`에 `Game`을 하나 더 만들어 `games`에 넣는다. 스크린샷이 있으면 `GameFeature`, 없으면 `GameTeaser`로 그린다(`src/components/Games.astro`) |
| 소개 문구, 메뉴, footer 문구 | `src/i18n/index.ts` (영어 `en`과 한국어 `ko`를 함께 고친다. 키가 빠지면 타입 검사가 실패한다) |
| 색, 글자 크기 | `src/styles/global.css`의 `:root` 변수 |
| 언어 추가 | `src/i18n/index.ts`의 `locales`와 사전, `astro.config.mjs`의 `i18n.locales`와 sitemap, `src/pages/<언어>/index.astro`, `src/data/games.ts`의 언어별 문구 |
| 주소(도메인) 변경 | `astro.config.mjs`의 `site`, `src/i18n/index.ts`의 `site.url`, `public/robots.txt` |

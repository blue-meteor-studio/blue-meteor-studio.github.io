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
| 글꼴 | 스튜디오 이름은 Jost, 그 밖의 제목은 Barlow Condensed(둘 다 파일이 저장소에 있다), 본문과 한글은 기기의 시스템 글꼴 |

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
| `src/assets/fonts/` | 글꼴 파일과 라이선스(OFL): Barlow Condensed(제목), Jost(스튜디오 이름) |
| `public/` | 그대로 올라가는 파일: 파비콘, 공유 이미지 `og.png`, `robots.txt` |
| `brand/` | 로고 원본(SVG). 빌드에는 쓰이지 않는다. 아래 "로고" 참고 |

## 로고

고리 하나(유성)와 그 오른쪽 아래의 파란 빛 한 줄(유성이 공기를 밀어내는 자리)로 이루어진다. 이름 BLUE METEOR에서 O 자리에 놓인 그림과 같은 그림이다.

- 고리에는 정해진 색이 없다. 놓이는 곳의 글자 색을 따른다: 어두운 배경에서는 흰색에 가까운 색(`#e9fbf6`), 흰 배경에서는 남색(`#10132a`).
- 파란 빛은 어느 배경에서나 같은 파랑(`#3c6dec`)이다.
- 크기별 그림을 따로 두지 않는다. 16px 파비콘까지 같은 그림을 쓴다.

| 파일 (`brand/`) | 쓰는 곳 |
|---|---|
| `logo-mark-on-dark.svg` | 어두운 배경. 사이트가 쓰는 색이다 |
| `logo-mark-on-light.svg` | 흰 배경과 밝은 배경 |
| `logo-mark-mono-white.svg`, `logo-mark-mono-navy.svg` | 색을 하나만 쓸 수 있을 때 |

사이트 코드에서 로고의 모양과 색은 `src/components/logo-shapes.ts` 한 곳에 있고, `src/components/Logo.astro`가 그것을 그린다.

- 이름 글자형(`Wordmark.astro`): 사이트에서 스튜디오 이름을 그릴 때는 언제나 이것을 쓴다. Jost 글꼴의 자간 넓은 대문자 BLUE METEOR에서 O 자리에 로고를 놓고(`frame="letter"`), STUDIO를 그 아래 가운데에 작게 놓는다. 글자 O는 복사와 검색을 위해 화면 밖에 그대로 남겨 둔다. 크기는 놓이는 곳의 글자 크기를 따른다. 헤더, 첫 화면의 제목, footer가 쓴다.
- 로고만(`frame="symbol"`): 이름이 들어갈 자리가 없는 휴대폰 폭의 헤더.
- 첫 화면(`Hero.astro`)에서는 왼쪽 위에서 내려온 가는 빛줄기가 이름의 O에 닿는다. 닿는 자리는 글자형 안에서 O가 놓인 위치를 재서 적어 둔 값이다(`.hero__trail`). 글자형의 자간이나 O의 크기를 바꾸면 그 값도 함께 고친다.

`public/`의 파비콘(`favicon.svg`, `favicon-32.png`), 홈 화면 아이콘(`apple-touch-icon.png`), `icon-512.png`는 이 로고로 만든 그림이고, 공유 이미지(`og.png`)는 첫 화면과 같은 구성(이름 글자형과 빛줄기)으로 만든 그림이다. 파비콘은 32px에서 고리가 정확히 20px이 되게 놓았다(가장자리가 픽셀 경계에 맞아 또렷하다). 로고나 글자형을 바꾸면 `logo-shapes.ts`, `brand/`, `public/`의 그림을 함께 바꾼다.

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

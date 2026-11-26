# 브랜드 원본

Blue Meteor Studio의 로고와 이름 글자형. **원본**과, 원본에서 만들어지는 **파일**이 함께 있다.

그림을 손으로 다시 그릴 일은 없다. 원본의 숫자를 고치고 명령 하나를 돌리면 모든 파일이 다시 만들어진다.

```sh
npm run brand         # 원본에서 모든 파일을 다시 만든다 (약 5초)
npm run brand:check   # 아무것도 쓰지 않고, 지금 파일이 원본과 맞는지만 본다
```

## 원본: 고칠 때 손대는 곳

| 원본 | 정하는 것 |
|---|---|
| `brand/source/logo.mjs` | 로고의 모양(고리와 파란 빛의 수치)과 색 |
| `src/components/Wordmark.astro`의 `<style>` | 이름 글자형: 자간, STUDIO의 크기와 자리, O 자리에 놓인 고리의 크기 |
| `src/assets/fonts/jost-latin-500-normal.woff2` | 글자형의 글꼴 (Jost 500, 라이선스는 같은 폴더의 `OFL-Jost.txt`) |
| `brand/source/share-image.mjs` | 공유 이미지의 구성: 이름 크기, 지평선 높이, 빛줄기 길이 |
| `brand/source/build.mjs` | 아이콘의 크기와 여백, 어떤 파일을 어디에 만드는지 |

`browser.mjs`, `wordmark.mjs`, `png.mjs`는 만드는 도구다. 디자인을 바꿀 때는 건드릴 일이 없다.

사이트의 로고는 파일을 쓰지 않고 `logo.mjs`를 직접 읽어서 그린다(`src/components/Logo.astro`). `logo.mjs`를 고치면 사이트는 다음 빌드에서 저절로 바뀐다.

## 만들어지는 파일: 손으로 고치지 않는다

| 파일 | 내용 |
|---|---|
| `brand/logo-mark-*.svg` | 로고. 512 상자, 사방 여백 44 |
| `brand/wordmark-*.svg` | 이름 글자형(BLUE METEOR / STUDIO). 글자를 윤곽선으로 바꿔 두어 글꼴 없이도 어디서나 같게 보인다 |
| `public/favicon.svg`, `public/favicon-32.png` | 브라우저 탭 아이콘 |
| `public/apple-touch-icon.png` | 홈 화면 아이콘 (180) |
| `public/icon-512.png` | 검색엔진용 정사각 로고 |
| `public/og.png` | 공유 이미지 (1200 × 630) |

`logo-mark`와 `wordmark`는 색에 따라 네 가지씩 있다.

| 이름 끝 | 쓰는 곳 |
|---|---|
| `-on-dark` | 어두운 배경. 사이트가 쓰는 색이다 |
| `-on-light` | 흰 배경과 밝은 배경 |
| `-mono-white`, `-mono-navy` | 색을 하나만 쓸 수 있을 때 |

## 무엇을 바꾸려면 어디를

| 하려는 일 | 고칠 곳 |
|---|---|
| 파란색을 다른 파랑으로 | `logo.mjs`의 `colors.light` |
| 파란 빛을 두껍게, 길게, 고리에서 멀리 | `logo.mjs`의 `handles.light`: `thickness`, `spread`, `gap` |
| 고리를 굵게, 가늘게 | `logo.mjs`의 `handles.ring.width`. `radius`도 `50 - width / 2`로 맞춘다 |
| 이름의 자간, STUDIO의 크기 | `Wordmark.astro`의 `<style>` |
| 공유 이미지의 구도 | `share-image.mjs`의 `layout` |
| 다른 크기의 아이콘 | `build.mjs`의 `pictures`에 한 줄 더한다 |

고친 뒤의 순서:

1. `npm run brand`: 파일을 다시 만든다. 무엇이 바뀌었는지 한 줄씩 알려 준다.
2. `npm run build`: 사이트를 빌드해서 본다.
3. 바뀐 그림을 눈으로 확인하고 커밋한다.

이름의 자간이나 고리의 크기를 바꾸면 첫 화면에서 빛줄기가 닿는 자리(`src/components/Hero.astro`의 `.hero__trail`)도 달라진다. `npm run brand`가 새 자리를 재서 알려 주고, 그 값을 고칠 때까지 실패로 끝난다.

## 로고의 수치 (`logo.mjs`)

단위는 고리가 꽉 차는 100짜리 상자다. 유성은 왼쪽 위에서 오른쪽 아래로 떨어지므로 파란 빛은 오른쪽 아래에 놓인다.

| 값 | 지금 | 뜻 |
|---|---|---|
| `handles.ring.radius` | 42.6 | 고리 띠의 가운데 선의 반지름 |
| `handles.ring.width` | 14.8 | 고리 띠의 굵기. `radius + width / 2`가 50이어야 한다 |
| `handles.light.gap` | 9 | 고리와 파란 빛 사이의 빈틈 |
| `handles.light.spread` | 136 | 빛이 고리를 감싸는 각도(도) |
| `handles.light.thickness` | 12.93 | 빛의 가운데 두께. 양 끝으로 갈수록 가늘어진다 |

| 색 | 값 | 쓰는 곳 |
|---|---|---|
| `colors.light` | `#3c6dec` | 파란 빛. 어느 배경에서나 같다 |
| `colors.onDark` | `#e9fbf6` | 어두운 배경의 고리와 글자 |
| `colors.onLight` | `#10132a` | 밝은 배경의 고리와 글자 |
| `colors.smallOnDark`, `colors.smallOnLight` | `#c9d6ff`, `#252c57` | STUDIO 줄 |
| `colors.ground` | `#080a18` | 아이콘과 공유 이미지의 바탕 |

고리에는 정해진 색이 없다. 놓이는 곳의 글자 색을 따른다.

## 필요한 것

- Node 22 이상, 그리고 `npm install`.
- Chromium 계열 브라우저 하나(Chrome, Brave, Edge, Chromium). PNG 그림과 글자형 SVG는 브라우저가 페이지를 그려서 만든다. 사이트와 같은 CSS, 같은 글꼴로 그리기 위해서다. 설치된 것을 알아서 찾고, 직접 정하려면 `BRAND_BROWSER=<브라우저 프로그램 경로> npm run brand`.

PNG는 브라우저 버전에 따라 가장자리 픽셀이 조금 다르게 나올 수 있다. 그림이 픽셀까지 같으면 파일을 다시 쓰지 않는다. 저장소의 PNG는 Chromium 157로 만든 것이다.

## 디자인 도구에서 열기

`brand/*.svg`는 도형만으로 된 표준 SVG다. Figma, Illustrator, Inkscape, Affinity에서 그대로 열린다. PNG가 필요하면 이 SVG에서 원하는 크기로 내보낸다.

디자인 도구에서 고친 것은 원본에 반영되지 않는다. 남길 변경은 위의 원본에서 한다.

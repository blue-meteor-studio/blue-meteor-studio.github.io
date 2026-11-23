// The site's languages and every string that is not about one game (those are in src/data/games.ts).
// Adding a language: add it to `locales` here and to `i18n.locales` in astro.config.mjs, give it a
// dictionary below, a folder in src/pages, and its texts in src/data/games.ts.

export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** A language's own name, as the language switch shows it. */
export const localeNames: Record<Locale, string> = { en: "English", ko: "한국어" };
/** The short form on the switch. */
export const localeShort: Record<Locale, string> = { en: "EN", ko: "KO" };
/** Open Graph's name for the language. */
export const ogLocales: Record<Locale, string> = { en: "en_US", ko: "ko_KR" };

export function toLocale(value: string | undefined): Locale {
  return (locales as readonly string[]).includes(value ?? "") ? (value as Locale) : defaultLocale;
}

export const site = {
  name: "Blue Meteor Studio",
  url: "https://blue-meteor-studio.github.io",
  github: "https://github.com/blue-meteor-studio",
} as const;

const en = {
  meta: {
    title: "Blue Meteor Studio",
    titleSuffix: "Game studio",
    description:
      "Blue Meteor Studio is a game studio. We are developing Last Marble Crusher and Ninefall Survivors.",
  },
  a11y: {
    skip: "Skip to content",
    home: "Blue Meteor Studio, to the top of the page",
    mainNav: "Sections",
    language: "Language",
    newTab: "opens in a new tab",
  },
  nav: {
    about: "About",
    games: "Games",
  },
  hero: {
    lead: "We make games.",
    cta: "See the games",
    nowLabel: "In development",
  },
  about: {
    heading: "About",
    // Trusted markup: <strong> only.
    statement:
      "Blue Meteor Studio is a game studio. We are developing two games: <strong>Last Marble Crusher</strong> and <strong>Ninefall Survivors</strong>.",
    detail:
      "Last Marble Crusher can already be played in a web browser while it is in development. News about Ninefall Survivors will follow when it is ready.",
  },
  games: {
    heading: "Games",
    intro: "Both games are in development.",
    status: "In development",
    play: "Play in your browser",
    platforms: "Platforms",
    platformLive: "Playable now",
    platformPlanned: "In the works",
    shots: "Screenshots",
    showShot: "Show screenshot",
  },
  footer: {
    tagline: "Game studio",
    site: "Site",
    games: "Games",
    elsewhere: "Elsewhere",
    rights: "All rights reserved.",
  },
} as const;

type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof en>;

const ko: Dictionary = {
  meta: {
    title: "Blue Meteor Studio",
    titleSuffix: "게임 개발사",
    description:
      "Blue Meteor Studio는 게임을 만드는 개발사입니다. Last Marble Crusher와 Ninefall Survivors를 개발하고 있습니다.",
  },
  a11y: {
    skip: "본문으로 건너뛰기",
    home: "Blue Meteor Studio, 페이지 맨 위로",
    mainNav: "섹션",
    language: "언어",
    newTab: "새 탭에서 열림",
  },
  nav: {
    about: "소개",
    games: "대표작",
  },
  hero: {
    lead: "게임을 만듭니다.",
    cta: "대표작 보기",
    nowLabel: "개발 중",
  },
  about: {
    heading: "소개",
    statement:
      "Blue Meteor Studio는 게임을 만드는 개발사입니다. 지금은 <strong>Last Marble Crusher</strong>와 <strong>Ninefall Survivors</strong>, 두 게임을 개발하고 있습니다.",
    detail:
      "Last Marble Crusher는 개발 중인 버전을 웹 브라우저에서 바로 플레이할 수 있습니다. Ninefall Survivors는 준비되는 대로 소식을 전하겠습니다.",
  },
  games: {
    heading: "대표작",
    intro: "두 게임 모두 개발 중입니다.",
    status: "개발 중",
    play: "웹에서 플레이",
    platforms: "플랫폼",
    platformLive: "플레이 가능",
    platformPlanned: "준비 중",
    shots: "스크린샷",
    showShot: "스크린샷 보기",
  },
  footer: {
    tagline: "게임 개발사",
    site: "사이트",
    games: "게임",
    elsewhere: "채널",
    rights: "All rights reserved.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, ko };

export function useTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}

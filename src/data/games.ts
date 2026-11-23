// The games the site shows, in the order it shows them. Texts are per language; pictures too, where the
// game's screen has words on it.
import type { ImageMetadata } from "astro";
import type { Locale } from "../i18n";

import lmcSwarmEn from "../assets/games/last-marble-crusher/en/swarm.webp";
import lmcFormationEn from "../assets/games/last-marble-crusher/en/formation.webp";
import lmcBossEn from "../assets/games/last-marble-crusher/en/boss.webp";
import lmcCardsEn from "../assets/games/last-marble-crusher/en/cards.webp";
import lmcInventoryEn from "../assets/games/last-marble-crusher/en/inventory.webp";
import lmcSwarmKo from "../assets/games/last-marble-crusher/ko/swarm.webp";
import lmcFormationKo from "../assets/games/last-marble-crusher/ko/formation.webp";
import lmcBossKo from "../assets/games/last-marble-crusher/ko/boss.webp";
import lmcCardsKo from "../assets/games/last-marble-crusher/ko/cards.webp";
import lmcInventoryKo from "../assets/games/last-marble-crusher/ko/inventory.webp";

type Localized<T> = Record<Locale, T>;

export type FeatureIconName = "collide" | "health" | "gems" | "browser";

export interface Shot {
  image: ImageMetadata;
  /** What the picture shows, for someone who cannot see it. */
  alt: string;
  /** A word or two, for the picture's button. */
  label: string;
}

export interface Feature {
  icon: FeatureIconName;
  title: string;
  body: string;
}

export interface Platform {
  name: string;
  /** "live": can be played there now. "planned": being prepared. */
  state: "live" | "planned";
}

export interface Game {
  /** The game's place on the page: /#<id>. */
  id: string;
  title: string;
  /** The title's words; the accented one is drawn in the accent colour, as on the game's own title. */
  titleWords: { text: string; accent?: boolean }[];
  tagline?: Localized<string>;
  summary: Localized<string>;
  features?: Localized<Feature[]>;
  platforms?: Platform[];
  /** Where the game can be played. */
  playUrl?: string;
  shots?: Localized<Shot[]>;
  shotsNote?: Localized<string>;
}

const lastMarbleCrusher: Game = {
  id: "last-marble-crusher",
  title: "Last Marble Crusher",
  titleWords: [{ text: "Last" }, { text: "Marble", accent: true }, { text: "Crusher" }],
  tagline: {
    en: "A marble survival game with no weapons.",
    ko: "무기 없는 구슬 서바이벌.",
  },
  summary: {
    en: "Your marble is the attack, and its health is its power. Crash into the swarm that closes in from every side, break it apart, and gather gems into a build of your own.",
    ko: "내 구슬이 곧 공격이고, 체력이 곧 파워입니다. 사방에서 몰려오는 구슬 떼에 몸으로 부딪혀 부수고, 잼을 모아 나만의 빌드를 완성하세요.",
  },
  features: {
    en: [
      {
        icon: "collide",
        title: "Collision is the attack",
        body: "There are no weapons. Your marble breaks enemies by running into them.",
      },
      {
        icon: "health",
        title: "Health is power",
        body: "The number on a marble is its health. The more health yours can hold, the harder it hits.",
      },
      {
        icon: "gems",
        title: "Builds made of gems",
        body: "Choose a gem at every level-up. Link support gems to a skill gem to make the skill stronger.",
      },
      {
        icon: "browser",
        title: "Straight from the browser",
        body: "Nothing to install. It plays in a browser, on a computer or on a phone.",
      },
    ],
    ko: [
      {
        icon: "collide",
        title: "부딪히는 것이 공격",
        body: "무기가 없습니다. 내 구슬이 직접 부딪혀 적을 부숩니다.",
      },
      {
        icon: "health",
        title: "체력이 곧 파워",
        body: "구슬에 적힌 숫자가 체력입니다. 최대 체력이 클수록 더 세게 부딪힙니다.",
      },
      {
        icon: "gems",
        title: "잼으로 만드는 빌드",
        body: "레벨이 오를 때마다 잼을 고릅니다. 스킬 잼에 보조 잼을 이어 기술을 강화합니다.",
      },
      {
        icon: "browser",
        title: "브라우저에서 바로",
        body: "설치할 것이 없습니다. PC와 휴대폰의 브라우저에서 바로 플레이합니다.",
      },
    ],
  },
  platforms: [
    { name: "Web", state: "live" },
    { name: "Android", state: "planned" },
  ],
  playUrl: "https://last-marble-crusher-d2edf.web.app/",
  shots: {
    en: [
      {
        image: lmcSwarmEn,
        alt: "A glowing blue marble in the middle of the arena, with a swarm of red marbles, each with a number on it, closing in.",
        label: "The swarm",
      },
      {
        image: lmcFormationEn,
        alt: "Dark marbles ringed in orange cross the arena in formation while the blue marble fights the swarm.",
        label: "Formations",
      },
      {
        image: lmcBossEn,
        alt: "A huge black marble with a large number on it stands in the arena, ringed by smaller marbles.",
        label: "The final boss",
      },
      {
        image: lmcCardsEn,
        alt: "The level-up screen: three gem cards to choose from.",
        label: "Level up",
      },
      {
        image: lmcInventoryEn,
        alt: "The inventory: gems placed in a grid of cells that are linked to each other.",
        label: "Inventory",
      },
    ],
    ko: [
      {
        image: lmcSwarmKo,
        alt: "경기장 한가운데에서 빛나는 파란 구슬을 숫자가 적힌 붉은 구슬 떼가 둘러싸며 몰려온다.",
        label: "구슬 떼",
      },
      {
        image: lmcFormationKo,
        alt: "파란 구슬이 구슬 떼와 싸우는 동안, 주황 고리를 두른 검은 구슬들이 대형을 이루어 경기장을 가로지른다.",
        label: "패턴",
      },
      {
        image: lmcBossKo,
        alt: "큰 숫자가 적힌 거대한 검은 구슬이 작은 구슬들에 둘러싸여 경기장에 서 있다.",
        label: "최종 보스",
      },
      {
        image: lmcCardsKo,
        alt: "레벨업 화면. 잼 카드 세 장 가운데 하나를 고른다.",
        label: "레벨업",
      },
      {
        image: lmcInventoryKo,
        alt: "인벤토리 화면. 서로 이어진 칸에 잼이 놓여 있다.",
        label: "인벤토리",
      },
    ],
  },
  shotsNote: {
    en: "Screens are from a build in development and may change.",
    ko: "개발 중인 빌드의 화면이며, 바뀔 수 있습니다.",
  },
};

const ninefallSurvivors: Game = {
  id: "ninefall-survivors",
  title: "Ninefall Survivors",
  titleWords: [{ text: "Ninefall" }, { text: "Survivors" }],
  summary: {
    en: "A new game in development. We will share more here when it is ready.",
    ko: "새로 개발하고 있는 게임입니다. 준비되는 대로 이곳에서 소식을 전하겠습니다.",
  },
};

export const games: Game[] = [lastMarbleCrusher, ninefallSurvivors];

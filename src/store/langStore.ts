import { create } from 'zustand';
import { strings } from '../i18n/strings';
import type { Lang, Strings } from '../i18n/strings';

interface LangState {
  lang: Lang;
  t: Strings;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: 'ko',
  t: strings.ko,
  setLang: (lang) => set({ lang, t: strings[lang] }),
}));

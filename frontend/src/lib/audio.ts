// Bankai audio engine.
//
// Strategy (graceful):
//   1. If a voice clip is mapped for the character (see CLIP_FILES), play it.
//   2. Otherwise, SPEAK the bankai name with the browser's Web Speech API (speechSynthesis),
//      tuned low + slow for a dramatic "release" delivery.
//
// We deliberately speak only the short bankai *name* ("Bankai. <name>.") — never a full
// incantation — to keep the project free of copyrighted text/audio.

import type { Character } from '../data/characters';

// Maps a character id to its clip in `public/audio/`. The files were added with
// descriptive names (some with spaces/diacritics), so we keep the real filename here and
// URL-encode it at lookup time. Characters without an entry fall back to speech.
const CLIP_FILES: Partial<Record<string, string>> = {
  ichigo: 'ichigo-bankai tensa zangetsu.mp3',
  byakuya: 'Bykuga-Senbonzakura Kageyoshi.mp3',
  toshiro: 'hiyo-himaru.mp3',
  renji: 'Renji-Bankai Hihiō Zabimaru.mp3',
  soifon: 'Siu-feng-Bankai Jakuhō Raikōben.mp3',
  gin: 'Gin-Bankai Kamishini no Yari.mp3',
  ikkaku: 'Ikaku-Bankai Ryūmon Hōzukimaru.mp3',
  shunsui: 'shunsui-bankai.mp3',
};

export interface PlayResult {
  /** 'clip' if an mp3 played, 'speech' if synthesized, 'silent' if neither was possible. */
  mode: 'clip' | 'speech' | 'silent';
  /** Resolves when playback (clip or utterance) finishes. */
  done: Promise<void>;
}

function clipUrl(id: string): string | null {
  const file = CLIP_FILES[id];
  return file ? `${import.meta.env.BASE_URL}audio/${encodeURIComponent(file)}` : null;
}

function tryClip(id: string): Promise<PlayResult | null> {
  return new Promise((resolve) => {
    const url = clipUrl(id);
    if (!url) {
      resolve(null);
      return;
    }
    const audio = new Audio(url);
    audio.preload = 'auto';
    let settled = false;
    const fail = () => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    };
    audio.addEventListener('error', fail, { once: true });
    audio
      .play()
      .then(() => {
        if (settled) return;
        settled = true;
        const done = new Promise<void>((res) => {
          audio.addEventListener('ended', () => res(), { once: true });
        });
        resolve({ mode: 'clip', done });
      })
      .catch(fail);
  });
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  if (voices.length === 0) return undefined;
  // Prefer a Japanese voice for the name if available, else a deep/clear English one.
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('ja')) ??
    voices.find((v) => /male|daniel|google uk english male/i.test(v.name)) ??
    voices[0]
  );
}

function speak(character: Character): PlayResult {
  if (!('speechSynthesis' in window)) {
    return { mode: 'silent', done: Promise.resolve() };
  }
  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(`Bankai. ${character.bankai}.`);
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  utter.rate = 0.82;
  utter.pitch = 0.7;
  utter.volume = 1;

  const done = new Promise<void>((resolve) => {
    utter.addEventListener('end', () => resolve(), { once: true });
    utter.addEventListener('error', () => resolve(), { once: true });
  });
  synth.speak(utter);
  return { mode: 'speech', done };
}

/** Release the bankai: clip if present, otherwise synthesized speech. */
export async function releaseBankai(character: Character): Promise<PlayResult> {
  const clip = await tryClip(character.id);
  return clip ?? speak(character);
}

/** Warm up the speech engine (voices load async in some browsers). Call once on mount. */
export function primeSpeech(): void {
  if ('speechSynthesis' in window) {
    // Touching getVoices kicks off async load in Chrome.
    window.speechSynthesis.getVoices();
  }
}

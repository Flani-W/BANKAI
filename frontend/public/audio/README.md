# Bankai voice clips (optional drop-in)

Drop an mp3 named after the character id to play a real voice line when the user hits
**Release Bankai**:

```
ichigo.mp3  byakuya.mp3  toshiro.mp3  ...
```

- Format: `.mp3`. Keep clips short (1–4s) — e.g. a voiced "Bankai" + the bankai name.
- If a clip is missing, the app speaks the bankai name with the browser's speech engine
  (Web Speech API) as a fallback.
- Use audio you have the rights to. Don't ship copyrighted recordings in a public repo.

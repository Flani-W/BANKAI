# 3D models (optional drop-in)

Drop a glTF binary named after the character id to render a real 3D model instead of
the procedural billboard:

```
ichigo.glb  byakuya.glb  toshiro.glb  ...
```

- Format: `.glb` (binary glTF). The scene auto-centers and scales it to fit.
- The app does a quick HEAD check; if `<id>.glb` isn't present it falls back to the
  procedural avatar with zero errors.
- Keep models reasonably light (≤ ~10 MB) so the page stays fast.
- Use models you have the rights to.

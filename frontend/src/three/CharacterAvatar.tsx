import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Character } from '../data/characters';

/** Build a portrait texture on a canvas (no image assets required). */
function usePortraitTexture(character: Character): THREE.CanvasTexture {
  return useMemo(() => {
    const w = 512;
    const h = 700;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // backdrop gradient in signature colors
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, character.color);
    g.addColorStop(0.55, '#0a0d16');
    g.addColorStop(1, '#05060a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // radial glow
    const rg = ctx.createRadialGradient(w / 2, h * 0.36, 20, w / 2, h * 0.36, w * 0.7);
    rg.addColorStop(0, `${character.accent}aa`);
    rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);

    // big thematic kanji
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '900 300px "Yu Gothic", "Hiragino Sans", "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = character.color;
    ctx.shadowBlur = 60;
    ctx.fillText(character.glyph, w / 2, h * 0.36);
    ctx.shadowBlur = 0;

    // name plate
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.font = '700 40px "Cinzel", Georgia, serif';
    ctx.fillText(character.name.toUpperCase(), w / 2, h * 0.82);
    ctx.fillStyle = character.color;
    ctx.font = '600 22px "Rajdhani", sans-serif';
    ctx.fillText(character.bankai.toUpperCase(), w / 2, h * 0.88);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [character]);
}

/** Procedural avatar used by default and as the GLB loading/missing fallback. */
function ProceduralAvatar({ character, released }: { character: Character; released: boolean }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const texture = usePortraitTexture(character);
  const color = useMemo(() => new THREE.Color(character.color), [character.color]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.8) * 0.08;
      group.current.rotation.y = Math.sin(t * 0.25) * 0.18;
    }
    if (ring.current) {
      ring.current.rotation.z += dt * (released ? 1.4 : 0.5);
      const s = 1 + (released ? 0.25 : 0) + Math.sin(t * 2) * 0.02;
      ring.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      {/* portrait billboard */}
      <mesh position={[0, 0.4, 0]}>
        <planeGeometry args={[2, 2.7]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
      {/* halo ring behind */}
      <mesh ref={ring} position={[0, 0.4, -0.4]}>
        <torusGeometry args={[1.7, 0.02, 16, 96]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Loads a user-provided GLB at /models/<id>.glb. */
function GltfAvatar({ url, released }: { url: string; released: boolean }) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);

  // center + scale the model to a consistent size
  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = 2.6 / Math.max(size.x, size.y, size.z);
    clone.position.sub(center);
    clone.scale.setScalar(scale);
    return clone;
  }, [scene]);

  useFrame((state, dt) => {
    if (group.current) {
      group.current.rotation.y += dt * (released ? 0.6 : 0.2);
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <primitive object={prepared} />
    </group>
  );
}

/**
 * Checks if a GLB actually exists for this character. We must reject the dev server's
 * SPA fallback: a missing `/models/<id>.glb` is answered with `200 text/html` (the app
 * shell), so a naive `r.ok` check would try to parse HTML as a model and crash the scene.
 */
function useOptionalModelUrl(id: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const candidate = `${import.meta.env.BASE_URL}models/${id}.glb`;
    fetch(candidate, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') ?? '';
        const isRealModel = r.ok && !type.includes('text/html');
        if (active) setUrl(isRealModel ? candidate : null);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [id]);
  return url;
}

/** Catches any model load/parse error and shows the procedural avatar instead of blanking. */
class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function CharacterAvatar({ character, released }: { character: Character; released: boolean }) {
  const modelUrl = useOptionalModelUrl(character.id);

  if (modelUrl) {
    const fallback = <ProceduralAvatar character={character} released={released} />;
    return (
      <ModelErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <GltfAvatar url={modelUrl} released={released} />
        </Suspense>
      </ModelErrorBoundary>
    );
  }
  return <ProceduralAvatar character={character} released={released} />;
}

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  color: string;
  released: boolean;
}

/** A swirling disc of points (reiatsu) — fans out and accelerates on release. */
function buildDisc(count: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.6) * 3.2 + 0.3;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5 - 0.4;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return geo;
}

/** A vertical column of points streaming upward around the character. */
function buildColumn(count: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 0.6 + Math.random() * 1.6;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 5 - 1.5;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return geo;
}

export function EnergyField({ color, released }: Props) {
  const disc = useRef<THREE.Points>(null);
  const column = useRef<THREE.Points>(null);
  const intensity = useRef(0.25);

  const discGeo = useMemo(() => buildDisc(4400), []);
  const colGeo = useMemo(() => buildColumn(2400), []);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: 0.035,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color],
  );

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const target = released ? 1 : 0.25;
    intensity.current += (target - intensity.current) * Math.min(1, d * 2.4);
    const k = intensity.current;

    if (disc.current) {
      disc.current.rotation.y += d * (0.15 + k * 0.8);
      disc.current.scale.setScalar(1 + k * 0.45);
    }
    if (column.current) {
      column.current.rotation.y -= d * (0.1 + k * 0.5);
      column.current.scale.set(1 + k * 0.2, 1 + k * 0.7, 1 + k * 0.2);
    }
    mat.size = 0.028 + k * 0.05;
    mat.opacity = 0.45 + k * 0.5;
  });

  return (
    <group>
      <points ref={disc} geometry={discGeo} material={mat} />
      <points ref={column} geometry={colGeo} material={mat} />
    </group>
  );
}

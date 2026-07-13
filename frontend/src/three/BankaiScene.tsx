import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type { Character } from '../data/characters';
import { EnergyField } from './EnergyField';
import { CharacterAvatar } from './CharacterAvatar';

export function BankaiScene({ character, released }: { character: Character; released: boolean }) {
  return (
    <Canvas
      className="char-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 0.6, 6.2], fov: 42 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 9, 20]} />

      <ambientLight intensity={0.5} />
      <pointLight position={[4, 5, 5]} intensity={1.1} color={character.accent} />
      <pointLight position={[-5, -2, -3]} intensity={0.6} color={character.color} />

      <Stars radius={60} depth={40} count={2500} factor={4} saturation={0} fade speed={0.6} />

      <EnergyField color={character.color} released={released} />
      <CharacterAvatar character={character} released={released} />

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={released ? 1.7 : 0.9}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>

      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={9}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={released ? 1.2 : 0.4}
      />
    </Canvas>
  );
}

"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function archShape(width: number, height: number) {
  const r = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-r, 0);
  shape.lineTo(-r, height - r);
  shape.absarc(0, height - r, r, Math.PI, 0, true);
  shape.lineTo(r, 0);
  shape.lineTo(-r, 0);
  return shape;
}

function Arch({ x, glow }: { x: number; glow: string }) {
  const frameGeometry = useMemo(() => {
    const shape = archShape(1.15, 2.15);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 3,
      curveSegments: 32,
    });
  }, []);

  const paneGeometry = useMemo(() => {
    const shape = archShape(0.92, 1.9);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.03,
      bevelEnabled: false,
      curveSegments: 32,
    });
  }, []);

  return (
    <group position={[x, 0, 0]}>
      <mesh geometry={frameGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#f4efe3" roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh geometry={paneGeometry} position={[0, 0.14, 0.2]}>
        <meshStandardMaterial
          color="#0d0d0b"
          emissive={glow}
          emissiveIntensity={0.35}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      <pointLight
        position={[0, 1.5, -0.6]}
        color={glow}
        intensity={2.2}
        distance={3.2}
        decay={2}
      />
    </group>
  );
}

function CoffeeCup() {
  return (
    <group position={[0, 0.001, 1.55]} scale={1.35}>
      <mesh castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.22, 0.17, 0.32, 32]} />
        <meshStandardMaterial color="#f4efe3" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.325, 0]}>
        <cylinderGeometry args={[0.225, 0.22, 0.02, 32]} />
        <meshStandardMaterial color="#b9924f" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.03, 32]} />
        <meshStandardMaterial color="#b9924f" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0a0a09"]} />
      <fog attach="fog" args={["#0a0a09", 8, 16]} />

      <ambientLight intensity={0.45} color="#f4efe3" />
      <hemisphereLight args={["#3a3630", "#0a0a09", 0.6]} />
      <directionalLight
        position={[3, 5, 3]}
        intensity={0.9}
        color="#fff6e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Arch x={-1.55} glow="#e3cd97" />
      <Arch x={0} glow="#c9a44c" />
      <Arch x={1.55} glow="#e3cd97" />

      <CoffeeCup />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#15130f" roughness={0.95} />
      </mesh>

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.6}
        scale={8}
        blur={2.2}
        far={2}
        color="#000000"
      />

      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={0.7}
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={11}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.3}
        target={[0, 0.6, 0]}
      />
    </>
  );
}

export default function ShopScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 3.2, 8], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      className="absolute inset-0"
    >
      <Scene />
    </Canvas>
  );
}

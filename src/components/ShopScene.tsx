"use client";
/* eslint-disable react-hooks/immutability */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------- facade proportions -------------------------------- */
/* Matched to the real storefront: a tall boxy white volume, three narrow black-framed
   arches clustered right of centre, embossed logo on the left panel, round porthole
   on the right, small wall lettering on the pier beside the middle arch.            */

const WALL_LEFT = -3.3;
const WALL_RIGHT = 2.45;
const WALL_H = 3.6;
const WALL_Z = 0.4;
const WALL_T = 0.25;

const ARCH_X = [-1.3, 0, 1.3];
const ARCH_W = 0.85;
const ARCH_H = 2.35;
const DOOR_HALF = 0.38;

const PORTHOLE = { x: 2.0, y: 2.5, r: 0.2 };

const SHELL_DEPTH = 4.3;

/* ---------------------------------- geometry helpers -------------------------------- */

function archPath(cx: number, width: number, height: number) {
  const r = width / 2;
  const p = new THREE.Path();
  p.moveTo(cx - r, 0);
  p.lineTo(cx - r, height - r);
  p.absarc(cx, height - r, r, Math.PI, 0, true);
  p.lineTo(cx + r, 0);
  p.lineTo(cx - r, 0);
  return p;
}

function archShape(width: number, height: number) {
  const r = width / 2;
  const s = new THREE.Shape();
  s.moveTo(-r, 0);
  s.lineTo(-r, height - r);
  s.absarc(0, height - r, r, Math.PI, 0, true);
  s.lineTo(r, 0);
  s.lineTo(-r, 0);
  return s;
}

/* -------------------------------------- facade --------------------------------------- */

function FrontWall() {
  const geometry = useMemo(() => {
    const outer = new THREE.Shape();
    outer.moveTo(WALL_LEFT, 0);
    outer.lineTo(WALL_RIGHT, 0);
    outer.lineTo(WALL_RIGHT, WALL_H);
    outer.lineTo(WALL_LEFT, WALL_H);
    outer.lineTo(WALL_LEFT, 0);

    ARCH_X.forEach((x) => outer.holes.push(archPath(x, ARCH_W, ARCH_H)));

    const hole = new THREE.Path();
    hole.absarc(PORTHOLE.x, PORTHOLE.y, PORTHOLE.r, 0, Math.PI * 2, false);
    outer.holes.push(hole);

    return new THREE.ExtrudeGeometry(outer, {
      depth: WALL_T,
      bevelEnabled: false,
      curveSegments: 28,
    });
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0, WALL_Z]}>
      <meshStandardMaterial color="#f2eee6" roughness={0.9} />
    </mesh>
  );
}

/** Hollow arched ring, used for the black window frames. */
function archRingShape(w: number, h: number, t: number) {
  const outer = archShape(w, h);
  const r = (w - 2 * t) / 2;
  const y0 = t * 0.5;
  const inner = new THREE.Path();
  inner.moveTo(-r, y0);
  inner.lineTo(-r, h - t - r);
  inner.absarc(0, h - t - r, r, Math.PI, 0, true);
  inner.lineTo(r, y0);
  inner.lineTo(-r, y0);
  outer.holes.push(inner);
  return outer;
}

/** Dark frame + glass set into each arched opening. */
function ArchGlazing({ x, isDoor }: { x: number; isDoor?: boolean }) {
  const frameGeo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(archRingShape(ARCH_W, ARCH_H, 0.06), {
        depth: 0.06,
        bevelEnabled: false,
        curveSegments: 28,
      }),
    []
  );
  const glassGeo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(archShape(ARCH_W - 0.12, ARCH_H - 0.12), {
        depth: 0.02,
        bevelEnabled: false,
        curveSegments: 28,
      }),
    []
  );

  return (
    <group position={[x, 0, WALL_Z + 0.09]}>
      <mesh geometry={frameGeo} position={[0, 0, -0.02]}>
        <meshStandardMaterial color="#16181a" roughness={0.45} metalness={0.3} />
      </mesh>
      {!isDoor && (
        <mesh geometry={glassGeo} position={[0, 0.06, 0.01]}>
          <meshStandardMaterial
            color="#20272b"
            transparent
            opacity={0.55}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

function Porthole() {
  return (
    <group position={[PORTHOLE.x, PORTHOLE.y, WALL_Z + 0.09]}>
      <mesh>
        <ringGeometry args={[PORTHOLE.r - 0.05, PORTHOLE.r, 32]} />
        <meshStandardMaterial color="#16181a" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[PORTHOLE.r - 0.04, 32]} />
        <meshStandardMaterial
          color="#20272b"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

/** Embossed white logo mark on the left wall panel. */
function WallLogo() {
  const loaded = useLoader(THREE.TextureLoader, "/images/logo-mark.png");

  // The source art is dark-on-transparent; repaint it white while keeping the
  // artwork's alpha so it reads as the raised white sign on the facade.
  const texture = useMemo(() => {
    const img = loaded.image as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = img.width || 512;
    canvas.height = img.height || 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [loaded]);

  return (
    <mesh position={[-2.2, 2.5, WALL_Z + WALL_T + 0.02]}>
      <planeGeometry args={[1.1, 1.1]} />
      <meshStandardMaterial map={texture} transparent roughness={0.85} />
    </mesh>
  );
}

/** Small dark lettering on the pier, as on the real wall. */
function WallLettering() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#2e2c28";
      ctx.font = "600 34px Inter, Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "3px";
      ctx.fillText("Y STREET COFFEE", canvas.width / 2, canvas.height / 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh position={[0.68, 2.2, WALL_Z + WALL_T + 0.02]}>
      <planeGeometry args={[0.62, 0.078]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function Shell() {
  const backZ = WALL_Z - SHELL_DEPTH;
  const width = WALL_RIGHT - WALL_LEFT;
  const cx = (WALL_LEFT + WALL_RIGHT) / 2;
  return (
    <group>
      <mesh position={[WALL_LEFT, WALL_H / 2, WALL_Z - SHELL_DEPTH / 2]}>
        <boxGeometry args={[0.22, WALL_H, SHELL_DEPTH]} />
        <meshStandardMaterial color="#eae5da" roughness={0.9} />
      </mesh>
      <mesh position={[WALL_RIGHT, WALL_H / 2, WALL_Z - SHELL_DEPTH / 2]}>
        <boxGeometry args={[0.22, WALL_H, SHELL_DEPTH]} />
        <meshStandardMaterial color="#eae5da" roughness={0.9} />
      </mesh>
      <mesh position={[cx, WALL_H / 2, backZ]}>
        <boxGeometry args={[width, WALL_H, 0.2]} />
        <meshStandardMaterial color="#eae5da" roughness={0.9} />
      </mesh>
      <mesh
        position={[cx, WALL_H, WALL_Z - SHELL_DEPTH / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, SHELL_DEPTH]} />
        <meshStandardMaterial
          color="#ded8cb"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* parapet cap */}
      <mesh position={[cx, WALL_H + 0.1, WALL_Z - 0.05]}>
        <boxGeometry args={[width + 0.16, 0.2, 0.5]} />
        <meshStandardMaterial color="#f2eee6" roughness={0.9} />
      </mesh>
      {/* plinth / step */}
      <mesh position={[cx, 0.03, WALL_Z + 0.55]}>
        <boxGeometry args={[width + 0.1, 0.06, 1.3]} />
        <meshStandardMaterial color="#e2ddd2" roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ------------------------------------- exterior ---------------------------------------- */

function CafeChair({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.36, 0.04, 0.36]} />
        <meshStandardMaterial color="#f7f5f0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.66, -0.16]}>
        <boxGeometry args={[0.34, 0.44, 0.04]} />
        <meshStandardMaterial color="#f7f5f0" roughness={0.6} />
      </mesh>
      {[
        [0.14, 0.14],
        [-0.14, 0.14],
        [0.14, -0.14],
        [-0.14, -0.14],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.21, lz]}>
          <cylinderGeometry args={[0.016, 0.016, 0.42, 6]} />
          <meshStandardMaterial color="#f7f5f0" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function CafeTable({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.03, 24]} />
        <meshStandardMaterial color="#f7f5f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 10]} />
        <meshStandardMaterial color="#f7f5f0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.03, 20]} />
        <meshStandardMaterial color="#f7f5f0" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 1.8, 8]} />
        <meshStandardMaterial color="#5a4632" roughness={0.9} />
      </mesh>
      {[
        [0, 2.0, 0, 0.5],
        [0.22, 1.8, 0.1, 0.36],
        [-0.2, 1.88, -0.08, 0.33],
        [0.04, 2.24, -0.14, 0.28],
      ].map(([px, py, pz, s], i) => (
        <mesh key={i} position={[px, py, pz]} scale={[s, s * 0.62, s]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#54663f" roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function ParkingStripe({ x }: { x: number }) {
  return (
    <mesh position={[x, 0.012, 4.6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.1, 2.6]} />
      <meshBasicMaterial color="#d9b53c" toneMapped={false} />
    </mesh>
  );
}

function Exterior() {
  return (
    <group>
      {/* forecourt */}
      <mesh position={[-0.4, 0, 3.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#c9c5bc" roughness={0.98} />
      </mesh>

      {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
        <ParkingStripe key={x} x={x} />
      ))}

      {/* seating tight against the facade, as in the photo */}
      <CafeTable x={-1.95} z={1.35} />
      <CafeChair x={-1.95} z={1.75} ry={Math.PI} />
      <CafeTable x={0.75} z={1.35} />
      <CafeChair x={0.75} z={1.75} ry={Math.PI} />
      <CafeChair x={1.95} z={1.5} ry={Math.PI * 0.9} />

      <Tree x={3.6} z={0.4} />
    </group>
  );
}

/* ------------------------------------- interior ---------------------------------------- */

function PendantLight({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, WALL_H, z]}>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
        <meshStandardMaterial color="#2a2a28" />
      </mesh>
      <mesh position={[0, -0.74, 0]}>
        <cylinderGeometry args={[0.13, 0.1, 0.14, 20]} />
        <meshStandardMaterial
          color="#171613"
          emissive="#e3cd97"
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </mesh>
      <pointLight
        position={[0, -0.8, 0]}
        color="#e3cd97"
        intensity={1.2}
        distance={3}
        decay={2}
      />
    </group>
  );
}

function Counter() {
  return (
    <group position={[-0.5, 0, -3.3]}>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[3.4, 0.96, 0.62]} />
        <meshStandardMaterial color="#f2eee6" roughness={0.7} />
      </mesh>
      <mesh position={[0.95, 1.08, -0.04]}>
        <boxGeometry args={[0.72, 0.36, 0.38]} />
        <meshStandardMaterial color="#1b1a18" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0.95, 1.33, -0.04]}>
        <cylinderGeometry args={[0.08, 0.09, 0.14, 14]} />
        <meshStandardMaterial color="#1b1a18" roughness={0.4} />
      </mesh>
      <mesh position={[-0.95, 1.06, -0.06]}>
        <boxGeometry args={[1.0, 0.3, 0.34]} />
        <meshStandardMaterial color="#e6e0d2" roughness={0.6} />
      </mesh>
    </group>
  );
}

function LoungeSet({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 20]} />
        <meshStandardMaterial color="#8a6a45" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.34, 8]} />
        <meshStandardMaterial color="#8a6a45" roughness={0.65} />
      </mesh>
      {[
        [0.62, 0],
        [-0.62, Math.PI],
      ].map(([cx, ry], i) => (
        <group key={i} position={[cx, 0, 0]} rotation={[0, ry, 0]}>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.46, 0.26, 0.5]} />
            <meshStandardMaterial color="#c2b9a6" roughness={0.85} />
          </mesh>
          <mesh position={[0.26, 0.5, 0]}>
            <boxGeometry args={[0.08, 0.5, 0.5]} />
            <meshStandardMaterial color="#c2b9a6" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Interior() {
  const cx = (WALL_LEFT + WALL_RIGHT) / 2;
  return (
    <group>
      <mesh
        position={[cx, 0.005, WALL_Z - SHELL_DEPTH / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[WALL_RIGHT - WALL_LEFT - 0.2, SHELL_DEPTH]} />
        <meshStandardMaterial color="#eae5da" roughness={0.95} />
      </mesh>

      <Counter />
      <LoungeSet x={-2.1} z={-1.1} />
      <LoungeSet x={1.1} z={-1.6} />

      <PendantLight x={-1.6} z={-1.2} />
      <PendantLight x={0.8} z={-1.2} />
      <PendantLight x={-0.5} z={-2.9} />
    </group>
  );
}

/* -------------------------------------- collision --------------------------------------- */

const WALL_BACK = WALL_Z - 0.06;
const WALL_FRONT = WALL_Z + WALL_T + 0.07;

function resolvePosition(prev: THREE.Vector3, next: THREE.Vector3) {
  let x = next.x;
  let z = next.z;

  const inDoorway = Math.abs(x) < DOOR_HALF;

  if (!inDoorway) {
    const landsInWall = z < WALL_FRONT && z > WALL_BACK;
    const jumpsWall =
      (prev.z >= WALL_FRONT && z <= WALL_BACK) ||
      (prev.z <= WALL_BACK && z >= WALL_FRONT);
    if (landsInWall || jumpsWall) z = prev.z;
  }

  if (z <= WALL_BACK) {
    x = THREE.MathUtils.clamp(x, WALL_LEFT + 0.45, WALL_RIGHT - 0.45);
    z = THREE.MathUtils.clamp(z, -2.55, WALL_BACK);
  } else if (z >= WALL_FRONT) {
    x = THREE.MathUtils.clamp(x, -4.2, 4.2);
    z = THREE.MathUtils.clamp(z, WALL_FRONT, 6.4);
  } else {
    x = THREE.MathUtils.clamp(x, -DOOR_HALF + 0.05, DOOR_HALF - 0.05);
    z = THREE.MathUtils.clamp(z, WALL_BACK, WALL_FRONT);
  }

  return new THREE.Vector3(x, next.y, z);
}

/* --------------------------------------- controller -------------------------------------- */

type MoveState = { f: boolean; b: boolean; l: boolean; r: boolean };
type LookState = { yaw: number; pitch: number };

function Rig({
  moveState,
  lookState,
}: {
  moveState: React.RefObject<MoveState>;
  lookState: React.RefObject<LookState>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.55, 5.2);
    camera.rotation.order = "YXZ";
  }, [camera]);

  useFrame((_, delta) => {
    const { yaw, pitch } = lookState.current;
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    const move = new THREE.Vector3();
    const m = moveState.current;
    if (m.f) move.add(forward);
    if (m.b) move.sub(forward);
    if (m.r) move.add(right);
    if (m.l) move.sub(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(2.2 * Math.min(delta, 0.05));
      const prev = camera.position.clone();
      camera.position.copy(resolvePosition(prev, prev.clone().add(move)));
    }
  });

  return null;
}

/* ------------------------------------------ scene ---------------------------------------- */

function Scene({
  moveState,
  lookState,
}: {
  moveState: React.RefObject<MoveState>;
  lookState: React.RefObject<LookState>;
}) {
  return (
    <>
      <color attach="background" args={["#0a0a09"]} />
      <fog attach="fog" args={["#0a0a09", 11, 19]} />

      <ambientLight intensity={0.75} color="#fdfaf2" />
      <hemisphereLight args={["#eaf1ff", "#b8b2a4", 0.7]} />
      <directionalLight position={[5, 7, 5]} intensity={1.15} color="#fff8ea" />
      <directionalLight position={[-4, 4, -2]} intensity={0.3} color="#e3cd97" />

      <FrontWall />
      {ARCH_X.map((x) => (
        <ArchGlazing key={x} x={x} isDoor={x === 0} />
      ))}
      <Porthole />
      <Suspense fallback={null}>
        <WallLogo />
      </Suspense>
      <WallLettering />
      <Shell />
      <Exterior />
      <Interior />

      <ContactShadows
        position={[0, 0.02, 1.8]}
        opacity={0.32}
        scale={14}
        blur={2.6}
        far={2.4}
        resolution={512}
        frames={1}
        color="#000000"
      />

      <Rig moveState={moveState} lookState={lookState} />
    </>
  );
}

/* --------------------------------------- outer wrapper ------------------------------------ */

export default function ShopScene() {
  const moveState = useRef<MoveState>({ f: false, b: false, l: false, r: false });
  const lookState = useRef<LookState>({ yaw: 0, pitch: -0.04 });
  const dragState = useRef({ active: false, x: 0, y: 0 });
  const [hint, setHint] = useState(true);

  const setMove = (key: keyof MoveState, val: boolean) => {
    moveState.current[key] = val;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { active: true, x: e.clientX, y: e.clientY };
    setHint(false);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.x;
    const dy = e.clientY - dragState.current.y;
    dragState.current.x = e.clientX;
    dragState.current.y = e.clientY;
    lookState.current.yaw -= dx * 0.0035;
    lookState.current.pitch = THREE.MathUtils.clamp(
      lookState.current.pitch - dy * 0.0035,
      -0.5,
      0.4
    );
  };
  const onPointerUp = () => {
    dragState.current.active = false;
  };

  useEffect(() => {
    // Typing in a text field elsewhere on the page must not walk the camera.
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      if (["w", "W", "ArrowUp"].includes(e.key)) setMove("f", true);
      if (["s", "S", "ArrowDown"].includes(e.key)) setMove("b", true);
      if (["a", "A", "ArrowLeft"].includes(e.key)) setMove("l", true);
      if (["d", "D", "ArrowRight"].includes(e.key)) setMove("r", true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      if (["w", "W", "ArrowUp"].includes(e.key)) setMove("f", false);
      if (["s", "S", "ArrowDown"].includes(e.key)) setMove("b", false);
      if (["a", "A", "ArrowLeft"].includes(e.key)) setMove("l", false);
      if (["d", "D", "ArrowRight"].includes(e.key)) setMove("r", false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="absolute inset-0"
      >
        <Scene moveState={moveState} lookState={lookState} />
      </Canvas>

      {hint && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
          <span className="rounded-full border border-gold/30 bg-obsidian/60 px-4 py-1.5 text-center text-[0.65rem] uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
            Drag to look &middot; WASD or arrows to walk in
          </span>
        </div>
      )}
    </div>
  );
}

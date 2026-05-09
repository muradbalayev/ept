import { Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { Telemetry } from "../types/telemetry";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function Coil({ currentRatio }: { currentRatio: number }) {
  const rings = Array.from({ length: 9 }, (_, index) => index);
  return (
    <group position={[0, 0.85, 0]}>
      {rings.map((ring) => (
        <mesh key={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, ring * 0.035 - 0.14, 0]}>
          <torusGeometry args={[0.55, 0.018, 18, 90]} />
          <meshStandardMaterial color="#b96f2d" emissive="#2f1204" emissiveIntensity={0.15 + currentRatio * 0.35} metalness={0.75} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.38, 40]} />
        <meshStandardMaterial color="#303835" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function FieldLines({ currentRatio }: { currentRatio: number }) {
  const lines = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) => {
      const angle = (index / 10) * Math.PI * 2;
      const radius = 0.24 + (index % 2) * 0.13;
      const side = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      const points = [
        new THREE.Vector3(side.x * 2.2, 0.94, side.z * 2.2),
        new THREE.Vector3(side.x * 1.4, 0.52, side.z * 1.4),
        new THREE.Vector3(side.x * 0.45, 0.18, side.z * 0.45),
        new THREE.Vector3(-side.x * 0.45, 0.18, -side.z * 0.45),
        new THREE.Vector3(-side.x * 1.4, 0.52, -side.z * 1.4),
        new THREE.Vector3(-side.x * 2.2, 0.94, -side.z * 2.2),
      ];
      return new THREE.CatmullRomCurve3(points).getPoints(64);
    });
  }, []);

  return (
    <group>
      {lines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={index % 2 === 0 ? "#4fd1c5" : "#f6ad55"}
          lineWidth={1.1 + currentRatio * 2.4}
          transparent
          opacity={0.22 + currentRatio * 0.48}
        />
      ))}
    </group>
  );
}

function SensorBeam({ particleY }: { particleY: number }) {
  return (
    <group>
      <mesh position={[-0.78, particleY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 1.55, 16]} />
        <meshStandardMaterial color="#55d6be" emissive="#55d6be" emissiveIntensity={0.6} transparent opacity={0.65} />
      </mesh>
      <mesh position={[-0.82, particleY, 0]}>
        <boxGeometry args={[0.08, 0.18, 0.18]} />
        <meshStandardMaterial color="#1f2a27" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

function TargetPlane({ targetDistance }: { targetDistance: number }) {
  const y = 0.98 - targetDistance * 8;
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.006, 10, 80]} />
        <meshBasicMaterial color="#ffd166" transparent opacity={0.85} />
      </mesh>
      <Line points={[[-0.45, 0, 0], [0.45, 0, 0]]} color="#ffd166" lineWidth={1.4} transparent opacity={0.55} />
    </group>
  );
}

function TwinObjects({ telemetry }: { telemetry: Telemetry }) {
  const currentRatio = clamp(telemetry.current / 25, 0, 1);
  const particleY = clamp(0.98 - telemetry.distance * 8, -0.08, 0.78);
  const moistureRatio = clamp(telemetry.moisture / 0.4, 0, 1);

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 4, 2]} intensity={2.1} />
      <pointLight position={[0, 0.4, 1.8]} intensity={0.8 + currentRatio * 1.4} color="#0f8f84" />
      <Coil currentRatio={currentRatio} />
      <FieldLines currentRatio={currentRatio} />
      <TargetPlane targetDistance={telemetry.targetDistance} />
      <SensorBeam particleY={particleY} />
      <mesh position={[0, particleY, 0]}>
        <sphereGeometry args={[0.16 + moistureRatio * 0.035, 48, 48]} />
        <meshStandardMaterial color={moistureRatio > 0.55 ? "#7c83ff" : "#c7d3cb"} metalness={0.35} roughness={0.28} emissive="#10211d" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.04, 80]} />
        <meshStandardMaterial color="#d9e2dc" metalness={0.18} roughness={0.65} />
      </mesh>
      <gridHelper args={[2.2, 12, "#9dacA4", "#d3ded8"]} position={[0, -0.2, 0]} />
    </>
  );
}

export function DigitalTwinScene({ telemetry }: { telemetry: Telemetry }) {
  return (
    <div className="scene-frame">
      <Canvas dpr={[1, 1.7]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[1.65, 1.45, 2.05]} fov={42} />
        <color attach="background" args={["#eef3ef"]} />
        <fog attach="fog" args={["#eef3ef", 3.5, 6.5]} />
        <TwinObjects telemetry={telemetry} />
        <OrbitControls enablePan={false} minDistance={1.7} maxDistance={4.2} maxPolarAngle={Math.PI * 0.78} />
      </Canvas>
      <div className="scene-readout">
        <span>Məsafə {(telemetry.distance * 100).toFixed(2)} sm</span>
        <strong>Cərəyan {telemetry.current.toFixed(2)} A</strong>
      </div>
    </div>
  );
}

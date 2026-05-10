import { Html, Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { Telemetry } from "../types/telemetry";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function DeviceLabel({ position, children }: { position: [number, number, number]; children: string }) {
  return (
    <Html position={position} center distanceFactor={4.6}>
      <span className="scene-label">{children}</span>
    </Html>
  );
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
      <DeviceLabel position={[-1.2, particleY + 0.04, 0.02]} >Hall sensoru</DeviceLabel>
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

function MeasurementChamber({ materialFill, waterLevel }: { materialFill: number; waterLevel: number }) {
  const sandHeight = 0.12 + materialFill * 0.12;
  const waterHeight = clamp(waterLevel, 0, 1) * 0.52;

  return (
    <group position={[0, 0.25, 0]}>
      <mesh>
        <cylinderGeometry args={[0.36, 0.36, 0.74, 64, 1, true]} />
        <meshPhysicalMaterial color="#c9d7d8" roughness={0.1} metalness={0} transmission={0.45} transparent opacity={0.24} />
      </mesh>
      <mesh position={[0, -0.37, 0]}>
        <torusGeometry args={[0.36, 0.01, 12, 64]} />
        <meshStandardMaterial color="#6c7a72" />
      </mesh>
      <mesh position={[0, -0.37 + sandHeight / 2, 0]}>
        <cylinderGeometry args={[0.31, 0.32, sandHeight, 48]} />
        <meshStandardMaterial color="#d5a15e" roughness={0.92} />
      </mesh>
      {waterHeight > 0.01 && (
        <mesh position={[0, -0.35 + waterHeight / 2, 0]}>
          <cylinderGeometry args={[0.32, 0.32, waterHeight, 48]} />
          <meshStandardMaterial color="#68bce8" transparent opacity={0.36} roughness={0.18} />
        </mesh>
      )}
      <DeviceLabel position={[0.58, 0.52, 0.04]} >Ölçü kamerası</DeviceLabel>
    </group>
  );
}

function SandSupply({ flowRate, time }: { flowRate: number; time: number }) {
  const particles = Array.from({ length: 9 }, (_, index) => {
    const phase = (time * (0.25 + flowRate * 1.4) + index / 9) % 1;
    return {
      x: -0.96 + phase * 0.45,
      y: 1.22 - phase * 0.58,
      z: ((index % 3) - 1) * 0.025,
      visible: flowRate > 0.02,
    };
  });

  return (
    <group>
      <mesh position={[-1.08, 1.32, 0]} rotation={[0, 0, -0.25]}>
        <coneGeometry args={[0.2, 0.28, 4]} />
        <meshStandardMaterial color="#c9853c" roughness={0.75} metalness={0.15} />
      </mesh>
      <mesh position={[-0.9, 1.13, 0]} rotation={[0, 0, Math.PI / 2.9]}>
        <cylinderGeometry args={[0.035, 0.035, 0.5, 20]} />
        <meshStandardMaterial color="#8f673d" roughness={0.7} />
      </mesh>
      {particles.map((particle, index) =>
        particle.visible ? (
          <mesh key={index} position={[particle.x, particle.y, particle.z]}>
            <sphereGeometry args={[0.012 + flowRate * 0.006, 12, 12]} />
            <meshStandardMaterial color="#d49a52" roughness={0.9} />
          </mesh>
        ) : null,
      )}
      <DeviceLabel position={[-1.2, 1.55, 0]} >Qum girişi</DeviceLabel>
    </group>
  );
}

function WaterSupply({ flowRate, waterLevel, time }: { flowRate: number; waterLevel: number; time: number }) {
  const tankLevel = clamp(0.28 + waterLevel * 0.65, 0.12, 0.9);
  const drops = Array.from({ length: 7 }, (_, index) => {
    const phase = (time * (0.3 + flowRate * 1.7) + index / 7) % 1;
    return {
      x: 1.08 - phase * 0.82,
      y: 0.72 - phase * 0.18,
      visible: flowRate > 0.02,
    };
  });

  return (
    <group>
      <mesh position={[1.18, 1.05, 0]}>
        <boxGeometry args={[0.28, 0.52, 0.2]} />
        <meshStandardMaterial color="#dfe9ec" transparent opacity={0.42} roughness={0.1} />
      </mesh>
      <mesh position={[1.18, 0.8 + tankLevel * 0.26, 0]}>
        <boxGeometry args={[0.24, 0.48 * tankLevel, 0.17]} />
        <meshStandardMaterial color="#57b8e6" transparent opacity={0.55} roughness={0.18} />
      </mesh>
      <mesh position={[0.78, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.78, 18]} />
        <meshStandardMaterial color="#7a8a82" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0.42, 0.72, 0]}>
        <torusGeometry args={[0.04, 0.009, 10, 30]} />
        <meshStandardMaterial color={flowRate > 0.02 ? "#0f8f84" : "#8a3e2b"} metalness={0.4} roughness={0.35} />
      </mesh>
      {drops.map((drop, index) =>
        drop.visible ? (
          <mesh key={index} position={[drop.x, drop.y, 0]}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial color="#2fa7df" transparent opacity={0.82} />
          </mesh>
        ) : null,
      )}
      <DeviceLabel position={[1.18, 1.43, 0]} >Su girişi</DeviceLabel>
    </group>
  );
}

function PermanentMagnet({ particleY, moistureRatio }: { particleY: number; moistureRatio: number }) {
  const radius = 0.16 + moistureRatio * 0.025;

  return (
    <group position={[0, particleY, 0]}>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[radius, radius, 0.13, 48]} />
        <meshStandardMaterial color="#d85b48" metalness={0.38} roughness={0.27} />
      </mesh>
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[radius, radius, 0.13, 48]} />
        <meshStandardMaterial color="#5266c9" metalness={0.38} roughness={0.27} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 0.96, 48, 48]} />
        <meshStandardMaterial color="#dce5df" metalness={0.25} roughness={0.32} transparent opacity={0.68} />
      </mesh>
      <DeviceLabel position={[0.02, 0.16, 0]} >N</DeviceLabel>
      <DeviceLabel position={[0.02, -0.16, 0]} >S</DeviceLabel>
      <DeviceLabel position={[0.54, -0.14, 0.02]} >Sabit maqnit</DeviceLabel>
    </group>
  );
}

function ElectronicsBlock({ currentRatio }: { currentRatio: number }) {
  return (
    <group>
      <mesh position={[-1.08, 0.37, -0.34]}>
        <boxGeometry args={[0.26, 0.18, 0.12]} />
        <meshStandardMaterial color="#29342f" metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[-0.84, 0.37, -0.34]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.46, 10]} />
        <meshStandardMaterial color="#5d6b64" />
      </mesh>
      <mesh position={[1.05, 0.34, -0.34]}>
        <boxGeometry args={[0.34, 0.22, 0.13]} />
        <meshStandardMaterial color="#f4f7f5" metalness={0.1} roughness={0.42} />
      </mesh>
      <mesh position={[1.05, 0.34, -0.27]} rotation={[0, 0, -0.9 + currentRatio * 0.9]}>
        <boxGeometry args={[0.012, 0.11, 0.012]} />
        <meshStandardMaterial color="#c73558" />
      </mesh>
      <DeviceLabel position={[-1.24, 0.22, -0.34]} >İdarəetmə bloku</DeviceLabel>
      <DeviceLabel position={[1.26, 0.34, -0.34]} >Cərəyan ölçən cihaz</DeviceLabel>
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
      <group scale={0.72} position={[0, 0.18, 0]}>
        <MeasurementChamber materialFill={telemetry.materialFill} waterLevel={telemetry.waterLevel} />
        <SandSupply flowRate={telemetry.sandFlowRate} time={telemetry.time} />
        <WaterSupply flowRate={telemetry.waterFlowRate} waterLevel={telemetry.waterLevel} time={telemetry.time} />
        <Coil currentRatio={currentRatio} />
        <DeviceLabel position={[0, 1.28, 0]} >Solenoid</DeviceLabel>
        <FieldLines currentRatio={currentRatio} />
        <TargetPlane targetDistance={telemetry.targetDistance} />
        <SensorBeam particleY={particleY} />
        <PermanentMagnet particleY={particleY} moistureRatio={moistureRatio} />
        <ElectronicsBlock currentRatio={currentRatio} />
        <mesh position={[0, -0.18, 0]} receiveShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.04, 80]} />
          <meshStandardMaterial color="#d9e2dc" metalness={0.18} roughness={0.65} />
        </mesh>
        <gridHelper args={[2.2, 12, "#9dacA4", "#d3ded8"]} position={[0, -0.2, 0]} />
      </group>
    </>
  );
}

export function DigitalTwinScene({ telemetry }: { telemetry: Telemetry }) {
  return (
    <div className="scene-frame">
      <Canvas dpr={[1, 1.7]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[2.75, 1.7, 3.35]} fov={43} />
        <color attach="background" args={["#eef3ef"]} />
        <fog attach="fog" args={["#eef3ef", 3.5, 6.5]} />
        <TwinObjects telemetry={telemetry} />
        <OrbitControls enablePan={false} minDistance={2.4} maxDistance={5.5} maxPolarAngle={Math.PI * 0.78} />
      </Canvas>
      <div className="scene-readout">
        <span>Məsafə {(telemetry.distance * 100).toFixed(2)} sm</span>
        <strong>Cərəyan {telemetry.current.toFixed(2)} A</strong>
        <span>Qum {(telemetry.sandFlowRate * 100).toFixed(0)}%</span>
        <span>Su {(telemetry.waterFlowRate * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

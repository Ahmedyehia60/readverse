/* import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

function KaabaModel() {
  const { scene } = useGLTF("/models/masjid_al-haram_kaaba.glb");

  const root = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());

    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= box.min.y;

    root.updateMatrixWorld(true);
  }, [root]);

  return <primitive object={root} />;
}

function BoyAgent() {
  const ref = useRef<THREE.Mesh>(null);
  const R = 3;
  const H = 0.3;
  const SPEED = 0.6;

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * SPEED;
    const x = Math.cos(t) * R;
    const z = Math.sin(t) * R;
    if (!ref.current) return;
    ref.current.position.set(x, H, z);
    ref.current.lookAt(0, H, 0);
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial />
    </mesh>
  );
}

export default function TawafScene() {
  return (
    <Canvas
      camera={{ position: [4, 4, 15], fov: 25 }}
      shadows
      style={{ height: "100vh", width: "100%" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} castShadow />

      <KaabaModel />
      <BoyAgent />

      {/* الكاميرا مركّزة بس عملنا الإزاحة شمال }
      <OrbitControls target={[3, 2, 0]} enablePan={false} />
    </Canvas>
  );
}
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//THE SIMULATION WILL BE DISPLAYED WHILE THE DATA DISPLAYED WHEN CLICKED OR ANIMATED OR WHATEVER THE DESIGN IS BUT THIS IS THE DATA NEDDED HERE
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import steps from "../data/umrah.json";

const Tawaf = () => {
  const filteredSteps = steps.steps.filter((step) =>
    ["during", "after"].includes(step.phase)
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        أدعية الطواف وما بعده
      </h1>

      {filteredSteps.map((step) => (
        <div
          key={step.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2 style={{ marginBottom: "10px", color: "#2c3e50" }}>
            {step.title}
          </h2>

          {step.description.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              {step.description.map((desc, i) => (
                <p key={i} style={{ margin: "5px 0" }}>
                  {desc}
                </p>
              ))}
            </div>
          )}

          {step.dua.length > 0 && (
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {step.dua.map((d, i) => (
                <li key={i} style={{ marginBottom: "5px", color: "#16a085" }}>
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default Tawaf;

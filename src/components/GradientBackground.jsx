import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function GradientMesh({ colors = ['#e67e22', '#d35400', '#1a1a2e', '#16213e'] }) {
  const meshRef = useRef();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(colors[0]) },
    uColor2: { value: new THREE.Color(colors[1]) },
    uColor3: { value: new THREE.Color(colors[2]) },
    uColor4: { value: new THREE.Color(colors[3]) },
  }), []);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta * 0.3;
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.05;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float elevation = sin(pos.x * 2.0 + uTime) * 0.3 + sin(pos.y * 1.5 + uTime * 0.7) * 0.2;
      pos.z += elevation;
      vElevation = elevation;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform float uTime;
    void main() {
      vec2 uv = vUv;
      float t = sin(uTime * 0.2) * 0.5 + 0.5;
      vec3 c1 = mix(uColor1, uColor2, uv.x + t * 0.3);
      vec3 c2 = mix(uColor3, uColor4, uv.y + t * 0.2);
      vec3 color = mix(c1, c2, uv.y + vElevation * 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, 0, -2]}>
      <planeGeometry args={[12, 12, 64, 64]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function GradientBackground({ colors, style }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, ...style }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <GradientMesh colors={colors} />
      </Canvas>
    </div>
  );
}

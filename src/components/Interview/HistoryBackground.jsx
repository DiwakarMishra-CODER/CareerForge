import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function HistoryGlow() {
    return (
        <group>
            {/* Indigo Sphere */}
            <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1}>
                <mesh position={[-25, 15, -20]}>
                    <sphereGeometry args={[12, 64, 64]} />
                    <MeshDistortMaterial
                        color="#3f51b5"
                        speed={1.5}
                        distort={0.35}
                        radius={1}
                        transparent
                        opacity={0.12}
                    />
                </mesh>
            </Float>

            {/* Emerald Torus Arch */}
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                <Torus args={[15, 0.5, 16, 100]} position={[25, -15, -10]} rotation={[Math.PI / 4, 0, 0]}>
                    <meshStandardMaterial
                        color="#10b981"
                        emissive="#10b981"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.1}
                    />
                </Torus>
            </Float>

            {/* Subtle secondary ring */}
            <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                <Torus args={[20, 0.2, 16, 100]} position={[0, 0, -30]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial
                        color="#3f51b5"
                        transparent
                        opacity={0.05}
                    />
                </Torus>
            </Float>
        </group>
    );
}

function HistoryParticles({ count = 80 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 120;
            p[i * 3 + 1] = (Math.random() - 0.5) * 100;
            p[i * 3 + 2] = (Math.random() - 0.5) * 60 - 30;
        }
        return p;
    }, [count]);

    const colors = useMemo(() => {
        const c = new Float32Array(count * 3);
        const color1 = new THREE.Color('#3f51b5');
        const color2 = new THREE.Color('#10b981');
        for (let i = 0; i < count; i++) {
            const mixedColor = Math.random() > 0.6 ? color1 : color2;
            c[i * 3] = mixedColor.r;
            c[i * 3 + 1] = mixedColor.g;
            c[i * 3 + 2] = mixedColor.b;
        }
        return c;
    }, [count]);

    const pointsRef = useRef();
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.0005;
            pointsRef.current.rotation.x += 0.0002;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={points}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.2}
                vertexColors
                transparent
                opacity={0.3}
                sizeAttenuation
            />
        </points>
    );
}

export default function HistoryBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 40], fov: 75 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[20, 20, 20]} intensity={0.8} color="#10b981" />
                <pointLight position={[-20, -20, -20]} intensity={0.8} color="#3f51b5" />
                <HistoryGlow />
                <HistoryParticles />
            </Canvas>
            {/* Deeper Gradient Overlay for "Slate" feel */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/40 to-[#020617]"></div>
        </div>
    );
}

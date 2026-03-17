import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedGlow() {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.cos(time / 4) * 0.2;
            meshRef.current.rotation.y = Math.sin(time / 4) * 0.2;
        }
    });

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <Sphere args={[15, 64, 64]} position={[-20, 10, -20]}>
                    <MeshDistortMaterial
                        color="#06b6d4"
                        speed={2}
                        distort={0.4}
                        radius={1}
                        transparent
                        opacity={0.15}
                    />
                </Sphere>
            </Float>

            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
                <Sphere args={[12, 64, 64]} position={[20, -10, -15]}>
                    <MeshWobbleMaterial
                        color="#8b5cf6"
                        speed={1.5}
                        factor={0.4}
                        transparent
                        opacity={0.15}
                    />
                </Sphere>
            </Float>
        </group>
    );
}

function Particles({ count = 100 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 100;
            p[i * 3 + 1] = (Math.random() - 0.5) * 100;
            p[i * 3 + 2] = (Math.random() - 0.5) * 50 - 25;
        }
        return p;
    }, [count]);

    const colors = useMemo(() => {
        const c = new Float32Array(count * 3);
        const color1 = new THREE.Color('#06b6d4');
        const color2 = new THREE.Color('#8b5cf6');
        for (let i = 0; i < count; i++) {
            const mixedColor = Math.random() > 0.5 ? color1 : color2;
            c[i * 3] = mixedColor.r;
            c[i * 3 + 1] = mixedColor.g;
            c[i * 3 + 2] = mixedColor.b;
        }
        return c;
    }, [count]);

    const pointsRef = useRef();
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
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
                size={0.15}
                vertexColors
                transparent
                opacity={0.4}
                sizeAttenuation
            />
        </points>
    );
}

export default function InterviewBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
                <AnimatedGlow />
                <Particles />
            </Canvas>
            {/* Gradient Overlay for extra depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]"></div>
        </div>
    );
}

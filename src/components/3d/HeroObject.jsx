import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, MeshDistortMaterial, Float, Text, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

const CareerCards = ({ position, color, title, delay }) => {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.position.y += Math.sin(time + delay) * 0.002;
        meshRef.current.rotation.z = Math.sin(time * 0.5 + delay) * 0.05;
    });

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <boxGeometry args={[2, 3, 0.1]} />
                <meshPhysicalMaterial
                    color={color}
                    metalness={0.9}
                    roughness={0.1}
                    transmission={0.5}
                    thickness={1}
                />
                <Text
                    position={[0, 0, 0.06]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {title}
                </Text>
            </mesh>
        </group>
    );
};

const NetworkNodes = ({ position, scrollOffset }) => {
    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < 20; i++) {
            p.push(new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10));
        }
        return p;
    }, []);

    return (
        <group position={position}>
            {points.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color="#8b5cf6" />
                </mesh>
            ))}
        </group>
    );
};

const HeroObject = () => {
    const groupRef = useRef();
    const scroll = useScroll();
    const sphereRef = useRef();

    useFrame((state) => {
        const scrollOffset = scroll.offset;

        // Section 1: Hero (0.0 - 0.2)
        // Section 2: Career (0.2 - 0.4)
        // Section 3: Mentorship (0.4 - 0.6)
        // Section 4: Interview (0.6 - 0.8)

        if (groupRef.current) {
            // General movement based on scroll
            groupRef.current.position.y = THREE.MathUtils.lerp(0, 30, scrollOffset * 1.5);
            groupRef.current.rotation.y = scrollOffset * Math.PI * 4;
        }

        if (sphereRef.current) {
            sphereRef.current.distort = THREE.MathUtils.lerp(0.4, 1.2, scrollOffset);
            sphereRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.5, scrollOffset));
        }
    });

    return (
        <group ref={groupRef}>
            {/* Central Monolith / Sphere */}
            <mesh ref={sphereRef} position={[0, 0, 0]}>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshDistortMaterial
                    color="#10b981"
                    speed={2}
                    distort={0.4}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Career Cards Section */}
            <group position={[0, -10, 0]}>
                <CareerCards position={[-3, 0, 0]} color="#3b82f6" title="Engineering" delay={0} />
                <CareerCards position={[0, 0, -2]} color="#8b5cf6" title="Design" delay={1} />
                <CareerCards position={[3, 0, 0]} color="#ec4899" title="Marketing" delay={2} />
            </group>

            {/* Mentorship Network Section */}
            <NetworkNodes position={[0, -22, 0]} />

            {/* Interview Path Section */}
            <group position={[0, -35, 0]}>
                {[0, 1, 2, 3].map(i => (
                    <mesh key={i} position={[0, -i * 2, 0]}>
                        <boxGeometry args={[4, 0.5, 4]} />
                        <meshPhysicalMaterial color="#3b82f6" roughness={0.1} metalness={0.8} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

export default HeroObject;

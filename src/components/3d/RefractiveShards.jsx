import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const Shard = ({ position, rotation, scale, color, currentScroll }) => {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Rotation constant
            meshRef.current.rotation.x += 0.001;
            meshRef.current.rotation.y += 0.002;

            // Floating effect
            meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.2;

            // Scroll-driven movement (Depth and spread)
            // currentScroll is 0 to 1
            meshRef.current.position.z = position[2] + currentScroll * 20;
            meshRef.current.position.x = position[0] * (1 + currentScroll * 1.5);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <octahedronGeometry args={[1, 0]} />
            <MeshTransmissionMaterial
                backside={false}
                thickness={0.5}
                chromaticAberration={0.01}
                anisotropicBlur={0.2}
                clearcoat={0.1}
                clearcoatRoughness={0.1}
                envMapIntensity={1}
                resolution={256}
                samples={4}
                color={color}
                metalness={0.15}
                roughness={0}
            />
        </mesh>
    );
};

const RefractiveShards = () => {
    const [currentScroll, setCurrentScroll] = useState(0);

    useFrame(() => {
        const main = document.querySelector('main');
        if (main) {
            const scrollPercent = main.scrollTop / (main.scrollHeight - main.clientHeight);
            setCurrentScroll(prev => THREE.MathUtils.lerp(prev, scrollPercent || 0, 0.1));
        }
    });

    const shards = useMemo(() => {
        const s = [];
        const colors = ['#ffffff', '#10b981', '#3b82f6', '#8b5cf6'];
        for (let i = 0; i < 6; i++) {
            s.push({
                position: [
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20 - 10
                ],
                rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
                scale: Math.random() * 1.2 + 0.3,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
        return s;
    }, []);

    return (
        <group>
            {shards.map((s, i) => (
                <Shard key={i} {...s} currentScroll={currentScroll} />
            ))}
        </group>
    );
};

export default RefractiveShards;

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

function AnalyzerNodes({ count = 20 }) {
    const nodes = useMemo(() => {
        const n = [];
        for (let i = 0; i < count; i++) {
            n.push({
                position: [
                    (Math.random() - 0.5) * 60,
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 30
                ],
                scale: Math.random() * 0.5 + 0.2,
                speed: Math.random() * 1 + 0.5
            });
        }
        return n;
    }, [count]);

    return (
        <group>
            {nodes.map((node, i) => (
                <Float key={i} speed={node.speed} rotationIntensity={1} floatIntensity={1}>
                    <Icosahedron args={[1, 1]} position={node.position} scale={node.scale}>
                        <meshStandardMaterial
                            color="#3b82f6"
                            wireframe
                            transparent
                            opacity={0.2}
                        />
                    </Icosahedron>
                </Float>
            ))}
        </group>
    );
}

function ScanningBeams() {
    const beamRef = useRef();

    useFrame((state) => {
        if (beamRef.current) {
            beamRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 20;
        }
    });

    return (
        <mesh ref={beamRef}>
            <boxGeometry args={[100, 0.1, 1]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
        </mesh>
    );
}

export default function AnalyzerBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 40], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
                <AnalyzerNodes />
                <ScanningBeams />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a]/80 to-[#020617]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        </div>
    );
}

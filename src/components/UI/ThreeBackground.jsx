import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Octahedron, Icosahedron, Float } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function StarBackground(props) {
    const ref = useRef();

    // Reduced density for "very little dots"
    const sphere = useMemo(() => {
        const positions = new Float32Array(300 * 3); // only 300 points instead of 5000
        random.inSphere(positions, { radius: 2.5 });
        return positions;
    }, []);

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 30; // move slightly slower than before
        ref.current.rotation.y -= delta / 40;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#f8fafc" // bright but soft white
                    size={0.005} // very small
                    opacity={0.3} // mostly transparent
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

function FloatingShapes() {
    const shapes = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10 - 2
            ],
            scale: Math.random() * 0.4 + 0.1,
            rotationIntensity: Math.random() * 1.5 + 0.5, // Increased rotation speed
            floatIntensity: Math.random() * 1.5 + 0.5, // Increased floating span
            speed: Math.random() * 1.0 + 0.5, // Increased overall animation speed
            isDiamond: i % 2 === 0,
        }));
    }, []);

    return (
        <group>
            {shapes.map((props, i) => (
                <Float
                    key={i}
                    speed={props.speed}
                    rotationIntensity={props.rotationIntensity}
                    floatIntensity={props.floatIntensity}
                    position={props.position}
                >
                    {props.isDiamond ? (
                        <Octahedron scale={props.scale}>
                            <meshStandardMaterial
                                color="#4ade80" // subtle emerald
                                wireframe={true}
                                emissive="#4ade80"
                                emissiveIntensity={0.15}
                                transparent
                                opacity={0.25}
                            />
                        </Octahedron>
                    ) : (
                        <Icosahedron scale={props.scale}>
                            <meshStandardMaterial
                                color="#38bdf8" // subtle sky blue
                                wireframe={true}
                                emissive="#38bdf8"
                                emissiveIntensity={0.15}
                                transparent
                                opacity={0.25}
                            />
                        </Icosahedron>
                    )}
                </Float>
            ))}
        </group>
    );
}

export default function ThreeBackground() {
    return (
        <div className="fixed inset-0 z-0 w-full h-full bg-[#030014] pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 10]} intensity={0.8} />
                <StarBackground />
                <FloatingShapes />
            </Canvas>
        </div>
    );
}

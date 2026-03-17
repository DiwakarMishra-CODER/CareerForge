import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, PerspectiveCamera, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import RefractiveShards from './RefractiveShards';

const CameraRig = () => {
    useFrame((state) => {
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 2, 0.05);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.mouse.y * 2, 0.05);
        state.camera.lookAt(0, 0, 0);
    });
    return null;
};

const Scene = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-screen -z-10 bg-[#020617]">
            <Canvas
                shadows
                gl={{ antialias: true, alpha: true, stencil: false, depth: true }}
                dpr={[1, 2]}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

                <ambientLight intensity={0.2} />
                <spotLight position={[15, 15, 15]} angle={0.15} penumbra={1} intensity={2} castShadow color="#10b981" />
                <spotLight position={[-15, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} color="#3b82f6" />
                <pointLight position={[0, -10, -10]} intensity={1} color="#8b5cf6" />

                <Suspense fallback={null}>
                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        <RefractiveShards />
                    </Float>
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Environment preset="night" />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Scene;

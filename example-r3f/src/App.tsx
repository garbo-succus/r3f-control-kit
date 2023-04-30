import { Canvas } from '@react-three/fiber'
import { Controls, useCamera } from './Controls'
import { CameraHintImperative, CameraHintDeclarative } from './CameraHints'

export default function App() {
  const origin = useCamera((s) => s.origin)
  return (
    <Canvas
      frameloop="demand"
      style={{
        touchAction: 'none',
        height: '100vh',
        width: '100vw',
        background: '#222'
      }}>
      <Controls />

      <ambientLight intensity={0.5} />
      <directionalLight intensity={0.5} position={[50, 100, 70]} />

      <mesh>
        <boxGeometry args={[4, 0.05, 4]} />
        <meshStandardMaterial color="blue" wireframe />
      </mesh>

      {/* Demonstrate bypassing React reconciliation */}
      <CameraHintImperative updateStream={useCamera.subscribe} />
      <CameraHintDeclarative origin={origin} />
    </Canvas>
  )
}

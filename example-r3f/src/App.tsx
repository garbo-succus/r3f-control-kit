import { Canvas } from '@react-three/fiber'
import { Controls } from './Controls'

export default function App() {
  return (
    <Canvas style={{ height: '100vh', width: '100vw' }}>
      <Controls />

      <ambientLight intensity={0.5} />
      <directionalLight intensity={1.5} position={[50, 100, 70]} />

      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    </Canvas>
  )
}

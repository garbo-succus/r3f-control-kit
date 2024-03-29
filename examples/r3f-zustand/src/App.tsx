import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Controls,
  useCamera,
  updateCamera,
  useCameraConfig,
  updateCameraConfig
} from './Controls'
import { CameraHintImperative, CameraHintDeclarative } from './CameraHints'

export default function App() {
  const origin = useCamera((s) => s.origin)

  // NOTE: For complex apps, we recommend copying the entire `examples/r3f-zustand/Controls` directory,
  //   and editing the initial camera config yourself.
  //   However, if you're just importing `examples/r3f-zustand/Controls` directly,
  //   this is a pattern for setting initial state:
  useEffect(() =>
    // Set initial camera config; update camera
    {
      const config = {
        defaultOrigin: [0, 0.5, 0],
        defaultCoords: [5, Math.PI / 4, Math.PI / 8]
      }
      updateCameraConfig(() => config)
      updateCamera(() => ({
        origin: config.defaultOrigin,
        coords: config.defaultCoords
      }))
    }, []) // Only run on initial component mount
  return (
    <Canvas
      frameloop="demand" /* Don't waste battery rendering unnecessary frames */
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
      {/* TODO: BUG: This does not render in the correct position for first frame */}
      <CameraHintImperative updateStream={useCamera.subscribe} />
      <CameraHintDeclarative origin={origin} />
    </Canvas>
  )
}

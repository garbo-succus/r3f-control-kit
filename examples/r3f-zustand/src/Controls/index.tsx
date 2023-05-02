import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
// TODO: Remove `TEMPORARY_control-kit` - https://github.com/garbo-succus/control-kit/issues/7
import { ControlRig, SphericalCamera } from './TEMPORARY_control-kit'
import { useCamera, updateCamera } from './cameraState'
import { eventHandler } from './eventHandler'

export const Controls = () => {
  // Get r3f canvas element
  const target = useThree((three) => three.gl.domElement)
  // Force an initial updateStream state update to fire
  useEffect(() => void updateCamera(() => ({})), [])
  return (
    <>
      {/*
        This would be idiomatic React:
          const origin = useCamera((s) => s.origin)
          const coords = useCamera((s) => s.coords)
          return ( ...
            <SphericalCamera origin={origin} coords={coords} />
          ... )
        However, with updateStream, we can bypass diffing for better perf and make Paul happy.
      */}
      <SphericalCamera updateStream={useCamera.subscribe} />

      {/* ControlRig lets us attach event handlers from anywhere in the app */}
      <ControlRig
        target={target}
        onEvent={eventHandler}
        preventDefaults={['wheel', 'touchstart', 'contextmenu']}
        eventTypes={[
          'wheel',
          'pointerover',
          'pointerenter',
          'pointerdown',
          'pointermove',
          'pointerup',
          'pointercancel',
          'pointerout'
        ]}
      />
    </>
  )
}

// Export `examples/r3f-zustand/Controls` as a library
export {
  useCamera,
  updateCamera,
  useCameraConfig,
  updateCameraConfig
} from './cameraState'
export { eventHandler, handlePointer, handleWheel } from './eventHandler'

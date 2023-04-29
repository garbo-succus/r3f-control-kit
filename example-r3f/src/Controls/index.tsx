import { useThree } from '@react-three/fiber'
import {
  ControlRig,
  SphericalCamera,
  normalizeCoords,
  bitmaskToArray
} from '../control-kit'
import { cameraConfig, useCamera, updateCamera } from './model'

const eventHandler = ({ type, buttons, movementX, movementY }) =>
  updateCamera(({ origin: [x, y, z], coords: [r, theta, phi] }) => {
    if (type !== 'pointermove') return null

    const [leftButton, rightButton, middleButton] = bitmaskToArray(buttons)

    // Rotate camera
    if (leftButton) {
      const coords = normalizeCoords(cameraConfig, [
        r,
        theta + movementY / 100,
        phi - movementX / 100
      ])
      return { coords }
    }

    // Move camera
    if (rightButton) {
      const origin = [x + movementX / 100, y, z + movementY / 100]
      return { origin }
    }

    // Reset camera
    if (middleButton) {
      return {
        origin: cameraConfig.defaultOrigin,
        coords: cameraConfig.defaultCoords
      }
    }
  })

export const Controls = () => {
  const target = useThree((three) => three.gl.domElement) // Get r3f canvas element
  return (
    <>
      {/*
        This would be idiomatic React:
          const origin = useCamera((s) => s.origin)
          const coords = useCamera((s) => s.coords)
          return ( ...
            <SphericalCamera origin={origin} coords={coords} />
          ... )
        However, with updateStream, we can bypass diffing for better perf and to make Paul happy.
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

import { useEffect, useRef } from 'react'
import { invalidate } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

export const SphericalCamera = ({
  origin = [0, 0, 0], // Target position
  coords: [
    r, // Distance to origin
    theta, // Polar (up-down) angle
    phi // Azimuthal (left-right) angle
  ] = [0, 0, 0],
  makeDefault = true, // Make this the default three camera
  updateStream, // Stream of { origin, coords } updates
  ...cameraProps
}) => {
  const groupRef = useRef()
  const cameraRef = useRef()
  useEffect(
    () =>
      // Take a stream of {origin,coords} updates and imperatively move camera.
      // Escape hatch for bypassing the React update system (i.e. for animations).
      updateStream &&
      updateStream(({ origin, coords }) => {
        if (!groupRef.current || !cameraRef.current) return
        if (origin) groupRef.current.position.set(...origin)
        if (coords) {
          const [r, theta, phi] = coords
          cameraRef.current.position.x = r
          groupRef.current.rotation.z = theta
          groupRef.current.rotation.y = phi
        }
        if (origin || coords) invalidate()
      }),
    [updateStream, invalidate]
  )
  return (
    <group ref={groupRef} position={origin} rotation={[0, phi, theta]}>
      <PerspectiveCamera
        {...cameraProps}
        ref={cameraRef}
        position={[r, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        makeDefault={makeDefault}
      />
    </group>
  )
}

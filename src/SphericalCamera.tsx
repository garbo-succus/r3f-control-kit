import { useEffect, useRef } from 'react'
import { invalidate } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

export const SphericalCamera = ({
  makeDefault = true, // Make this the default three camera
  updateStream, // Stream of { origin, coords } updates
  origin = [0, 0, 0], // Target position
  coords: [
    r, // Distance to origin
    theta, // Polar (up-down) angle
    phi // Azimuthal (left-right) angle
  ] = [0, 0, 0],
  ...cameraProps
}) => {
  const groupRef = useRef()
  const cameraRef = useRef()
  useEffect(
    () =>
      // Subscribe to a stream of {origin,coords} updates and imperatively move camera.
      // Escape hatch for bypassing React diffing.
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
    [updateStream, invalidate] // TODO: Invalidate probably shouldn't be a dependency
  )
  // TODO: Use maths, not a <group> https://github.com/garbo-succus/control-kit/issues/6
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

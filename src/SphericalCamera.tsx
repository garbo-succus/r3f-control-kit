import { useEffect, useRef } from 'react'
import { invalidate } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

export const SphericalCamera = ({
  makeDefault = true, // Make this the default three camera
  updateStream, // Stream of { origin, coords } updates
  // TODO: Depreciate origin/coords in this type (hopefully we can recommend them in the future)
  origin, // Target position
  coords, // Camera rotation
  ...cameraProps
}) => {
  const groupRef = useRef()
  const cameraRef = useRef()
  // TODO: Show a development-mode console depreciation warning if `origin`/`coords` is truthy
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
  const [r, theta, phi] = coords
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

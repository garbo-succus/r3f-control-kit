import { useEffect, useRef, memo } from 'react'
import { invalidate } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { useCamera, actions } from './useCamera'
import {
  PerspectiveCamera as PerspectiveCameraType,
  Group as GroupType
} from 'three'

/**
 * Creates a camera bound to origin/coords state.
 * Accepts Drei [PerspectiveCamera](https://github.com/pmndrs/drei/#perspectivecamera) props.
 *
 * Default PerspectiveCamera props: `makeDefault = true`
 *
 * ```tsx
 * <OrbitCamera {...perspectiveCameraProps} />
 * ```
 *
 * @category Component
 */
const OrbitCamera = memo((props: typeof PerspectiveCamera) => {
  const groupRef = useRef()
  const cameraRef = useRef()
  useEffect(() => {
    const update = ({
      // Target position
      origin: [x, y, z],
      coords: [
        r, // Distance to origin
        theta, // Polar (up-down) angle
        phi // Azimuthal (left-right) angle
      ]
    }: CameraState) => {
      const group = groupRef.current as GroupType | undefined
      const camera = cameraRef.current as PerspectiveCameraType | undefined
      if (group && camera) {
        group.position.set(x, y, z)
        camera.position.x = r
        group.rotation.z = theta
        group.rotation.y = phi
        invalidate()
      }
    }
    // Set initial origin & coords
    actions.resetPosition()
    // Update Three camera with Zustand subscription
    update(useCamera.getState() as CameraState)
    return useCamera.subscribe(update as any)
  }, [])
  // The component itself is just a group centered on `origin`,
  // with a camera on the edge, facing the center of the group.
  return (
    <group ref={groupRef as any}>
      <PerspectiveCamera
        makeDefault
        {...props}
        ref={cameraRef}
        rotation={[0, Math.PI / 2, 0]}
      />
    </group>
  )
})

export default OrbitCamera

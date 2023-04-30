import { useRef, useEffect } from 'react'

// Updates to this component are slower,
// as they must go through Reacts reconciliation system.
export const CameraHintDeclarative = ({ origin }) => {
  return (
    <group position={origin}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="green" wireframe />
      </mesh>
    </group>
  )
}

// Updates to this component are faster,
// as they bypass Reacts reconciliation system.
// The downside is far less maintainable code.
export const CameraHintImperative = ({ updateStream }) => {
  const ref = useRef()
  useEffect(
    () =>
      // Take a stream of {origin,coords} updates and imperatively move camera.
      // Escape hatch for bypassing the React update system (i.e. for animations).
      updateStream &&
      updateStream(({ origin }) => {
        if (!ref.current) return
        if (origin) ref.current.position.set(...origin)
      }),
    [updateStream]
  )
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.5, 2, 0.5]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
    </group>
  )
}

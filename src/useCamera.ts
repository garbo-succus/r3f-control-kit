import { create } from 'zustand'
import { updatePosition, resetPosition, updateConfig } from './actions'

/**
 * React hook for camera state. See [Zustand](github.com/pmndrs/zustand) docs for hook API.
 *
 * ```jsx
 * import { useCamera } from 'r3f-orbit-camera'
 *
 * const CameraPosition = () => {
 *   const coords = useState(s => s.coords)
 *   const origin = useState(s => s.origin)
 *   return (
 *     <pre>
 *       coords: [{coords.join(', ')}]
 *       origin: [{origin.join(', ')}]
 *     </pre>
 *   )
 * }
 * ```
 *
 * @category Action
 */
export const useCamera = create((set, get) => ({
  // Config
  minR: 1,
  maxR: Infinity,
  minTheta: 0.03,
  maxTheta: Math.PI / 2,
  initialOrigin: [0, 1, 0],
  initialCoords: [15, Math.PI / 8, Math.PI / 4],

  // origin/coords are set from initialOrigin/initialCoords when OrbitCamera mounts
  origin: [0, 0, 0],
  coords: [0, 0, 0],

  actions: {
    updatePosition: updatePosition(set),
    resetPosition: resetPosition(set),
    updateConfig: updateConfig(set)
  }
}))

export const { actions } = useCamera.getState() as CameraState

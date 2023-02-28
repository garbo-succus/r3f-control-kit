import { MathUtils } from 'three'

interface PositionUpdate {
  coords?: Vec3
  origin?: Vec3
}

interface ConfigUpdate {
  minR?: number
  maxR?: number
  minTheta?: number
  maxTheta?: number
  rotationScale?: Vec2
  initialOrigin?: Vec3
  initialCoords?: Vec3
}

// Keep angle between 0-2π rads
const clampAngle = (angle: number) =>
  MathUtils.euclideanModulo(angle, Math.PI * 2) as number

/**
 * Resets camera back to initialOrigin & initialCoords
 *
 * ```tsx
 * import { actions } from 'r3f-orbit-camera'
 *
 * const Reset = () => (
 *   <button
 *     onClick={() => actions.resetPosition())
 *     children='Reset camera position'
 *   />
 * )
 * ```
 *
 * @category Action
 */
export const resetPosition = (set: Function) => () =>
  set(
    ({ initialOrigin, initialCoords }: CameraState) =>
      ({
        origin: initialOrigin,
        coords: initialCoords
      } as PositionUpdate)
  )

/**
 * Moves camera to origin & coords
 *
 * ```tsx
 * import { actions } from 'r3f-orbit-camera'
 *
 * const MoveCameraLeft = () => (
 *   <button
 *     onClick={() => actions.updatePosition(
 *       ({ origin: [x, y, z] }) => ({ origin: [ x + 1, y, z ] })
 *     ))
 *     children='Move camera left'
 *   />
 * )
 * ```
 *
 * @category Action
 */
export const updatePosition =
  (set: Function) => (updater: (state: CameraState) => PositionUpdate) =>
    set((props: CameraState) => {
      const result = updater(props)
      const origin = result.origin || props.origin
      // Constrain r & theta to min/max, phi to 0-2π rads
      const { minR, maxR, minTheta, maxTheta } = props
      const coords = result.coords
        ? [
            MathUtils.clamp(result.coords[0], minR, maxR),
            MathUtils.clamp(result.coords[1], minTheta, maxTheta),
            clampAngle(result.coords[2])
          ]
        : props.coords
      return { origin, coords }
    })

/**
 * Updates camera config
 *
 * ```tsx
 * import { actions } from 'r3f-orbit-camera'
 *
 * const IncreaseMaxViewDistance = () => (
 *   <button
 *     onClick={() => actions.updateConfig(
 *       ({ maxR }) => ({ maxR: maxR + 10 })
 *     ))
 *     children='Allow camera to "zoom out" further'
 *   />
 * )
 * ```
 *
 * @category Action
 */
export const updateConfig =
  (set: Function) => (updater: (state: CameraState) => ConfigUpdate) =>
    set((props: CameraState) => {
      const result = updater(props)
      return {
        minR: result.minR || props.minR,
        maxR: result.maxR || props.maxR,
        minTheta: result.minTheta || props.minTheta,
        maxTheta: result.maxTheta || props.maxTheta,
        rotationScale: result.rotationScale || props.rotationScale,
        initialOrigin: result.initialOrigin || props.initialOrigin,
        initialCoords: result.initialCoords || props.initialCoords
      }
    })

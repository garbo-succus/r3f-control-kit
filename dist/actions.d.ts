interface PositionUpdate {
    coords?: Vec3;
    origin?: Vec3;
}
interface ConfigUpdate {
    minR?: number;
    maxR?: number;
    minTheta?: number;
    maxTheta?: number;
    rotationScale?: Vec2;
    initialOrigin?: Vec3;
    initialCoords?: Vec3;
}
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
export declare const resetPosition: (set: Function) => () => any;
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
export declare const updatePosition: (set: Function) => (updater: (state: CameraState) => PositionUpdate) => any;
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
export declare const updateConfig: (set: Function) => (updater: (state: CameraState) => ConfigUpdate) => any;
export {};

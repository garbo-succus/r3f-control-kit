const constrain = (min, max, value) => Math.min(Math.max(min, value), max);
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
export const resetPosition = (set) => () => set(({ initialOrigin, initialCoords }) => ({
    origin: initialOrigin,
    coords: initialCoords
}));
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
export const updatePosition = (set) => (updater) => set((props) => {
    const result = updater(props);
    const origin = result.origin || props.origin;
    // Constrain r & theta to min/max
    const { minR, maxR, minTheta, maxTheta } = props;
    const coords = result.coords
        ? [
            constrain(minR, maxR, result.coords[0]),
            constrain(minTheta, maxTheta, result.coords[1]),
            result.coords[2]
        ]
        : props.coords;
    return { coords, origin };
});
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
export const updateConfig = (set) => (updater) => set((props) => {
    const result = updater(props);
    return {
        minR: result.minR || props.minR,
        maxR: result.maxR || props.maxR,
        minTheta: result.minTheta || props.minTheta,
        maxTheta: result.maxTheta || props.maxTheta,
        rotationScale: result.rotationScale || props.rotationScale,
        initialOrigin: result.initialOrigin || props.initialOrigin,
        initialCoords: result.initialCoords || props.initialCoords
    };
});

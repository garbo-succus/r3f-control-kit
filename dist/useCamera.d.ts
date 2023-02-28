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
export declare const useCamera: import("zustand").UseBoundStore<import("zustand").StoreApi<unknown>>;
export declare const actions: {
    [updatePosition: string]: function;
};

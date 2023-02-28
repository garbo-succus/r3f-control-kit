/// <reference types="react" />
import { PerspectiveCamera } from '@react-three/drei';
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
declare const OrbitCamera: import("react").MemoExoticComponent<(props: typeof PerspectiveCamera) => JSX.Element>;
export default OrbitCamera;

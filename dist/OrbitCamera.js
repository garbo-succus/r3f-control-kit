import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, memo } from 'react';
import { invalidate } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useCamera, actions } from './useCamera';
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
const OrbitCamera = memo((props) => {
    const groupRef = useRef();
    const cameraRef = useRef();
    useEffect(() => {
        const update = ({ 
        // Target position
        origin: [x, y, z], coords: [r, // Distance to origin
        theta, // Polar (up-down) angle
        phi // Azimuthal (left-right) angle
        ] }) => {
            const group = groupRef.current;
            const camera = cameraRef.current;
            if (group && camera) {
                group.position.set(x, y, z);
                camera.position.x = r;
                group.rotation.z = theta;
                group.rotation.y = phi;
                invalidate();
            }
        };
        // Set initial origin & coords
        actions.resetPosition();
        // Update Three camera with Zustand subscription
        update(useCamera.getState());
        return useCamera.subscribe(update);
    }, []);
    // The component itself is just a group centered on `origin`,
    // with a camera on the edge, facing the center of the group.
    return (_jsx("group", { ref: groupRef, children: _jsx(PerspectiveCamera, { makeDefault: true, ...props, ref: cameraRef, rotation: [0, Math.PI / 2, 0] }) }));
});
export default OrbitCamera;

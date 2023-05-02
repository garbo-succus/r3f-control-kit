# examples/r3f-zustand

This is the "kitchen sink" example of an orbit camera controller in react-three-fiber, using Zustand for state management.

**Note:** Changes to <./src/Controls> must follow semver!

To try it, run:

```sh
npm install
npm run dev
```

## Usage as a module

This example can be used as a batteries-included orbit camera controller:

```js
import {
  Controls,
  useCamera,
  updateCamera,
  useCameraConfig,
  updateCameraConfig
} from `control-kit/examples/r3f-zustand/src/Controls`
```

### Initial state

For complex apps, we recommend copying the entire `examples/r3f-zustand/Controls` directory, and editing the initial camera config yourself.
However, if you're just importing `examples/r3f-zustand/Controls` directly, this is a pattern for setting initial state:

```js
import { useEffect } from 'react'
import {
  Controls,
  updateCamera,
  useCameraConfig,
  updateCameraConfig
} from './Controls'

export const App = () => {
  useEffect(() =>
    // Set initial camera config; update camera
    {
      updateCameraConfig(() => ({
        defaultOrigin: [0, 0.5, 0],
        defaultCoords: [5, Math.PI / 4, Math.PI / 8]
      }))
      updateCamera(() => ({
        origin: useCameraConfig.getState().defaultOrigin,
        coords: useCameraConfig.getState().defaultCoords
      }))
    }, []) // Only run on initial component mount
  return (
    <Canvas>
      <Controls />
    </Canvas>
  )
}
```

# r3f-orbit-camera

This is a toolkit for implementing your own react-three-fiber orbit controls.

![A visual diagram of the camera state](./camera-state.svg)

```js
  // origin: target world position
  const [x, y, z] = origin

  // coords: camera rotation, relative to origin
  const [
    r, // Distance to origin
    theta, // Polar (up-down) angle
    phi // Azimuthal (left-right) angle
  ] = coords
```

## Example

```js
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitCamera,
  normalizeCoords,
  bitmaskToArray
} from './r3f-orbit-camera'

function App() {
  const [origin, setOrigin] = useState([0, 0, 0])
  const [coords, setCoords] = useState([16, Math.PI / 4, 0])

  const cameraConfig = {
    minR: 1,
    maxR: Infinity,
    minTheta: Math.PI / 16,
    maxTheta: Math.PI / 2
  }

  const mouseMoveHandler = ({ buttons, movementX, movementY }) => {
    const [leftButton, rightButton, middleButton] = bitmaskToArray(buttons)
    if (leftButton) {
      // Rotate camera
      const [r, theta, phi] = coords
      const newCoords = normalizeCoords(cameraConfig, [
        r,
        theta + movementY / 100,
        phi - movementX / 100
      ])
      setCoords(newCoords)
    } else if (rightButton) { 
      // Move camera
      const [x, y, z] = origin
      const newOrigin = [x + movementX / 100, y, z + movementY / 100]
      setOrigin(newOrigin)
    } else if (middleButton) {
      // Reset camera
      setOrigin([0, 0, 0])
      setCoords([16, Math.PI / 4, 0])
    }
  }

  return (
    <Canvas onMouseMove={mouseMoveHandler}>
      <OrbitCamera origin={origin} coords={coords} />
    </Canvas>
  )
}
```

## Animations

Setting the `origin` & `coords` component props are the recommended way to move the camera, however they are not suitable for animation as the changes must pass through react diffing. The `updateStream` prop is an escape hatch allowing imperative `{origin,coords}` updates.

At the moment you can pass it a Zustand state subscription.

## API

### `OrbitCamera`

This component creates a `<PerspectiveCamera>` looking at `origin`, rotated by `coords`.
It accepts all PerspectiveCamera props (`makeDefault` is true by default).

The camera can be animated by passing an `updateStream` prop.

### `normalizeCoords`

This function takes a `coords` array and:

- Constrains `r` (min/max distance to/from origin)
- Constrains `theta` (min/max up/down angle)
- Normalizes `phi` to 0 <> 2π rads (if we rotated 360°, reset to 0°)

```js
const [r, theta, phi] = normalizeCoords(
  {
    minR: 0,
    maxR: Infinity,
    minTheta: 0,
    maxTheta: Math.PI / 2,
  },
  coords
)
```

### `bitmaskToArray`

This function converts `event.buttons` from a pointer event into an array of booleans.

```js
<Canvas onPointerDown={
  ({ buttons }) => {
    const [
      leftMouseButton,
      rightMouseButton,
      middleMouseButton,
      mouseButton4,
      mouseButton5
    ] = bitmaskToArray(buttons)
  }
} />

````

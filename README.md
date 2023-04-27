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
import { OrbitCamera, normalizeCoords } from "r3f-orbit-camera"

const OrbitControls = () => {
  const [origin, setOrigin] = useState([0, 0, 0])
  const [coords, setCoords] = useState([0, 0, 0])

  return <OrbitCamera origin={origin} coords={coords} />
}

const App = () => {
  return (
    <Canvas>
      <OrbitControls />
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
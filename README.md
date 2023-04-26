# r3f-orbit-camera

This is a toolkit for implementing your own react-three-fiber orbit controls.

![A visual diagram of the camera state](./camera-state.svg)

```js
import { OrbitCamera, normalizeCoords } from 'r3f-orbit-camera'

const OrbitControls = () => {
  const [origin, setOrigin] = useState([0, 0, 0])
  const [coords, setCoords] = useState([0, 0, 0])

  const [x, y, z] = origin // target
  const [
    r, // Distance to origin
    theta, // Polar (up-down) angle
    phi // Azimuthal (left-right) angle
  ] = coords

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

## `normalizeCoords`

This function takes a `coords` array and:

- Constrains `r`
- Constrains `theta`
- Normalizes `phi` to 0 <> 2π rads (0° to 360°)

```js
const [r, theta, phi] = normalizeCoords(
  {
    minR: 0,
    maxR: Infinity,
    minTheta: 0,
    maxTheta: Math.PI / 2
  },
  coords
)
```

## Animations

Setting the `origin` & `coords` component props are the recommended way to move the camera, however they are not suitable for animation as the changes must pass through the React reconciliation mechanism. The `updateStream` prop is an escape hatch allowing imperative `{origin,coords}` updates.

At the moment you can pass it a Zustand state subscription. 

We should provide a lerp and a useSpring example (with a wrapper component).

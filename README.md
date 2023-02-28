# r3f-orbit-camera

This is a [Zustand](https://github.com/pmndrs/zustand)-based orbit camera for react-three-fiber.
It aims to provide a more React-like API than other cameras.
Note that controls are not part of this library; try [r3f-orbit-controls](https://github.com/garbo-succus/r3f-orbit-controls)

A demo is available [here](https://codesandbox.io/s/r3f-orbit-camera-6otwuk).

If you just want a simple React component that takes `origin` and `coords` as props, try [r3f-simple-orbit-camera](https://github.com/garbo-succus/r3f-simple-orbit-camera).

# Getting started

The `<OrbitCamera \>` component creates a camera in your scene, attached to internal Zustand state.

The camera state describes a target position relative to the world (`origin`) and (`coords`).

![A visual diagram of how origin and coords relate to the 3D world](./camera-state.svg)

```js
origin: [x, y, z], // world target

coords: [
  r, // Distance to origin
  theta, // Polar (up-down) angle
  phi // Azimuthal (left-right) angle
]
```

# Example
```js
import { Canvas } from '@react-three/fiber'
import OrbitCamera, { actions } from 'r3f-orbit-camera'

const mouseMoveHandler = (e) => actions.updatePosition(
  ({ coords: [r, theta, phi], origin: [x, y, z] }) => {
    const coords = [
      r + e.movementY / 40,
      theta,
      phi - e.movementX / 100
    ]
    const origin = [x, y, z]
    return { coords, origin }
  }
])

const App = () => (
  <Canvas
    style={{ backgroundColor: "black", height: "90vh" }}
    onMouseMove={mouseMoveHandler}
  >
    <OrbitCamera />
    <ambientLight intensity={1} />
    <directionalLight position={[50, 100, 70]} />
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color="red" />
    </mesh>
  </Canvas>
)
```

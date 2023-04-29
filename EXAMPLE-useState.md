# `useState` example

`useState` is idiomatic, but not recommended, as reconciliation adds a lot of overhead.

This might change in a future version of React with auto-memoizing and immutable data.

```js
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { SphericalCamera, normalizeCoords, bitmaskToArray } from 'control-kit'

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
      <SphericalCamera origin={origin} coords={coords} />
    </Canvas>
  )
}
```

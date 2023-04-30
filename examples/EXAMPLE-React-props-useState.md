# React props/`useState` example

Directly setting `origin`/`coords` props (such as with `useState`) is idiomatic, but not should not be used, as React reconciliation adds excessive latency.

TODO: Benchmark `updateStream` vs `memo` + props with the following datatypes to see if this advice has changed:

- `Array`
- [Tuple](https://github.com/tc39/proposal-record-tuple)
- [List](https://github.com/funkia/list)

```js
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { SphericalCamera, normalizeCoords, bitmaskToArray } from 'control-kit'

function App() {
  const [origin, setOrigin] = useState([0, 0, 0])
  const [coords, setCoords] = useState([16, Math.PI / 4, 0])
  const [cameraConfig, setCameraConfig] = useState({
    minR: 1,
    maxR: Infinity,
    minTheta: Math.PI / 16,
    maxTheta: Math.PI / 2
  })

  const mouseMoveHandler = ({ buttons, movementX, movementY }) => {
    const [leftButton, rightButton] = bitmaskToArray(buttons)
    if (leftButton) {
      // Rotate camera
      const [r, theta, phi] = coords
      const newCoords = normalizeCoords(cameraConfig, [
        r,
        theta + movementY / 100,
        phi - movementX / 100
      ])
      setCoords(newCoords)
    }
  }

  return (
    <Canvas onMouseMove={mouseMoveHandler}>
      <SphericalCamera origin={origin} coords={coords} />
    </Canvas>
  )
}
```

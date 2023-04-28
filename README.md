# control-kit

This is a toolkit for implementing your own react-three-fiber camera controls.

## Rationale

Camera controls are generally the main way humans interact with 3D apps.
They must handle multiple input methods (touch, keyboard, mouse, gamepads, XR, etc) but should also get out of the way when not needed.

We have found "kitchen sink" camera controllers to be difficult to integrate into state management, and easy to outgrow.

Rather than ship an entire controller, we aim to provide composable pieces for building one, patterns for common requirements, and boilerplate to get started with.

## Example

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

## API: Camera

These functions are specifically for handling 3D cameras

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

### `SphericalCamera`

This component creates a `<PerspectiveCamera>` looking at `origin`, rotated by `coords`.
It accepts all PerspectiveCamera props (`makeDefault` is true by default).

Note that there is overhead to updating the `origin` & `coords` props directly, as each change must pass through react diffing. The `updateStream` prop is provided as an escape hatch to bypass diffing with imperative `{origin,coords}` updates.

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
    maxTheta: Math.PI / 2
  },
  coords
)
```

## API: DOM

These functions are for input handling, independent of r3f.

### `ControlRig`

This convenience component attaches an `onEvent` event handler to a `target` element, for every event listed in `eventTypes`.
The `options` prop to is passed to the `addEventListener` call.

`event.preventDefault()` is called on all events in the `preventDefaults` prop.
See the note in <#addPreventDefaults> for advice on which events to use.

```js
const App = () => {
  const target = useThree((three) => three.gl.domElement) // Get r3f canvas element
  return (
    <Canvas>
      <ControlRig
        target={target}
        onEvent={(event) => console.log(event.type)}
        preventDefaults={['wheel', 'touchstart', 'contextmenu']}
        eventTypes={[
          'wheel',
          'pointerover',
          'pointerenter',
          'pointerdown',
          'pointermove',
          'pointerup',
          'pointercancel',
          'pointerout'
        ]}
      />
    </Canvas>
  )
}
```

### `bitmaskToArray`

This function converts `event.buttons` from a pointer event into an array of booleans.

```js
const onPointerMove = (event) => {
  const [
    leftMouseButton,
    rightMouseButton,
    middleMouseButton,
    mouseButton4,
    mouseButton5
  ] = bitmaskToArray(event.buttons)
}
```

### `addEventListeners`

Adds event listeners for list of events to a target; returns a function to remove them.
See <https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener>.

_Note:_ You should avoid using mouse and touch events, as they have been obsoleted by pointer events.

```js
const removeEventListeners = addEventListeners(
  document.getElementById('mydiv'),
  [
    'wheel',
    'pointerover',
    'pointerenter',
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointercancel',
    'pointerout'
  ],
  (event) => console.log(event.type),
  { capture: false, once: false, passive: false }
)
```

### `addPreventDefaults`

Adds `event.preventDefault()` to a list of events; returns a function to remove them.

```js
const removePreventDefaults = addPreventDefaults(
  document.getElementById('mydiv'),
  ['wheel', 'touchstart', 'contextmenu']
)
```

_Note:_ You should preventDefault these events:

```js
const types = [
  // Block ctrl + mousewheel (zoom in/out in most browsers)
  // Block alt + mousewheel (history gesture in firefox)
  'wheel',

  // Block iOS swipe history gesture <https://pqina.nl/blog/blocking-navigation-gestures-on-ios-13-4/>
  'touchstart',

  // This event is not supported in iOS, and should not be used on any platform.
  // You should use a right-click or long-press gesture instead.
  'contextmenu'
]
```

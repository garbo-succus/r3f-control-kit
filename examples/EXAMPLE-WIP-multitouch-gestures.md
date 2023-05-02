# (Multitouch) gestures - WIP

This gesture handler works by processing pointer events in a [Flyd](https://github.com/paldepind/flyd) reducer.

## Planned

I hope to implement these before September 2023:

- short-press (tap)
- drag
- 2-finger pinch + rotation (ignore everything except the first 2 fingers)

## Unplanned

These are out-of-scope (barring contributions, sponsorship, or trivial implementation):

- long-press
- 2-finger swipe
- throw (finish a drag or 2+-finger swipe over a velocity threshold)
- double-short-press (doubletap)
- n-short-press (improved doubletap with any number of taps)
- n-finger pinch + rotation, swipe (currently we ignore everything except the first 2 fingers)
- n-finger drag (multiple fingers dragging different things simultaneously)
- n-t-press (improved doubletap with any number of taps, of any time length - like morse code)
- simultaneous independent pen input

These would be cool to have, but aren't planned, and would require feasibility research:

- glyphs (drag or use a pen to paint a shape; fuzzy match shape when finished)
- n-hand 2-finger pinch + rotation, swipe (treat each pinch-zoom/swipe within an area approx the radius of a human hand as an individual gesture)
- n-hand n-finger gestures (multiple independent multitouch gestures, as long as hands aren't too close together)

## 🚧 WORK IN PROGRESS 🚧

This reducer could take a stream of DOM PointerEvents.
It would then output a stream of GestureStream events (and optionally forward incoming events).
It may be better to output React-style events and follow their design descisions, as long as this doesn't make interop worse.

GestureStream events could have an API similar to PointerEvents, i.e. we treat different gestures as proprietary PointerEvents input devices.

We could take a similar approach for turning WheelEvents and Safari touchpad gesture events into GestureStream TouchpadEvents or something.

We should check the Gamepad, Keyboard, Web MIDI, and XR events and see if they could also be treated like proprietary PointerEvents (or visa-versa).

<hr />

_This is some old code from a prior multitouch implementation._
_I want to break it up, refactor, and if possible reduce or eliminate the dependancy on Flyd._

### `types.d.ts`

```js

type Vec2 = [number, number]
type Vec3 = [number, number, number]

interface GesturestreamEventGesture {
  touches: PointerEvent[]
  center: Vec2
  buttons: boolean[]
  deltaXY: Vec2
  targetSize?: Vec2
  angle?: number
  distance?: number
  deltaAngle?: number
  deltaDistance?: number
  wasTap?: boolean
}

interface GesturestreamEvent {
  event: PointerEvent
  gesture: GesturestreamEventGesture
}
```

### `handlers.js`

```js
export const handleRotate = ({
  deltaXY,
  targetSize
}: GesturestreamEventGesture) =>
  actions.updatePosition(({ coords: [r, oldTheta, oldPhi] }: CameraState) => {
    const theta = oldTheta + (deltaXY[1] / targetSize[1]) * (Math.PI * 1)
    const phi = oldPhi - (deltaXY[0] / targetSize[0]) * (Math.PI * 4)
    return { coords: [r, theta, phi] }
  })

export const handlePinch = ({
  deltaXY,
  deltaAngle,
  deltaDistance
}: GesturestreamEventGesture) =>
  actions.updatePosition((state: CameraState) => {
    const {
      coords: [oldR, theta, oldPhi]
    } = state
    const { origin } = move(deltaXY)(state)
    const r = oldR + deltaDistance / (500 / oldR)
    const phi = oldPhi + deltaAngle
    return { origin, coords: [r, theta, phi] }
  })
```

### `gesturestream.js`

```js
import flyd from 'flyd'
import flydfilter from 'flyd/module/filter'
import {
  assoc,
  dissoc,
  compose,
  values,
  filter,
  sortBy,
  take,
  map
} from 'ramda'
import flydDomEvents from 'flyd-dom-events'

const eventTypes = [
  'wheel',
  'pointerover',
  'pointerenter',
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointercancel',
  'pointerout'
]

// Subtract a list of 2D vectors
const subtract = (...args) =>
  args.reduce(([a1, a2], [b1, b2]) => [a1 - b1, a2 - b2])

// Divide a list of 2D vectors
const divide = ([a, b], d) => [a / d, b / d]

// Add gesture information to an event
const updateGesture = ({ gesture: lastGesture = {}, event: lastEvent }, e) => {
  const { touches: lastTouches, center: lastCenter } = lastGesture
  const { pointers, event } = e
  if (!event) return {} // flyd.scan emits empty value on init

  const touchList = compose(
    map(({ clientX, clientY }) => [clientX, clientY]),
    take(2), // Ignore 3+ finger gestures
    sortBy((event) => event.pointerId),
    filter((event) => event.pointerType === 'touch'),
    values
  )(pointers)
  const touches = touchList.length

  const getDeltaCenter = (center) =>
    lastCenter &&
    // Don't calculate delta if we've gone from multitouch to singletouch
    touches === lastTouches &&
    (lastEvent?.pointerType !== 'touch' || lastEvent?.type !== 'pointerout')
      ? subtract(center, lastCenter)
      : [0, 0]

  const gesture = (() => {
    const targetSize = [event.target.clientWidth, event.target.clientHeight]
    if (touches === 2) {
      const diff2 = subtract(...touchList)
      const center = subtract(touchList[0], divide(diff2, 2))
      const angle = Math.PI + Math.atan2(...diff2)
      const distance = Math.hypot(...diff2)
      return {
        targetSize,
        touches,
        center,
        buttons: bitmaskToArray(touchList[0].buttons),
        deltaXY: getDeltaCenter(center),
        angle,
        deltaAngle: (lastGesture.angle || angle) - angle,
        distance,
        deltaDistance: (lastGesture.distance || distance) - distance
      }
    } else {
      const center = [event.clientX, event.clientY]
      const wasTap =
        event.type === 'pointerup' && lastEvent?.type === 'pointerdown'
      const buttons =
        event.type === 'pointerup' && lastEvent
          ? lastEvent.buttons
          : event.buttons
      // Initial X/Y position of gesture (when gesturing)
      // TODO: Should this be implemented for multitouch?
      const start = event.type === 'pointerdown' ? center : lastGesture.start
      // Total X/Y change of gesture (when gesturing)
      // TODO: Should this be implemented for multitouch?
      const offset = start
        ? [center[0] - start[0], center[1] - start[1]]
        : [0, 0]
      return {
        targetSize,
        touches,
        center,
        buttons: bitmaskToArray(buttons),
        deltaXY: getDeltaCenter(center),
        start,
        offset,
        wasTap
      }
    }
  })()
  return { ...e, gesture }
}

// Update the 'pointers' prop with currently active pointers
const updatePointers = ({ pointers: lastPointers }, e) => {
  const { event } = e
  const { pointerId, type } = event
  const pointers =
    pointerId === undefined || type === 'pointerout' || type === 'pointercancel'
      ? dissoc(pointerId, lastPointers)
      : assoc(pointerId, event, lastPointers)
  return { ...e, pointers }
}

// Returns a flyd stream of gesture events from a DOM object
const gesturestream = (target, options) =>
  compose(
    flydfilter((e) => e.event), // flyd.scan emits empty value on init
    flyd.scan(updateGesture, {}),
    flyd.scan(updatePointers, {}),
    flyd.map((event) => ({ event })),
    flydDomEvents
  )(eventTypes, target, options)

export default gesturestream
```

### `useControls.jsx`

This is application-specific code

```js
import { handlers } from 'r3f-orbit-controls'
import { useObjectStore } from 'utils/Interactable'
import { map, compose, sort, assocPath } from 'ramda'
import { create } from 'zustand'
import { Raycaster, Vector2 } from 'three'
import useStore from 'model'

const coords = new Vector2()
const raycaster = new Raycaster()
const updateRaycaster = (center, targetSize, camera) => {
  const x = (center[0] / targetSize[0]) * 2 - 1
  const y = -(center[1] / targetSize[1]) * 2 + 1
  coords.set(x, y)
  raycaster.setFromCamera(coords, camera)
  return raycaster
}

// Get a list of object-raycaster intersections
const getIntersects = (raycaster, firstHitOnly) => {
  const { objects } = useObjectStore.getState()
  // Bubble up to find the parent Interactable group
  const getInteractables = (object) => {
    if (!object) return []
    const { handlers } = objects[object.uuid] || {}
    if (handlers) return [handlers, ...getInteractables(object.parent)]
    return getInteractables(object.parent)
  }
  const intersects = (() => {
    raycaster.firstHitOnly = !!firstHitOnly
    const i = raycaster.intersectObjects(
      Object.values(objects).map((o) => o.object),
      true
    )
    raycaster.firstHitOnly = false
    return i
  })()
  return compose(
    map((intersection) => ({
      intersection,
      handlers: getInteractables(intersection.object)
    })),
    sort((a, b) => {
      // Sort by depthTest = false (materials rendered on top)
      const dtA = a.object.material?.depthTest
      const dtB = b.object.material?.depthTest
      if (!dtA || !dtB) {
        if (dtA) return 1
        if (dtB) return -1
      }
      // Sort by renderOrder (like z-index, but only works when depthTest=false)
      const roA = (dtA && a.object.renderOrder) || 0
      const roB = (dtB && b.object.renderOrder) || 0
      if (roA || roB) return roA - roB
      // Sort by distance from camera
      return a.distance - b.distance
    })
  )(intersects)
}

// Trigger onGesture event on targetObject with args
// TODO: Only have 1 handler per object
const onGesture = (targetObject, ...args) =>
  targetObject?.handlers[0]?.onGesture?.(...args)

const useControls = create((set, get) => ({
  isHovering: false,
  targetObject: undefined,
  isGesturing: false,

  handleGesture: (onTapMissed, threecamera) => (e) => {
    // Decide what to do with an onGesture event.
    // Generally, we're either updating the camera,
    // or fowarding pointer events to the handlers on a Piece.
    const { event, gesture } = e
    const { type, pointerType } = event
    const {
      center,
      targetSize,
      touches,
      buttons: [leftButton, rightButton, middleButton]
    } = gesture
    const raycaster = updateRaycaster(center, targetSize, threecamera)
    const isGesturing = touches > 0 || event.buttons !== 0
    const isHovering = getIntersects(raycaster, true).length > 0
    const { dragToPanCamera } = useStore.getState().settings

    const sendFakePointercancelEvent = (e, raycaster) =>
      set(({ targetObject }) => {
        onGesture(
          targetObject,
          assocPath(['event', 'type'], 'pointercancel', e),
          raycaster
        )
        return { targetObject: undefined, isGesturing, isHovering }
      })

    if (type === 'wheel') {
      handlers.handleWheel(event)
    }

    if (
      type === 'pointerdown' &&
      touches === 2 &&
      pointerType === 'touch' &&
      get().targetObject
    ) {
      // Drag started, but gesture became a multitouch
      return sendFakePointercancelEvent(e, raycaster)
    }

    if (type === 'pointermove') {
      if (pointerType === 'touch' && touches === 2) {
        handlers.handlePinch(gesture)
      } else if (rightButton) {
        handlers.handleRotate(gesture)
      } else if (leftButton || middleButton || pointerType === 'touch') {
        const { targetObject } = get()
        if (
          middleButton ||
          (!targetObject && (dragToPanCamera || !leftButton))
        ) {
          handlers.handleMove(gesture)
        } else {
          onGesture(targetObject, e, raycaster)
        }
      }
    } else if (touches < 2) {
      if (type === 'pointerdown') {
        const intersects = getIntersects(raycaster)
        if (intersects.length > 0) {
          const targetObject = intersects[0]
          onGesture(targetObject, e, raycaster)
          return set((state) => ({ targetObject, isGesturing, isHovering }))
        }
      } else if (type === 'pointerup' || type === 'pointercancel') {
        return set(({ targetObject }) => {
          if (gesture.wasTap && !targetObject) {
            onTapMissed(e, raycaster)
          } else {
            onGesture(targetObject, e, raycaster)
          }
          return { targetObject: undefined, isGesturing, isHovering }
        })
      } else if (
        type === 'pointerenter' &&
        !leftButton &&
        pointerType !== 'touch' &&
        get().targetObject
      ) {
        // User dragged out-of-bounds then released cursor
        return sendFakePointercancelEvent(e, raycaster)
      }
    }
    return set((state) => ({ isGesturing, isHovering }))
  }
}))

export default useControls
```

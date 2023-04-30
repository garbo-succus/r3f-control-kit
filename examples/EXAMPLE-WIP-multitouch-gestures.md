# (Multitouch) gestures - WIP

This gesture handler works by processing pointer events in a ~~[Flyd](https://github.com/paldepind/flyd)~~ reducer.

## Planned

- short-press (tap)
- drag
- 2-finger pinch + rotation (ignore everything except the first 2 fingers)

## Unplanned

These probably won't be implemented without contributions or sponsorship:

- long-press
- 2-finger swipe
- double-short-press (doubletap)
- throw (finish a drag or 2-finger swipe over a velocity threshold)
- n-finger pinch + rotation, swipe (currently we ignore everything except the first 2 fingers)
- n-finger drag (multiple fingers dragging different things simultaneously)
- n-short-press (doubletap but with any number of taps)
- n-t-press (doubletap but with any number of taps, of any time length, like morse code)

These would be cool to have, but aren't planned, and would require fesability research:

- n-hand 2-finger pinch + rotation, swipe (treat each pinch-zoom/swipe within an area approx the radius of a human hand as an individual gesture)
- glyphs (drag or use a pen to paint a shape; fuzzy match shape when finished)

## WORK IN PROGRESS

This is some code from a prior multitouch implementation.
I want to break it up, and if possible reduce or eliminate the dependancy on Flyd.

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

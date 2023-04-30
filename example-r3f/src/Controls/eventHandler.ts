import { normalizeCoords, bitmaskToArray } from '../control-kit'
import { useCameraConfig, updateCamera } from './cameraState'

export const eventHandler = (event) => {
  switch (event.type) {
    case 'pointerup':
    case 'pointerdown':
    case 'pointermove':
      return updateCamera(handlePointer(event))
    case 'wheel':
      return updateCamera(handleWheel(event))
    default:
      return
  }
}

export const handlePointer =
  ({ buttons, movementX, movementY }: PointerEvent) =>
  ({ origin: [x, y, z], coords: [r, theta, phi] }) => {
    const [leftButton, rightButton, middleButton] = bitmaskToArray(buttons)

    // Simple (imperfect) way to scale mouse movement to camera movement
    const scaling = 100 // TODO: Match pointer movement to on-screen movement

    // Rotate camera
    if (leftButton) {
      const cameraConfig = useCameraConfig.getState()
      const coords = normalizeCoords(cameraConfig, [
        r,
        theta + movementY / scaling,
        phi - movementX / scaling
      ])
      return { coords }
    }

    // Move camera
    // TODO: Movement should be relative to camera phi
    if (rightButton) {
      const origin = [x + movementX / scaling, y, z + movementY / scaling]
      return { origin }
    }

    // Reset camera
    if (middleButton) {
      const { defaultOrigin, defaultCoords } = useCameraConfig.getState()
      return {
        origin: defaultOrigin,
        coords: defaultCoords
      }
    }
  }

export const handleWheel = (event: PointerEvent) => (state) => {
  // TODO: Add support for Safari touchpad gesture events
  const {
    altKey,
    ctrlKey // `true` on trackpads when pinch-zooming (or ctrl key is pressed)
  } = event

  // Move camera (origin) when alt+wheeling
  if (altKey) {
    // Swap deltaX/deltaY if user is holding the ctrl key,
    // so that 1-directional mouse scrollwheels can be used to move both forward/back and left/right
    const [deltaX, deltaY] = ctrlKey
      ? [event.deltaY, event.deltaX]
      : [event.deltaX, event.deltaY]
    //
    const scaling = 2 // Make alt-wheel movement faster
    // Pass a fake right-mouse-drag PointerEvent to handlePointer
    // TODO: This seems fragile. Can we tap into a `handlePan` function or an `action: 'pan'` Redux reducer instead?
    return handlePointer({
      // ...event, // TODO: We don't need to pass the whole event; handlePointer type should reflect this
      buttons: 2,
      movementX: -deltaX * scaling,
      movementY: -deltaY * scaling
    } as PointerEvent)(state)
  }

  // Rotate camera (coords)
  const cameraConfig = useCameraConfig.getState()
  const {
    coords: [r, theta, phi]
  } = state
  // Swap deltaY/deltaZ if user is pinching (or ctrl+wheeling)
  const [deltaY, deltaZ] = ctrlKey
    ? [event.deltaZ, event.deltaY]
    : [event.deltaY, event.deltaZ]
  const coords = normalizeCoords(cameraConfig, [
    r + deltaY / (500 / r), // Dolly faster as we move out further
    theta - deltaZ / 100,
    phi + event.deltaX / 200
  ])
  return { coords }
}

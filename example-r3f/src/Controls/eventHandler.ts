import { normalizeCoords, bitmaskToArray } from '../control-kit'
import { cameraConfig, updateCamera } from './cameraState'

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
    const scaling = 100 // Simple (imperfect) way to scale mouse movement to camera movement

    // Rotate camera
    if (leftButton) {
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
      return {
        origin: cameraConfig.defaultOrigin,
        coords: cameraConfig.defaultCoords
      }
    }
  }

export const handleWheel = (event: PointerEvent) => (state) => {
  const {
    altKey,
    ctrlKey // `true` on trackpads when pinch-zooming (or ctrl key is pressed)
  } = event

  // Move camera (origin) when alt+wheeling
  if (altKey) {
    // Swap deltaX/deltaY if user is holding the ctrl key,
    // so that scrollwheels can be used to move both forward/back and left/right
    const [deltaX, deltaY] = ctrlKey
      ? [event.deltaY, event.deltaX]
      : [event.deltaX, event.deltaY]
    // Pass a fake right-mouse-drag PointerEvent to handlePointer
    return handlePointer({
      // ...event, // TODO: We don't need to pass the whole event; handlePointer type should reflect this
      buttons: 2,
      movementX: -deltaX,
      movementY: -deltaY
    } as PointerEvent)(state)
  }

  // Rotate camera (coords)
  const {
    coords: [r, theta, phi]
  } = state
  // Swap deltaY/deltaZ if user is pinching (or ctrl+wheeling)
  const [deltaY, deltaZ] = ctrlKey
    ? [event.deltaZ, event.deltaY]
    : [event.deltaY, event.deltaZ]
  const coords = [
    r + deltaY / (500 / r), // Dolly faster as we move out further
    theta - deltaZ / 100,
    phi + event.deltaX / 200
  ]
  return { coords }
}

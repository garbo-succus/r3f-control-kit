// TODO: Remove `TEMPORARY_control-kit` - https://github.com/garbo-succus/control-kit/issues/7
import {
  normalizeCoords,
  bitmaskToArray,
  getScreenXY
} from './TEMPORARY_control-kit'
import { useCameraConfig, updateCamera } from './cameraState'

export const eventHandler = (event) => {
  const cameraConfig = useCameraConfig.getState()
  switch (event.type) {
    case 'pointerup':
    case 'pointerdown':
    case 'pointermove':
      return updateCamera(handlePointer(event, cameraConfig))
    case 'wheel':
      return updateCamera(handleWheel(event, cameraConfig))
    default:
      return
  }
}

export const handlePointer =
  ({ buttons, movementX, movementY }: PointerEvent, cameraConfig: Object) =>
  ({ origin: [x, y, z], coords: [r, theta, phi] }) => {
    const [leftButton, rightButton, middleButton] = bitmaskToArray(buttons)

    // Simple (imperfect) way to scale mouse movement to camera movement
    // TODO: Match pointer movement to origin movement when looking straight down
    //   Set the camera coords to [10, Math.PI / 2, 0] (i.e. looking straight down).
    //   Pick a reference point at coords [0, 0, 0] and move the camera (origin [x, , z]).
    //   The reference point should follow the cursor position exactly throughout the entire gesture.
    //   Try the same at coords [100, Math.PI / 2, 0] etc.
    //   NB: We want to ignore theta when gesturing along the screen Y axis,
    //   so that pan gesture speed is always consistent regardless of camera rotation.
    const scaling = 100

    // Move camera (origin)
    if (leftButton) {
      const screenXY = getScreenXY({ movementX, movementY, phi })
        // TODO: Remove this when we fix scaling
        .map((v: number) => (v * r) / (scaling * 10)) // Move faster as we move out further
      const origin = [x - screenXY[1], y, z + screenXY[0]]
      return { origin }
    }

    // Rotate camera (coords)
    if (rightButton) {
      const coords = normalizeCoords(cameraConfig, [
        r,
        theta + movementY / scaling,
        phi - movementX / scaling
      ])
      return { coords }
    }

    // Reset camera
    if (middleButton) {
      return {
        origin: cameraConfig.defaultOrigin,
        coords: cameraConfig.defaultCoords
      }
    }
  }

export const handleWheel = (event: PointerEvent, cameraConfig: Object) => (state) => {
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
    const {
      origin: [x, y, z]
    } = state
    const scaling = 50
    const origin = [x - deltaX / scaling, y, z - deltaY / scaling]
    return { origin }
  }

  // Rotate camera (coords)
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

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

    // Rotate camera (coords)
    if (leftButton) {
      const cameraConfig = useCameraConfig.getState()
      const coords = normalizeCoords(cameraConfig, [
        r,
        theta + movementY / scaling,
        phi - movementX / scaling
      ])
      return { coords }
    }

    // Move camera (origin)
    if (rightButton) {
      // TODO: Movement should be relative to camera phi
      const origin = [x + movementX / scaling, y, z + movementY / scaling]
      return { origin }

      // import { Vector2 } from 'three'
      // import { actions, CameraState } from 'r3f-orbit-camera'

      // const handleMoveVector = new Vector2() // Reusable vector (to save on GC)
      // const vector00 = new Vector2(0, 0)

      // const move =
      //   (deltaXY) =>
      //   ({ origin: [oldX, y, oldZ], coords: [r, , phi] }: CameraState) => {
      //     const screenXY = handleMoveVector
      //       .set(...deltaXY)
      //       .rotateAround(vector00, -phi) // Rotate screen X/Y coords to match camera rotation
      //       .toArray()
      //       .map((v: number) => (v * r) / 1000) // Move faster as we move out further
      //     const z = oldZ + screenXY[0]
      //     const x = oldX - screenXY[1]
      //     return { origin: [x, y, z] }
      //   }
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
    const {
      origin: [x, y, z]
    } = state
    const scaling = 50
    const origin = [x - deltaX / scaling, y, z - deltaY / scaling]
    return { origin }
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

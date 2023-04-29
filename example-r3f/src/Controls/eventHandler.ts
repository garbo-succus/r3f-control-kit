import { normalizeCoords, bitmaskToArray } from '../control-kit'
import { cameraConfig, updateCamera } from './cameraState'

export const eventHandler = (event) => {
  switch (event.type) {
    case 'pointerup':
    case 'pointerdown':
    case 'pointermove':
      return (event) => updateCamera(handlePointer(event))
    case 'wheel':
      return (event) => updateCamera(handleWheel(event))
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

// This is a little bit wonky and could use some polish
export const handleWheel =
  (event: PointerEvent) =>
  ({ origin: [x, y, z], coords: [r, theta, phi] }) => {
    const {
      deltaX,
      altKey, // `true` on trackpads when 2-finger-swiping (and when alt key is pressed)
      ctrlKey // `true` on trackpads when pinch-zooming (and when ctrl key is pressed)
    } = event

    // // Move camera
    // if (altKey) return handleMove({ deltaXY: [-deltaX, -event.deltaY] })
    // // Rotate camera
    // return actions.updatePosition(
    //   ({ coords: [oldR, oldTheta, oldPhi] }: CameraState) => {
    //     // Swap deltaY/deltaZ if ctrl key pressed (or user is pinch-zooming on trackpad)
    //     const deltaY = ctrlKey ? event.deltaZ : event.deltaY
    //     const deltaZ = ctrlKey ? event.deltaY : event.deltaZ
    //     const r = oldR + deltaY / (500 / oldR) // Dolly in-out (faster as we move out further)
    //     const theta = oldTheta - deltaZ / 100 // Tilt up-down
    //     const phi = oldPhi + deltaX / 200 // Pan left-right
    //     return { coords: [r, theta, phi] }
    //   }
    // )
  }

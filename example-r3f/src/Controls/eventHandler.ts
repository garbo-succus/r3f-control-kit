import { normalizeCoords, bitmaskToArray } from '../control-kit'
import { cameraConfig, updateCamera } from './cameraState'

export const eventHandler = ({ type, buttons, movementX, movementY }) =>
  updateCamera(({ origin: [x, y, z], coords: [r, theta, phi] }) => {
    if (type !== 'pointermove') return null

    const [leftButton, rightButton, middleButton] = bitmaskToArray(buttons)

    // Rotate camera
    if (leftButton) {
      const coords = normalizeCoords(cameraConfig, [
        r,
        theta + movementY / 100,
        phi - movementX / 100
      ])
      return { coords }
    }

    // Move camera
    if (rightButton) {
      const origin = [x + movementX / 100, y, z + movementY / 100]
      return { origin }
    }

    // Reset camera
    if (middleButton) {
      return {
        origin: cameraConfig.defaultOrigin,
        coords: cameraConfig.defaultCoords
      }
    }
  })

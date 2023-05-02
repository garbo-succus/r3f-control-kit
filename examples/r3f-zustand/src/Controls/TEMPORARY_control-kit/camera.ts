// TODO: Only import specific MathUtils
import { Vector2, MathUtils } from 'three'

// Reusable vectors (to save on GC)
const handleMoveVector = new Vector2()
const vector00 = new Vector2(0, 0)

// Rotate X/Y vector by phi
// TODO: Give this a better name, change arguments
export const getScreenXY = ({ movementX, movementY, phi }) =>
  handleMoveVector
    .set(movementX, movementY)
    .rotateAround(vector00, -phi) // Rotate screen X/Y coords to match camera rotation
    .toArray()

// Normalize phi and constrain r & theta for an orbit camera.
// This is basically half of an OrbitCamera (the 3D spherical camera transform is the other half).
// TODO: Give this a better name
export const normalizeCoords = (
  { minR = 0, maxR = Infinity, minTheta = 0, maxTheta = Math.PI / 2 } = {},
  [r, theta, phi]: number[]
) => [
  MathUtils.clamp(r, minR, maxR),
  MathUtils.clamp(theta, minTheta, maxTheta),
  MathUtils.euclideanModulo(phi, Math.PI * 2)
]

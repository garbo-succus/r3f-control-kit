// TODO: Only import specific MathUtils
import { MathUtils } from 'three'

// Normalize phi and constrain r & theta for an orbit camera.
// This is basically half of an OrbitCamera (the 3D spherical camera transform is the other half).
// TODO: The name of this function is not descriptive enough (should be similar to a future 3D spherical transform fn)
export const normalizeCoords = (
  { minR = 0, maxR = Infinity, minTheta = 0, maxTheta = Math.PI / 2 } = {},
  [r, theta, phi]: number[]
) => [
  MathUtils.clamp(r, minR, maxR),
  MathUtils.clamp(theta, minTheta, maxTheta),
  MathUtils.euclideanModulo(phi, Math.PI * 2)
]

type Vec2 = [number, number]
type Vec3 = [number, number, number]

interface CameraState {
  minR: number
  maxR: number
  minTheta: number
  maxTheta: number
  rotationScale: Vec2
  initialOrigin: Vec3
  initialCoords: Vec3
  coords: Vec3
  origin: Vec3
  actions: {
    [updatePosition: string]: function
    [resetPosition: string]: function
    [updateConfig: string]: function
  }
}

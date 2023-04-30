import { Vector2 } from 'three'

// Reusable vectors (to save on GC)
const handleMoveVector = new Vector2()
const vector00 = new Vector2(0, 0)

// Rotate X/Y vector by phi
// TODO: Export this as a control-kit function
export const getScreenXY = ({ movementX, movementY, phi }) =>
  handleMoveVector
    .set(movementX, movementY)
    .rotateAround(vector00, -phi) // Rotate screen X/Y coords to match camera rotation
    .toArray()

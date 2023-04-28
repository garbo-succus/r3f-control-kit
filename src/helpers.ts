import { MathUtils } from 'three'

// Normalize phi and constrain r & theta for an orbit camera
export const normalizeCoords = (
  { minR = 0, maxR = Infinity, minTheta = 0, maxTheta = Math.PI / 2 } = {},
  [r, theta, phi]: number[]
) => [
  MathUtils.clamp(r, minR, maxR),
  MathUtils.clamp(theta, minTheta, maxTheta),
  MathUtils.euclideanModulo(phi, Math.PI * 2)
]

// Convert a PointerEvent "buttons" prop into an array of booleans
export const bitmaskToArray = (i: number) => [
  !!(i & 1),
  !!(i & 2),
  !!(i & 4),
  !!(i & 8),
  !!(i & 16)
]

// Add event listeners to a list of events on a target; return a function to remove them
export const addEventListeners = (
  target: undefined | HTMLElement,
  types: string[],
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => {
  if (!target) return () => undefined
  types.forEach((type) => target.addEventListener(type, listener, options))
  return () =>
    types.forEach((type) => target.removeEventListener(type, listener, options))
}

// PreventDefault on a list of events
export const addPreventDefaults = (
  target: undefined | HTMLElement,
  types: undefined | string[]
) => addEventListeners(target, types, (event) => event.preventDefault())

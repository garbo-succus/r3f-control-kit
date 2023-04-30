import { create } from 'zustand'
import { useEffect } from 'react'

export const useCameraConfig = create((set) => ({
  minR: 1,
  maxR: Infinity,
  minTheta: Math.PI / 16,
  maxTheta: Math.PI / 2,
  defaultOrigin: [0, 0, 0],
  defaultCoords: [5, Math.PI / 4, 0]
}))

export const useCamera = create(() => ({
  origin: useCameraConfig.getState().defaultOrigin,
  coords: useCameraConfig.getState().defaultCoords
}))

// If you wish to keep the updateCamera action inside your Zustand state:
//   export const useCamera = create((set) => ({
//     origin: useCameraConfig.getState().defaultOrigin,
//     useCameraConfig.getState().defaultCoords,
//     updateCamera: (updater: Function) =>
//       set(
//         (state) => updater(state) ?? {} // Ignore null/undefined
//       )
//     }))
//
//   export const { updateCamera } = useCamera.getState()

// Instead, we're doing a manual imperative update for per:
export const updateCamera = (updater) => {
  const oldState = useCamera.getState()
  const state = updater(oldState)
  if (state === undefined || state === null) return
  if (!state.origin) state.origin = oldState.origin
  if (!state.coords) state.coords = oldState.coords
  useCamera.setState(state)
}

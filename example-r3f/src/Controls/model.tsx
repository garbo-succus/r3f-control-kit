import { create } from 'zustand'

export const cameraConfig = {
  minR: 1,
  maxR: Infinity,
  minTheta: Math.PI / 16,
  maxTheta: Math.PI / 2,
  defaultOrigin: [0, 0, 0],
  defaultCoords: [16, Math.PI / 4, 0]
}

export const useCamera = create((set) => ({
  origin: cameraConfig.defaultOrigin,
  coords: cameraConfig.defaultCoords,
  updateCamera: (updater: Function) =>
    set(
      (state) => updater(state) ?? {} // Ignore null/undefined
    )
}))

export const { updateCamera } = useCamera.getState()

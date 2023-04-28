import { memo, useEffect } from 'react'
import { addEventListeners, addPreventDefaults } from './dom'

interface ControlRigProps {
  target?: HTMLElement
  onEvent: any
  options?: boolean | AddEventListenerOptions
  preventDefaults?: string[]
  eventTypes?: string[]
}

export const ControlRig = memo(
  ({
    target,
    onEvent,
    options,
    preventDefaults = [],
    eventTypes = []
  }: ControlRigProps) => {
    useEffect(
      () => addPreventDefaults(target, preventDefaults),
      [target, preventDefaults]
    )
    useEffect(
      () => addEventListeners(target, eventTypes, onEvent, options),
      [target, eventTypes, onEvent, options]
    )
    return null
  }
)

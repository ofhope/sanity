import React from 'react'
import {Button, ButtonProps, ThemeColorSchemeKey} from '@sanity/ui'

export interface CollapseMenuButtonProps
  extends Omit<ButtonProps, 'text' | 'icon' | 'children' | 'iconRight'> {
  text: React.ReactNode
  icon: React.ComponentType | React.ReactNode
  tooltipScheme?: ThemeColorSchemeKey
}

export const CollapseMenuButton = React.forwardRef(function CollapseMenuButton(
  props: CollapseMenuButtonProps,
  ref: React.Ref<HTMLButtonElement>
) {
  return <Button {...props} ref={ref} data-ui="CollapseMenuButton" />
})

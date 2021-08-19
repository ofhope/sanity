import {StateLink} from '@sanity/state-router/components'
import React from 'react'
import {Button, Stack} from '@sanity/ui'
import {PlugIcon} from '@sanity/icons'
import {Router, Tool} from '../../types'

interface Props {
  activeToolName: string
  isVisible: boolean
  onSwitchTool: () => void
  router: Router
  tools: Tool[]
}

export default function ToolMenu(props: Props) {
  const {activeToolName, isVisible, onSwitchTool, router, tools} = props

  return (
    <Stack as="ul" space={2}>
      {tools.map((tool) => {
        const title = tool.title || tool.name || undefined

        const LinkComponent = (linkProps) => {
          return (
            <StateLink
              {...linkProps}
              tabIndex={isVisible ? 0 : -1}
              state={{...router.state, tool: tool.name, [tool.name]: undefined}}
            />
          )
        }

        return (
          <li key={tool.name}>
            <Button
              style={{width: '100%'}}
              as={LinkComponent}
              justify="flex-start"
              text={title}
              icon={tool.icon || PlugIcon}
              mode="bleed"
              onClick={onSwitchTool}
              selected={activeToolName === tool.name}
            />
          </li>
        )
      })}
    </Stack>
  )
}

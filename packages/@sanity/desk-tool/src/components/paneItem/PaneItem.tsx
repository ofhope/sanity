import React, {useMemo} from 'react'
import {FolderIcon, ChevronRightIcon, DocumentIcon} from '@sanity/icons'
import {SanityDocument} from '@sanity/types'
import {Card, Text} from '@sanity/ui'
import schema from 'part:@sanity/base/schema'
import {SanityDefaultPreview} from 'part:@sanity/base/preview'
import {DocumentPaneItemPreview} from '../DocumentPaneItemPreview'
import getIconWithFallback from '../../utils/getIconWithFallback'
import {MissingSchemaType} from '../MissingSchemaType'
import {usePaneRouter} from '../../contexts/paneRouter'

interface PaneItemProps {
  id: string
  layout?: 'inline' | 'block' | 'default' | 'card' | 'media'
  isSelected?: boolean
  isActive?: boolean
  icon?: boolean | React.FunctionComponent
  value: SanityDocument
  schemaType?: {
    name?: string
    icon?: React.FunctionComponent
  }
}

export function PaneItem(props: PaneItemProps) {
  const {id, isSelected, schemaType, layout = 'default', icon, value, isActive} = props
  const {ChildLink} = usePaneRouter()
  const hasSchemaType = Boolean(schemaType && schemaType.name && schema.get(schemaType.name))

  const preview = useMemo(() => {
    if (value && value._id) {
      if (!hasSchemaType) {
        return <MissingSchemaType value={value} />
      }

      return (
        <DocumentPaneItemPreview
          icon={getIconWithFallback(icon, schemaType, DocumentIcon)}
          layout={layout}
          schemaType={schemaType}
          value={value}
        />
      )
    }

    return (
      <SanityDefaultPreview
        status={
          <Text muted size={1}>
            <ChevronRightIcon />
          </Text>
        }
        icon={getIconWithFallback(icon, schemaType, FolderIcon)}
        layout={layout}
        value={value}
      />
    )
  }, [hasSchemaType, icon, layout, schemaType, value])

  const LinkComponent = useMemo(
    () =>
      // eslint-disable-next-line no-shadow
      function LinkComponent(linkProps) {
        return <ChildLink {...linkProps} childId={id} />
      },
    [ChildLink, id]
  )

  return useMemo(
    () => (
      <Card
        __unstable_focusRing
        as={LinkComponent}
        data-as="a"
        data-ui="PaneItem"
        padding={2}
        radius={2}
        pressed={!isActive && isSelected}
        selected={isActive && isSelected}
        tone="inherit"
      >
        {preview}
      </Card>
    ),
    [isActive, isSelected, LinkComponent, preview]
  )
}

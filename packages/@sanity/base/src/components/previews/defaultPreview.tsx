import React from 'react'
import {Box, Flex, Stack, Text, Skeleton, TextSkeleton, rem} from '@sanity/ui'
import styled from 'styled-components'
import {getDevicePixelRatio} from 'use-device-pixel-ratio'
import {PreviewProps} from './types'

const Root = styled(Flex)`
  height: 35px;
`

const MediaWrapper = styled(Flex)`
  position: relative;
  width: 35px;
  height: 35px;
  min-width: 35px;
  border-radius: ${({theme}) => rem(theme.sanity.radius[2])};

  & img {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    object-fit: contain;
    border-radius: inherit;
    width: 100%;
    height: 100%;
  }

  & svg {
    display: block;
    font-size: calc(21 / 16 * 1em);
  }

  & [data-sanity-icon] {
    display: block;
    font-size: calc(33 / 16 * 1em);
    margin: calc(6 / 36 * -1em);
  }

  & *:not(svg) + span {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    box-shadow: inset 0 0 0 1px var(--card-fg-color);
    opacity: 0.2;
    border-radius: inherit;
  }
`

MediaWrapper.displayName = 'MediaWrapper'

export const DefaultPreview = (props: PreviewProps<'default'>) => {
  const {title, subtitle, media, status, isPlaceholder, children} = props

  return (
    <Root align="center" className="studio-preview studio-preview--default">
      {isPlaceholder && (
        <>
          {media !== false && (
            <Skeleton
              className="studio-preview__media"
              style={{width: 35, height: 35}}
              radius={2}
              marginRight={2}
              animated
            />
          )}

          <Stack
            className="studio-preview__content"
            flex={1}
            paddingLeft={media === false ? 1 : 0}
            space={2}
          >
            <TextSkeleton
              className="studio-preview__title"
              style={{maxWidth: 320}}
              radius={1}
              animated
            />
            <TextSkeleton
              className="studio-preview__subtitle"
              style={{maxWidth: 200}}
              radius={1}
              size={1}
              animated
            />
          </Stack>
        </>
      )}

      {!isPlaceholder && (
        <>
          {media !== false && media !== undefined && (
            <MediaWrapper
              align="center"
              className="studio-preview__media"
              justify="center"
              marginRight={2}
              overflow="hidden"
            >
              {typeof media === 'function' &&
                media({
                  dimensions: {
                    width: 35,
                    height: 35,
                    aspect: 1,
                    fit: 'crop',
                    dpr: getDevicePixelRatio(),
                  },
                  layout: 'default',
                })}

              {typeof media === 'string' && <div>{media}</div>}

              {React.isValidElement(media) && media}

              <span />
            </MediaWrapper>
          )}

          <Stack
            className="studio-preview__content"
            flex={1}
            paddingLeft={media === false ? 1 : 0}
            space={2}
          >
            <Text
              className="studio-preview__title"
              textOverflow="ellipsis"
              style={{color: 'inherit'}}
            >
              {title && typeof title === 'function' ? title({layout: 'default'}) : title}
              {!title && <>Untitled</>}
            </Text>

            {subtitle && (
              <Text className="studio-preview__subtitle" muted size={1} textOverflow="ellipsis">
                {typeof subtitle === 'function' ? subtitle({layout: 'default'}) : subtitle}
              </Text>
            )}

            {children && <div>{children}</div>}
          </Stack>

          {status && (
            <Box className="studio-preview__status" paddingLeft={3} paddingRight={1}>
              {typeof status === 'function' ? status({layout: 'default'}) : status}
            </Box>
          )}
        </>
      )}
    </Root>
  )
}

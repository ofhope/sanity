import React from 'react'
import {Box, Card, Code, Flex, Stack, Text} from '@sanity/ui'

interface VersionsTableProps {
  headings: string[]
  rows: {
    name: string
    items: string[]
  }[]
}

export function VersionsTable(props: VersionsTableProps) {
  const {headings, rows} = props

  if (rows.length === 0) {
    return null
  }

  return (
    <Stack space={3} role="table">
      <Flex>
        <Box flex={1}>
          <Text size={1} weight="semibold" role="columnheader" textOverflow="ellipsis">
            {headings[0]}
          </Text>
        </Box>

        <Flex flex={1}>
          {headings.slice(1, headings.length).map((heading) => (
            <Box flex={1} key={heading}>
              <Text size={1} weight="semibold" role="columnheader" textOverflow="ellipsis">
                {heading}
              </Text>
            </Box>
          ))}
        </Flex>
      </Flex>

      <Box>
        {rows?.map((row) => (
          <Card
            key={row.name}
            display="flex"
            data-as="a"
            paddingY={3}
            paddingX={1}
            sizing="border"
            role="row"
          >
            <Flex gap={2} flex={1}>
              <Box flex={1} role="rowheader">
                <Code>
                  <Text textOverflow="ellipsis" as={Code}>
                    {row.name}
                  </Text>
                </Code>
              </Box>
              <Flex flex={1}>
                {row?.items?.map((item) => (
                  <Box flex={1} role="gridcell" key={item}>
                    <Code>
                      <Text textOverflow="ellipsis" as={Code}>
                        {item}
                      </Text>
                    </Code>
                  </Box>
                ))}
              </Flex>
            </Flex>
          </Card>
        ))}
      </Box>
    </Stack>
  )
}

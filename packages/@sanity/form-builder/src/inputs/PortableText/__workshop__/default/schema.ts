import Schema from '@sanity/schema'

const _portableTextType = {
  type: 'array',
  name: 'body',
  of: [{type: 'block'}],
}

export const schema = Schema.compile({
  name: 'default',
  types: [_portableTextType],
})

export const portableTextType = schema.get('body')

import Schema from '@sanity/schema'

const imageType = {
  type: 'image',
  name: 'blockImage',
}

const someObject = {
  type: 'object',
  name: 'someObject',
  fields: [{type: 'string', name: 'color'}],
}

const blockType = {
  type: 'block',
  name: 'customBlockType',
  styles: [
    {title: 'Normal', value: 'normal'},
    {title: 'H1', value: 'h1'},
    {title: 'H2', value: 'h2'},
    {title: 'H3', value: 'h3'},
    {title: 'H4', value: 'h4'},
    {title: 'H5', value: 'h5'},
    {title: 'H6', value: 'h6'},
    {title: 'Quote', value: 'blockquote'},
  ],
  of: [someObject, imageType],
}

const _portableTextType = {
  type: 'array',
  name: 'body',
  of: [blockType],
}

export const schema = Schema.compile({
  name: 'default',
  types: [_portableTextType],
})

export const portableTextType = schema.get('body')

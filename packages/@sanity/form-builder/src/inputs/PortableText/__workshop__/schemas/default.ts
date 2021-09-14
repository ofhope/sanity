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

export const values = {
  empty: undefined,
  withText: [
    {
      _type: 'block',
      _key: 'a',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'a1',
          text: 'Lala',
          marks: [],
        },
      ],
    },
  ],
}

export const valueOptions = {Empty: 'empty', 'With Text': 'withText'}

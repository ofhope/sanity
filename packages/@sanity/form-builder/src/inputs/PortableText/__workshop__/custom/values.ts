export const values = {
  empty: undefined,
  withImage: [
    {
      _type: 'customBlockType',
      _key: 'a',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'a1',
          text: 'Here is some text',
          marks: [],
        },
      ],
    },
    {
      _type: 'blockImage',
      _key: 'b',
    },
  ],
}

export const valueOptions = {Empty: 'empty', 'With image': 'withImage'}

export interface OptionValue {
  id: string
  icon?: React.ReactNode
  text?: string
}

export type GroupsValue = OptionValue[][]

export interface CollapseMenuProps {
  groups: GroupsValue
  renderOption?: (option: OptionValue) => React.ReactElement
}

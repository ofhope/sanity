// eslint-disable-next-line
export type StructurePane = any

export interface RouterPane {
  id: string
  params: Record<string, string>
  payload?: unknown
}

export interface StructureErrorType {
  helpId?: string
  message: string
  path?: Array<string | number>
  stack: string
}

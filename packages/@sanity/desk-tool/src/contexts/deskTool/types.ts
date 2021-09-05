/**
 * @internal
 */
export interface DeskToolFeatures {
  reviewChanges: boolean
  splitPanes: boolean
  splitViews: boolean
}

/**
 * @internal
 */
export interface DeskToolContextValue {
  features: DeskToolFeatures
  layoutCollapsed: boolean
}

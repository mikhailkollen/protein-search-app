export interface Filter {
  name: string
  value?: string
  minLength?: string
  maxLength?: string
}

export type Filters = Filter[]

export interface SearchState {
  currentUser: any
  searchQuery: string
  results: any
  error: any
  selectedFilters: Filters | null
  isFiltersModalOpen: boolean
}

export interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

export interface ProteinData {
  organism: string
  accession: string
  uniProtkbId: string
  description: string
  gene: string
  length: number
  lastUpdated: string
  mass: number
  checksum: string
  sequence: string
}

export interface ProteinTabsProps {
  data: ProteinData
}

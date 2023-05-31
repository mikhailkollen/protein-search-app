export interface Filter {
  name: string;
  value?: string;
  minLength?: string;
  maxLength?: string;
}

export type Filters = Filter[];


export interface SearchState {
  currentUser: any
  searchQuery: string
  results: any
  error: any
  selectedFilters: Filters | null
  isFiltersModalOpen: boolean
}
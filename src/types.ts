export interface Filter {
  name: string;
  value?: string;
  minLength?: string;
  maxLength?: string;
}

export type Filters = Filter[];

export interface ProteinTabsProps {
  data: ProteinData;
}

export interface User {
  uid: string;
  email: string | null;
}

export interface SearchState {
  currentUser: User | null;
  searchQuery: string;
  results: any;
  error?: string;
  selectedFilters: Filters | null;
  isFiltersModalOpen: boolean;
}

export interface RootState {
  search: SearchState;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface ProteinData {
  organism: string;
  accession: string;
  uniProtkbId: string;
  description: string;
  gene: string;
  length: number;
  lastUpdated: string;
  mass: number;
  checksum: string;
  sequence: string;
}

export interface ProteinTabsProps {
  data: ProteinData;
}

export interface CitationCrossReference {
  id: string;
}

export interface Citation {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  firstPage: string;
  lastPage: string;
  publicationDate: string;
  citationCrossReferences: CitationCrossReference[];
}

export interface Reference {
  source: {
    name: string;
  };
  sourceCategories: string[];
  referencePositions: string[];
}

export interface Publication {
  citation: Citation;
  references: Reference[];
}

export interface PublicationsProps {
  publications: Publication[];
}

export interface PublicationProps {
  publication: Publication;
}

export interface PublicationAuthorProps {
  authors: string[] | undefined;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React.JSX {
    interface IntrinsicElements {
      "protvista-uniprot": { accession: string };
    }
  }
}

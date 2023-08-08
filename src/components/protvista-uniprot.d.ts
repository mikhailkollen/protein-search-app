declare module "protvista-uniprot" {
  import React from "react"

  export interface ProtvistaUniprotProps {
    accession: string
  }

  const ProtvistaUniprot: React.ComponentType<ProtvistaUniprotProps>
  export default ProtvistaUniprot
}

import React from "react"
import ProtvistaUniprot from "protvista-uniprot"

window.customElements.define("protvista-uniprot", ProtvistaUniprot as any)

const ProtvistaUniprotTab: React.FC<{ data: { accession: string } }> = ({
  data,
}) => {
  return (
    <div>
      <ProtvistaUniprot accession={data.accession} />
    </div>
  )
}

export default ProtvistaUniprotTab

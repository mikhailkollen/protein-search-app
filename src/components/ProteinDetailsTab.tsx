import React, { useCallback, useState } from "react"

import CopyIcon from "../assets/CopyIcon"
import { ProteinData } from "../types"

const ProteinDetailsTab = (data: ProteinData) => {
  const [isCopied, setIsCopied] = useState(false)

  const { length, mass, lastUpdated, checksum, sequence } = data

  const copyToClipboard = useCallback(() => {
    window.navigator.clipboard.writeText(sequence)
    setIsCopied(true)
  }, [sequence])

  return (
    <React.Fragment>
      <h2 className="title">{"Sequence"}</h2>
      <div className="flex-container">
        <div className="column">
          <div>
            <h3 className="data-title">{"Length"}</h3>
            <p className="data-text">{length}</p>
          </div>
          <div>
            <h3 className="data-title">{"Mass"}</h3>
            <p className="data-text">{mass}</p>
          </div>
        </div>
        <div className="column">
          <div>
            <h3 className="data-title">{"Last Updated"}</h3>
            <p className="data-text">{lastUpdated}</p>
          </div>
          <div>
            <h3 className="data-title">{"Checksum"}</h3>
            <p className="data-text">{checksum}</p>
          </div>
        </div>
      </div>
      <div className="sequence-container">
        <p className="data-text">{sequence}</p>
        <button className="copy-btn" onClick={copyToClipboard}>
          <CopyIcon /> <span>{isCopied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </React.Fragment>
  )
}

export default ProteinDetailsTab

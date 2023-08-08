import { useState } from "react";
import CopyIcon from "../assets/CopyIcon";
import { ProteinData } from "../types";


const ProteinDetailsTab = (data: ProteinData) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <>
      <h2 className="title">{"Sequence"}</h2>
      <div className="flex-container">
        <div className="column">
          <div>
            <h3 className="data-title">{"Length"}</h3>
            <p className="data-text">{data.length}</p>
          </div>
          <div>
            <h3 className="data-title">{"Mass"}</h3>
            <p className="data-text">{data.mass}</p>
          </div>
        </div>
        <div className="column">
          <div>
            <h3 className="data-title">{"Last Updated"}</h3>
            <p className="data-text">{data.lastUpdated}</p>
          </div>
          <div>
            <h3 className="data-title">{"Checksum"}</h3>
            <p className="data-text">{data.checksum}</p>
          </div>
        </div>
      </div>
      <div className="sequence-container">
        <p className="data-text">{data.sequence}</p>
        <button
          className="copy-btn"
          onClick={() => {
            navigator.clipboard.writeText(data.sequence);
            setIsCopied(true);
          }}
        >
          <CopyIcon /> <span>{isCopied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </>
  );
};

export default ProteinDetailsTab;

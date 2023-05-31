import * as React from "react"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import ProtvistaUniprot from 'protvista-uniprot';
import styled from "styled-components"

import CopyIcon from "../assets/CopyIcon"
import ExternalLinkIcon from "../assets/ExternalLinkIcon"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "protvista-uniprot": any
    }
  }
}

window.customElements.define("protvista-uniprot", ProtvistaUniprot as any)

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface ProteinData {
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

interface ProteinTabsProps {
  data: ProteinData
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ paddingTop: 3 }}>
          <Wrapper>{children}</Wrapper>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

const ProteinTabs: React.FC<ProteinTabsProps> = ({ data }) => {
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    event.target!
    setValue(newValue)
  }

  const [isCopied, setIsCopied] = React.useState(false)
  const [publications, setPublications] = React.useState([]) as any

  const fetchPublications = async () => {
    if (!data.accession) {
      return
    }

    const response = await fetch(
      `https://rest.uniprot.org/uniprotkb/${data.accession}/publications`,
    )

    const dataResponse = await response.json()

    console.log(dataResponse.results)

    setPublications(dataResponse.results)

    return publications
  }

  useEffect(() => {
    fetchPublications()
  }, [data])

  return (
    <Box sx={{ width: "100%" }}>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          TabIndicatorProps={{
            style: {
              backgroundColor: "var(--active-blue)",
              color: "var(--dark-grey-3)",
            },
          }}
        >
          <Tab
            label="Details"
            {...a11yProps(0)}
            sx={{
              fontFamily: "Open Sans",
              textTransform: "initial",
              fontWeight: "600",
            }}
          />
          <Tab
            label="Feature Viewer"
            {...a11yProps(1)}
            sx={{
              fontFamily: "Open Sans",
              textTransform: "initial",
              fontWeight: "600",
            }}
          />
          <Tab
            label="Publications"
            sx={{
              fontFamily: "Open Sans",
              textTransform: "initial",
              fontWeight: "600",
            }}
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
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
              navigator.clipboard.writeText(data.sequence)
              setIsCopied(true)
            }}
          >
            <CopyIcon /> <span>{isCopied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div><protvista-uniprot accession={data.accession} /></div>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <div className="publications">
          {publications &&
            publications.map((publication: any) => (
              <div
                key={publication.citation.id}
                className="publication-container"
              >
                <h3 className="publication-title">
                  {publication.citation.title}
                </h3>
                <p className="publication-authors">
                  {publication.citation.authors
                    ? (publication.citation.authors.length > 15
                      ? publication.citation.authors
                          .slice(0, 15)
                          .map((author: string, index: number) => {
                            return index ===
                              publication.citation.authors.slice(0, 15).length -
                                1 ? (
                              <span key={index}>
                                {author}
                                {"..."}
                              </span>
                            ) : (
                              <span key={index}>
                                {author}
                                {", "}
                              </span>
                            )
                          })
                      : publication.citation.authors.map(
                          (author: string, index: number) => {
                            return index ===
                              publication.citation.authors.length - 1 ? (
                              <span key={index}>{author}</span>
                            ) : (
                              <span key={index}>
                                {author}
                                {", "}
                              </span>
                            )
                          },
                        ))
                    : ""}
                </p>
                <p>
                  <span className="subtitle-grey-text">{"Categories: "}</span>
                  {publication.references &&
                  publication.references[0] &&
                  publication.references[0].sourceCategories
                    ? publication.references[0].sourceCategories.join(", ")
                    : ""}
                </p>
                <p>
                  <span className="subtitle-grey-text">{"Cited for: "}</span>
                  {publication.references &&
                  publication.references[0] &&
                  publication.references[0].referencePositions
                    ? publication.references[0].referencePositions.join(", ")
                    : ""}
                </p>
                <p>
                  <span className="subtitle-grey-text">{"Source: "}</span>
                  <span>
                    {publication.references &&
                      publication.references[0] &&
                      publication.references[0].source.name}
                  </span>
                </p>

                {publication.citation.citationCrossReferences &&
                publication.citation.citationCrossReferences[0] ? (
                  <div className="publication-links-container">
                    <Link
                      className="publication-link"
                      to={`https://pubmed.ncbi.nlm.nih.gov/${publication.citation.citationCrossReferences[0].id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {"PubMed "}
                      {<ExternalLinkIcon />}
                    </Link>{" "}
                    <Link
                      className="publication-link"
                      to={`https://europepmc.org/article/MED/${publication.citation.citationCrossReferences[0].id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {"Europe PMC "}
                      {<ExternalLinkIcon />}
                    </Link>{" "}
                    <Link
                      className={`publication-link ${
                        !publication.citation.citationCrossReferences[1]?.id &&
                        "disabled"
                      }`}
                      to={
                        publication.citation?.citationCrossReferences[1]?.id
                          ? `https://dx.doi.org/${publication.citation.citationCrossReferences[1].id}`
                          : ""
                      }
                      onClick={(event) => {
                        if (
                          !publication.citation.citationCrossReferences[1]?.id
                        ) {
                          event.preventDefault()
                        }
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {`${publication.citation.journal} :${publication.citation.firstPage}-${publication.citation.lastPage} (${publication.citation.publicationDate})`}{" "}
                      {<ExternalLinkIcon />}
                    </Link>{" "}
                  </div>
                ) : (
                  ""
                )}
              </div>
            ))}
        </div>
      </TabPanel>
    </Box>
  )
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  .title {
    color: var(--black);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 17px;
  }

  .data-title {
    color: var(--dark-grey-3);
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .data-text {
    color: var(--black);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }

  .sequence-container {
    width: 100%;
    word-break: break-all;
    background-color: var(--light-grey-2);
    padding: 12px;
    border-radius: 8px;
    position: relative;
    .copy-btn {
      position: absolute;
      top: -25px;
      right: 0;
      display: flex;
      gap: 5px;
      font-weight: 600;
      align-items: center;
    }
  }
  .flex-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 21px;
    width: 50%;
    text-align: left;
    .column {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }
  }
  .publications {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 15px;
    text-align: left;
    margin-bottom: 50px;

    .publication-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      max-width: 800px;
      padding: 20px 23px;
      background-color: var(--grey);
      border-radius: 8px;

      .publication-title {
        color: var(--dark);
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .publication-authors span {
        color: var(--dark);
        font-size: 14px;
        font-weight: 400;
        text-decoration: underline;
      }
      .subtitle-grey-text {
        color: var(--dark-grey);
      }
      p {
        font-size: 14px;
      }
      p:last-of-type {
        margin-bottom: 23px;
      }
      .publication-links-container {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        .publication-link {
          border: 1px solid var(--active-blue);
          border-radius: 8px;
          padding: 5px 9px;
          color: var(--active-blue);
          vertical-align: middle;
          line-height: 12px;
        }
        .publication-link.disabled {
          border: 1px solid var(--dark-grey-2);
          color: var(--dark-grey-2);
          svg path {
            fill: var(--dark-grey-2);
          }
        }
      }
    }
  }
`

export default ProteinTabs

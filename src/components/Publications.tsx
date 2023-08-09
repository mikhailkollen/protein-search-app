import { Link } from "react-router-dom"
import styled from "styled-components"

import ExternalLinkIcon from "../assets/ExternalLinkIcon"
import {
  PublicationAuthorProps,
  PublicationProps,
  PublicationsProps,
} from "../types"

const PublicationAuthor = ({ authors }: PublicationAuthorProps) => {
  if (!authors) {
    return null
  }

  const MAX_AUTHORS = 15

  const authorList =
    authors.length > MAX_AUTHORS
      ? authors.slice(0, MAX_AUTHORS).join(", ") + "..."
      : authors.join(", ")

  return <span>{authorList}</span>
}

const Publication = ({ publication }: PublicationProps) => {
  if (!publication) {
    return null
  }

  const citation = publication.citation
  const references = publication.references?.[0]

  return (
    <div className="publication-container">
      <h3 className="publication-title">{citation.title}</h3>
      <p className="publication-authors">
        <PublicationAuthor authors={citation.authors} />
      </p>
      <p>
        <span className="subtitle-grey-text">{"Categories: "}</span>
        {references?.sourceCategories?.join(", ")}
      </p>
      <p>
        <span className="subtitle-grey-text">{"Cited for: "}</span>
        {references?.referencePositions?.join(", ")}
      </p>
      <p>
        <span className="subtitle-grey-text">{"Source: "}</span>
        <span>{references?.source?.name}</span>
      </p>
      {citation.citationCrossReferences?.[0] && (
        <div className="publication-links-container">
          <Link
            className="publication-link"
            to={`https://pubmed.ncbi.nlm.nih.gov/${citation.citationCrossReferences[0].id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {"PubMed "}
            {<ExternalLinkIcon />}
          </Link>{" "}
          <Link
            className="publication-link"
            to={`https://europepmc.org/article/MED/${citation.citationCrossReferences[0].id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {"Europe PMC "}
            {<ExternalLinkIcon />}
          </Link>{" "}
          <Link
            className={`publication-link ${
              !citation.citationCrossReferences[1]?.id && "disabled"
            }`}
            to={
              citation.citationCrossReferences[1]?.id
                ? `https://dx.doi.org/${citation.citationCrossReferences[1].id}`
                : ""
            }
            onClick={(event) => {
              if (!citation.citationCrossReferences[1]?.id) {
                event.preventDefault()
              }
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`${citation.journal} :${citation.firstPage}-${citation.lastPage} (${citation.publicationDate})`}{" "}
            {<ExternalLinkIcon />}
          </Link>{" "}
        </div>
      )}
    </div>
  )
}

const Publications = ({ publications }: PublicationsProps) => {
  return (
    <Wrapper>
      {publications?.map((publication) => (
        <Publication key={publication.citation.id} publication={publication} />
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.section`
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
`

export default Publications

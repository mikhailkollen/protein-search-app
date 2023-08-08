import { Link } from "react-router-dom"
import styled from "styled-components"

import ExternalLinkIcon from "../assets/ExternalLinkIcon"

const Publications = ({ publications }: any) => {
  return (
    <Wrapper>
      {publications &&
        publications.map((publication: any) => (
          <div key={publication.citation.id} className="publication-container">
            <h3 className="publication-title">{publication.citation.title}</h3>
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
                    if (!publication.citation.citationCrossReferences[1]?.id) {
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

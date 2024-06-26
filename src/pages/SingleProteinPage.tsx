import React, { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"

import Header from "../components/Header"
import ProteinTabs from "../components/ProteinTabs"
import { ProteinData } from "../types"

const SingleProteinPage = () => {
  const { id } = useParams()

  const url = `https://rest.uniprot.org/uniprotkb/${id}`
  const [data, setData] = useState({} as ProteinData)

  const fetchSingleProtein = useCallback(async () => {
    const response = await fetch(url)
    const responseData = await response.json()

    setData({
      accession: responseData.primaryAccession || "N/A",
      uniProtkbId: responseData.uniProtkbId || "UniProtKB",
      description:
        responseData.proteinDescription?.recommendedName?.fullName?.value ||
        "N/A",
      gene: responseData.genes?.[0]?.geneName?.value || "N/A",
      length: responseData.sequence?.length || "N/A",
      lastUpdated: responseData.entryAudit?.lastAnnotationUpdateDate || "N/A",
      mass: responseData.sequence?.molWeight || "N/A",
      checksum: responseData.sequence?.crc64 || "N/A",
      sequence: responseData.sequence?.value || "N/A",
      organism: responseData.organism?.scientificName || "N/A",
    })
  }, [url])

  useEffect(() => {
    fetchSingleProtein()
    document.title = `${id} / UniProtKB`
  }, [id, fetchSingleProtein])

  return (
    <React.Fragment>
      <Header />
      <Wrapper>
        <main>
          <header>
            <div className="title-container">
              <h1>
                {id}
                {" / "}
                {data.uniProtkbId || "UniProtKB"}
              </h1>
              <span>{data.organism || "Organism"}</span>
            </div>
            <h2>{"Protein"}</h2>
            <p>{data.description || "N/A"}</p>
            <h2>{"Gene"}</h2>
            <p>{data.gene || "N/A"}</p>
          </header>
          <ProteinTabs data={data} />
        </main>
      </Wrapper>
    </React.Fragment>
  )
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 80%;
  margin-top: 30px;
  main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 130px;
    header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      .title-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        span {
          background-color: var(--light-blue);
          border-radius: 12px;
          padding: 2px 12px;
          margin-left: 13px;
        }
      }
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
    }
    h2 {
      color: var(--dark-grey-3);
      margin-bottom: 12px;
    }

    p {
      margin-bottom: 12px;
    }
  }
`

export default SingleProteinPage

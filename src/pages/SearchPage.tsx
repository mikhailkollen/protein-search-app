import { useEffect, useRef } from "react"
import styled from "styled-components"

import { useAppDispatch, useAppSelector } from "../app/hooks"
import FiltersIcon from "../assets/FiltersIcon"
import FiltersModal from "../components/FiltersModal"
import Header from "../components/Header"
import TableView from "../components/TableView"
import {
  setFilters,
  setIsFiltersModalOpen,
  setSearchQuery,
} from "../features/search/searchSlice"

const SearchPage = () => {
  const dispatch = useAppDispatch()

  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryParam = new URLSearchParams(window.location.search)
  const urlSearchQuery = queryParam.get("query")

  const isFiltersModalOpen = useAppSelector(
    (state) => state.search.isFiltersModalOpen,
  )

  useEffect(() => {
    if (urlSearchQuery && searchInputRef.current) {
      searchInputRef.current.value = urlSearchQuery
      dispatch(setSearchQuery(urlSearchQuery))
    }
  }, [urlSearchQuery, searchInputRef, dispatch])

  const toggleFiltersModal = () => {
    dispatch(setIsFiltersModalOpen(!isFiltersModalOpen))
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const searchValue = searchInputRef.current?.value

    dispatch(setFilters(null))
    dispatch(setIsFiltersModalOpen(false))

    if (!searchValue) {
      dispatch(setSearchQuery("*"))

      return
    }

    queryParam.set("query", searchValue)
    dispatch(setSearchQuery(searchValue))
  }

  return (
    <Wrapper>
      <Header />
      <main>
        <div className="form-container">
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Enter search value"
              ref={searchInputRef}
            />
            <button type="submit">{"Search"}</button>
            <button type="button" onClick={toggleFiltersModal}>
              <FiltersIcon />
            </button>
          </form>
          {isFiltersModalOpen && <FiltersModal />}
        </div>

        <div className="table-container">
          <TableView />
        </div>
      </main>
    </Wrapper>
  )
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 80%;
    height: 100%;
    margin-top: 30px;
    .form-container {
      position: relative;
      width: 100%;
    }
    form {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 9px;
      position: relative;
      input {
        width: 80%;
        border: 1px solid var(--light-grey);
        border-radius: 8px;
        padding: 11px 16px;
        font-size: 14px;
        line-height: 19px;
        color: var(--dark);
        height: 40px;
      }

      input::placeholder {
        color: var(--dark-grey-2);
      }

      button {
        border-radius: 8px;
        background-color: var(--light-blue);
        border: none;
        padding: 11px 66px;
        height: 40px;
        color: var(--active-blue);
        font-weight: 600;
        line-height: 18px;
        text-align: center;
        vertical-align: middle;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        height: 100%;
      }

      button[type="button"] {
        height: 100%;
        line-height: 0.5;
        padding: 11px 9px;
      }
      button:hover {
        background-color: var(--light-blue);
      }
    }
    .no-data-text {
      position: absolute;
      top: 50%;
    }
    .table-container {
      margin-top: 30px;
      .organism-name {
        background-color: var(--light-blue);
        color: var(--dark);
        border-radius: 12px;
        padding: 2px 12px;
      }
    }
  }
`

export default SearchPage

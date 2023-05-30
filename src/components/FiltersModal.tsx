import { useEffect, useState } from "react"
import styled from "styled-components"

import { useAppDispatch, useAppSelector } from "../app/hooks"
import {
  setFilters,
  setIsFiltersModalOpen,
} from "../features/search/searchSlice"

const FiltersModal = () => {
  const searchQuery = useAppSelector((state) => state.search.searchQuery)
  const appliedFilters = useAppSelector((state) => state.search.selectedFilters)
  const [dynamicFilters, setDynamicFilters] = useState<any>([])
  const [selectedFilters, setSelectedFilters] = useState<any>([])

  const [lengthFilter, setLengthFilter] = useState<any>({
    min: null,
    max: null,
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [noFilters, setNoFilters] = useState<boolean>(false)

  const [url, setUrl] = useState<any>(
    `https://rest.uniprot.org/uniprotkb/search?facets=model_organism,proteins_with,annotation_score&query=(${
      searchQuery || "*"
    })${
      appliedFilters
        ? (appliedFilters as any)
            ?.map((filter: any) => {
              return `%20AND%20(${filter.name}:${filter.value})`
            })
            .join("")
        : ""
    }`,
  )

  const dispatch = useAppDispatch()

  useEffect(() => {
    {
      appliedFilters && setSelectedFilters(appliedFilters)
    }

    const filters = (appliedFilters as any)
      ?.map((filter: any) => {
        return `%20AND%20(${filter.name}:${filter.value})`
      })
      .join("")

    setUrl(
      `https://rest.uniprot.org/uniprotkb/search?facets=model_organism,proteins_with,annotation_score&query=(${
        searchQuery || "*"
      })${appliedFilters && filters}`,
    )
  }, [searchQuery, appliedFilters])

  const getDynamicFilters = async () => {
    try {
      setIsLoading(true)

      const filters = (selectedFilters as any)
        ?.map((filter: any) => {
          if (filter.name === "length") {
            return `%20AND%20(${filter.name}:%5B${filter.value}%20TO%20${filter.value}%5D)`
          }

          return `%20AND%20(${filter.name}:${filter.value})`
        })
        .join("")

      const response = await fetch(`${url}${appliedFilters ? filters : ""}`)

      console.log(url)

      const minLengthResponse = await fetch(
        `${url}${appliedFilters ? filters : ""}&size=1&sort=length%20asc`,
      )

      const maxLengthResponse = await fetch(
        `${url}${appliedFilters ? filters : ""}&size=1&sort=length%20desc`,
      )

      const minLengthData = await minLengthResponse.json()
      const maxLengthData = await maxLengthResponse.json()
      const minLength = minLengthData.results[0].sequence.length
      const maxLength = maxLengthData.results[0].sequence.length

      setLengthFilter({ min: minLength, max: maxLength })
      const data = await response.json()

      const dynamicFilters = data.facets.map((facet: any) => {
        return {
          label: facet.label,
          name: facet.name,
          values: facet.values.map((value: any) => {
            return {
              label: value.label,
              value: value.value,
              count: value.count,
            }
          }),
        }
      })

      setIsLoading(false)

      return dynamicFilters
    } catch {
      setNoFilters(true)
      setIsLoading(false)

      return null
    }
  }

  const handleFilterChange = (event: any) => {
    const { name, value } = event.target

    console.log(name, value)

    if (name === "minLength" || name === "maxLength") {
      const filter = { name: "length", value: `${value}:${value}` }

      setSelectedFilters((prevState: any) => {
        const filterExists = prevState.some(
          (item: any) => item.name === filter.name,
        )

        return filterExists
          ? prevState.filter(
              (item: any) =>
                item.name !== filter.name || item.value !== filter.value,
            )
          : [...prevState, filter]
      })

      return
    }

    const filter = { name, value }

    setSelectedFilters((prevState: any) => {
      const filterExists = prevState.some(
        (item: any) => item.name === filter.name,
      )

      return filterExists
        ? prevState.filter(
            (item: any) =>
              item.name !== filter.name || item.value !== filter.value,
          )
        : [...prevState, filter]
    })
  }

  const handleSubmit = (event: any) => {
    event.preventDefault()
    dispatch(setFilters(selectedFilters))
    dispatch(setIsFiltersModalOpen(false))
  }

  useEffect(() => {
    getDynamicFilters().then((data) => {
      if (data) {
        setDynamicFilters(data)

        const selectElement = document.getElementById(
          data[0].name,
        ) as HTMLSelectElement

        if (selectElement && selectElement.options.length > 0) {
          selectElement.value = selectElement.options[0].value
        }
      } else {
        setNoFilters(true)
      }
    })
  }, [searchQuery])

  return (
    <Wrapper>
      <h1>{"Filters"}</h1>

      {isLoading ? (
        <p className="filters-loading">{"Loading available filters..."}</p>
      ) : (noFilters ? (
        <p className="filters-loading">{"No filters available"}</p>
      ) : (
        <form className="filters-form" onSubmit={(e) => handleSubmit(e)}>
          <label htmlFor="gene">{"Gene Name"}</label>
          <input
            type="text"
            name="gene"
            id="gene"
            placeholder="Enter gene name"
            onChange={(e) => handleFilterChange(e)}
          />
          {dynamicFilters.map((filter: any) => {
            return (
              <div className="filter-container" key={filter.name}>
                <label htmlFor={filter.name}>{filter.label}</label>
                <select
                  name={filter.name}
                  defaultValue={filter.values[0].value}
                  id={filter.name}
                  onChange={(e) => handleFilterChange(e)}
                >
                  {filter.values.map((value: any) => {
                    return (
                      <option
                        value={value.value}
                        key={`${value?.label}${value.value}${value?.count}`}
                      >
                        {value.label ? value.label : value.value}
                        {" ("}
                        {")"}
                      </option>
                    )
                  })}
                </select>
              </div>
            )
          })}

          <div className="length-filter-container">
            <label htmlFor="length">{"Sequence length"}</label>
            <div className="length-input">
              <input
                type="number"
                id="length"
                name="minLength"
                min={lengthFilter.min && lengthFilter.min}
                max={lengthFilter.max && lengthFilter.max}
                defaultValue={lengthFilter.min && lengthFilter.min}
                onChange={(e) => handleFilterChange(e)}
              />
              <hr />
              <input
                type="number"
                name="maxLength"
                id="length"
                min={lengthFilter.min && lengthFilter.min}
                max={lengthFilter.max && lengthFilter.max}
                defaultValue={lengthFilter.max && lengthFilter.max}
                onChange={(e) => handleFilterChange(e)}
              />
            </div>
          </div>
          <div className="filters-btn-container">
            <button
              type="button"
              onClick={() => dispatch(setIsFiltersModalOpen(false))}
            >
              {"Cancel"}
            </button>
            <button type="submit">{"Apply filters"}</button>
          </div>
        </form>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: absolute;
  top: 100%;
  left: calc(100% - 335px);
  margin-top: 2px;
  width: 335px;
  background-color: var(--white);
  display: flex;
  z-index: 1;
  flex-direction: column;
  box-shadow: 1px 2px 20px 1px #d2d2d28b;
  border-radius: 12px;
  align-items: flex-start;
  padding: 19px 14px 14px 14px;
  .filters-loading {
    font-size: 14px;
    color: var(--dark-grey);
    align-self: center;
  }

  h1 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 29px;
  }
  form.filters-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    input[type="text"]::placeholder {
      color: var(--dark-grey);
    }

    .filter-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 20px;
      width: 100%;
      label {
        margin-bottom: 7px;
      }
    }

    .length-filter-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 50px;
      label {
        margin-bottom: 7px;
      }
      .length-input {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        input {
          width: 40%;
        }
        hr {
          width: 15%;
          height: 2px;
          background-color: var(--dark-grey-2);
        }
      }
    }

    input {
      background-color: var(--grey);
      width: 100%;
    }
    select {
      -moz-appearance: none;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      width: 100%;
      padding: 21px 11px;
      background-color: var(--grey);
      border-radius: 8px;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='7' height='14' viewBox='0 0 7 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.47788 0.806335C3.66235 0.806382 3.83926 0.892078 3.96968 1.04458L6.7521 4.297C6.87881 4.45035 6.94893 4.65575 6.94734 4.86894C6.94576 5.08213 6.8726 5.28607 6.74363 5.43683C6.61466 5.58758 6.44019 5.6731 6.25781 5.67495C6.07542 5.6768 5.89971 5.59485 5.76852 5.44673L3.47788 2.76917L1.18725 5.44673C1.05606 5.59485 0.880347 5.6768 0.697961 5.67495C0.515576 5.6731 0.341109 5.58758 0.212138 5.43683C0.0831665 5.28607 0.0100102 5.08213 0.00842528 4.86894C0.0068404 4.65575 0.0769539 4.45035 0.203664 4.297L2.98609 1.04458C3.11651 0.892078 3.29341 0.806382 3.47788 0.806335ZM0.203664 9.17564C0.33411 9.0232 0.511008 8.93757 0.695458 8.93757C0.879908 8.93757 1.05681 9.0232 1.18725 9.17564L3.47788 11.8532L5.76852 9.17564C5.89971 9.02752 6.07542 8.94557 6.25781 8.94742C6.44019 8.94927 6.61466 9.03478 6.74363 9.18554C6.8726 9.3363 6.94576 9.54023 6.94734 9.75343C6.94893 9.96662 6.87881 10.172 6.7521 10.3254L3.96968 13.5778C3.83923 13.7302 3.66233 13.8159 3.47788 13.8159C3.29343 13.8159 3.11654 13.7302 2.98609 13.5778L0.203664 10.3254C0.0732582 10.1729 0 9.96611 0 9.7505C0 9.5349 0.0732582 9.32812 0.203664 9.17564Z' fill='%23BFBFBF'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position-x: calc(100% - 19px);
      background-position-y: 50%;
      border: none;
      font-family: "Open Sans", sans-serif;
    }

    .filters-btn-container {
      display: flex;
      align-self: center;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      width: 100%;
      button[type="button"] {
        background-color: var(--white);
        color: var(--blue);
        padding: 10px 29px;
      }

      button[type="submit"] {
        padding: 10px 29px;
      }
    }
  }
`

export default FiltersModal

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import styled from "styled-components"

import { useAppDispatch, useAppSelector } from "../app/hooks"
import SortIconAsc from "../assets/SortIconAsc"
import SortIconDesc from "../assets/SortIconDesc"
import SortIconInactive from "../assets/SortIconInactive"
import { setFilters } from "../features/search/searchSlice"

const fetchSize = 25

const queryClient = new QueryClient()

const columns = [
  {
    accessorKey: "number",
    header: "#",
    size: 60,
    cell: (info: any) => info.row.index + 1,
  },
  {
    accessorKey: "accession",
    header: "Entry",
    cell: (info: any) => {
      const value = info.getValue() as string

      return (
        <Link to={`/protein/${value}`} className="entry-link" target="_blank">
          {value}
        </Link>
      )
    },
  },
  {
    accessorKey: "id",
    header: "Entry Name",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "gene",
    header: "Genes",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "organism_name",
    header: "Organism",
    cell: (info: any) => {
      return (
        <span className="organism-name">
          {info.getValue() as React.ReactNode}
        </span>
      )
    },
  },
  {
    accessorKey: "subcellularLocation",
    header: "Subcellular Location",
    cell: (info: any) => {
      const value = info.getValue() as string

      if (value.length > 30) {
        const words = value.split(" ")
        const truncatedValue = words.slice(0, 2).join(" ")

        return (
          <span className="subcellular-location">
            {truncatedValue}
            {"..."}
          </span>
        )
      }

      return value
    },
  },
  {
    accessorKey: "length",
    header: "Length",
    cell: (info: any) => {
      return info.getValue()
    },
  },
]

const Table = () => {
  const searchQuery = useAppSelector((state) => state.search.searchQuery)

  const selectedFilters = useAppSelector(
    (state) => state.search.selectedFilters,
  )

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [cursor, setCursor] = useState<string | undefined>("")
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [hasElements, setHasElements] = useState(false)
  const [totalResults, setTotalResults] = useState("0")
  const [sort, setSort] = useState({ id: "", type: "" })

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const sortValue = queryParams.get("sort") ?? ""

    if (sortValue && sort.id === "") {
      const decoded = decodeURIComponent(sortValue)
      const [id, type] = decoded.split(" ")

      setSort({ id, type })
    }
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const sortValue = queryParams.get("sort") ?? sort.id

    if (sortValue && sort.id !== "") {
      queryParams.set("sort", `${sort.id} ${sort.type}`)
    } else {
      queryParams.delete("sort")
    }

    updateQueryParam(queryParams)
  }, [sort])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const urlFilters = queryParams.get("filters") ?? ""

    if (urlFilters && selectedFilters === null) {
      const decoded = decodeURIComponent(urlFilters)
      const filters = JSON.parse(decoded)

      dispatch(setFilters(filters))
    }
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)

    if (selectedFilters === null) {
      queryParams.delete("filters")
    } else {
      const encoded = encodeURIComponent(JSON.stringify(selectedFilters))

      queryParams.set("filters", encoded)
    }

    updateQueryParam(queryParams)
  }, [selectedFilters])

  const handleSort = (id: string) => {
    setCursor("")

    if (sort.id !== id) {
      setSort({ id, type: "asc" })
    } else if (sort.id === id && sort.type === "desc") {
      setSort({ id: "", type: "" })
    } else if (sort.id === id && sort.type === "asc") {
      setSort({ id, type: "desc" })
    }

    return
  }

  useEffect(() => {
    setCursor("")
  }, [searchQuery, selectedFilters])

  const updateQueryParam = useCallback(
    (params: URLSearchParams) => {
      const search = params.toString()

      navigate({ search })
    },
    [navigate],
  )

  const fetchData = useCallback(
    async ({ pageParam = "" }) => {
      const query = globalFilter || "*"
      const queryParams = new URLSearchParams(window.location.search)

      if (query === "*") {
        queryParams.delete("query")
      } else {
        queryParams.set("query", query)
      }

      if (selectedFilters === null) {
        queryParams.delete("filters")
      } else {
        const encoded = encodeURIComponent(JSON.stringify(selectedFilters))

        queryParams.set("filters", encoded)
      }

      const filters = (selectedFilters as any)
        ?.map((filter: any) => {
          if (filter.name === "length") {
            if (filter.name === "length") {
              const { minLength, maxLength } = filter

              return `%20AND%20(${filter.name}:%5B${minLength}%20TO%20${maxLength}%5D)`
            }

            return `%20AND%20(${filter.name}:%5B${filter.value}%20TO%20${filter.value}%5D)`
          }

          return `%20AND%20(${filter.name}:${filter.value})`
        })
        .join("")

      const url = `https://rest.uniprot.org/uniprotkb/search?format=json&fields=accession,id,gene_names,organism_name,length,cc_subcellular_location&query=(${
        searchQuery || "*"
      })${selectedFilters ? filters : ""}${
        pageParam ? `&cursor=${pageParam}` : ""
      }&size=${fetchSize}${sort.id ? `&sort=${sort.id}%20${sort.type}` : ""}`

      const response = await fetch(url)
      const link = response.headers.get("Link")

      const total = response.headers
        .get("X-Total-Results")
        ?.replace(/\B(?=(\d{3})+(?!\d))/g, " ")

      if (total) {
        setTotalResults(total)
      }

      const nextCursor = link?.match(/cursor=(.*?)size/)?.[1] ?? ""

      const trimmedCursor = nextCursor.endsWith("&")
        ? nextCursor.slice(0, -1)
        : nextCursor

      setCursor(trimmedCursor)

      const json = await response.json()

      if (json.results.length === 0) {
        setHasElements(false)

        return {
          results: [],
          totalResults: 0,
        }
      }

      const results = json.results?.map((result: any) => {
        const genes = result.genes
          ?.map((gene: any) => {
            return gene.geneName ? gene.geneName.value : "N/A"
          })
          .join(", ")

        const subcellularLocations = result.comments
          ?.filter(
            (comment: any) => comment?.commentType === "SUBCELLULAR LOCATION",
          )
          .flatMap((comment: any) => {
            const sublocations = comment.subcellularLocations

            return sublocations
              ? sublocations.map((location: any) => {
                  return location?.location ? location.location.value : "N/A"
                })
              : []
          })
          .join(", ")

        return {
          accession: result.primaryAccession,
          id: result.uniProtkbId,
          gene: genes || "N/A",
          organism_name: result.organism.scientificName,
          subcellularLocation: subcellularLocations || "N/A",
          length: result.sequence.length,
        }
      })

      updateQueryParam(queryParams)

      if (results && results.length > 0) {
        setHasElements(true)
      }

      return {
        results,
        totalResults: total,
        nextCursor: trimmedCursor,
      }
    },
    [
      globalFilter,
      cursor,
      updateQueryParam,
      searchQuery,
      sort.id,
      sort.type,
      selectedFilters,
    ],
  )

  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery({
    queryKey: ["table-data", globalFilter, sorting, sort, selectedFilters],
    queryFn: fetchData,
    getNextPageParam: (lastPage) => {
      if (lastPage.results.length < fetchSize) {
        return
      }

      return lastPage.nextCursor
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  })

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  )

  const totalFetched = flatData.length

  useEffect(() => {
    if (searchQuery) {
      setGlobalFilter(searchQuery)
    }
  }, [searchQuery])

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement

        if (scrollHeight - scrollTop - clientHeight < 400 && !isFetching) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched],
  )

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current)
  }, [
    fetchMoreOnBottomReached,
    searchQuery,
    sort.id,
    sort.type,
    selectedFilters,
  ])

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  })

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 34,
    overscan: 20,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0

  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0

  if (isLoading) {
    return <React.Fragment>{"Loading..."}</React.Fragment>
  }

  return (
    <Wrapper>
      {hasElements ? (
        <div
          className="container"
          onScroll={(e) =>
            fetchMoreOnBottomReached(e.currentTarget as HTMLDivElement)
          }
          ref={tableContainerRef}
          style={{ height: "80vh", overflowY: "scroll" }}
        >
          <h3>
            {totalResults}
            {" Search Results "}
            {searchQuery && searchQuery !== "*" && `for "${searchQuery}" `}
          </h3>
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              onClick:
                                header.column.id !== "subcellularLocation" &&
                                header.column.id !== "number"
                                  ? () => handleSort(header.column.id)
                                  : undefined,
                              className:
                                header.column.id !== "subcellularLocation" &&
                                header.column.id !== "number"
                                  ? "cursor-pointer sorted-container"
                                  : undefined,
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.id !== "subcellularLocation" &&
                              header.column.id !== "number" &&
                              (sort.id === header.column.id ? (
                                sort.type === "desc" ? (
                                  <SortIconDesc />
                                ) : (
                                  <SortIconAsc />
                                )
                              ) : (
                                <SortIconInactive />
                              ))}
                          </div>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              )}
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<any>

                if (row) {
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                }
              })}
              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data-text">
          {"No data to display "}
          <br />
          {" Please start search to display results"}{" "}
        </p>
      )}
    </Wrapper>
  )
}

const TableView = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Table />
    </QueryClientProvider>
  )
}

const Wrapper = styled.div`
  min-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  table {
    border-collapse: collapse;
    min-width: 100%;
    text-align: left;
  }
  th {
    position: sticky;
    top: 0;
    background-color: var(--grey);
    padding: 12px;
    font-weight: 600;
    border-left: 1px solid var(--white);
  }
  td {
    padding: 12px 15px;
    white-space: nowrap;
    overflow: hidden;
    word-wrap: normal;
  }

  th:first-of-type {
    border-radius: 8px 0 0 8px;
  }

  th:last-of-type {
    border-radius: 0 8px 8px 0;
  }

  th {
    width: fit-content;
  }

  .entry-link {
    color: var(--blue);
    font-weight: 600;
  }

  .container {
    height: 100%;
    width: 100%;
    overflow: scroll;
  }

  .container::-webkit-scrollbar {
    display: none;
  }
  h3 {
    text-align: left;
    margin-bottom: 20px;
    font-weight: 600;
  }
  .cursor-pointer {
    cursor: pointer;
  }

  .sorted-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`

export default TableView

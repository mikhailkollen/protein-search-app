import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "@tanstack/react-query"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import styled from "styled-components"

import { useAppSelector } from "../app/hooks"

const fetchSize = 25

const queryClient = new QueryClient()

const Table = () => {
  const searchQuery = useAppSelector((state) => state.search.searchQuery)
  // const rerender = React.useReducer(() => ({}), {})[1]
  const navigate = useNavigate()
  // const dispatch = useAppDispatch()

  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [cursor, setCursor] = useState<string | undefined>("")
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [query, setQuery] = useState<string>(searchQuery || "*")
  const [hasElements, setHasElements] = useState(false)
  const [totalResults, setTotalResults] = useState("0")
  

  useEffect(() => {
    setQuery(searchQuery || "*")
    setCursor("")
  }, [searchQuery])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    // const queryValue = queryParams.get("query") ?? query

    setCursor("")

    if (query === "*") {
      queryParams.delete("query")
    } else {
      queryParams.set("query", query)
    }

    updateQueryParam(queryParams)
  }, [query])

  const updateQueryParam = useCallback(
    (params: URLSearchParams) => {
      const search = params.toString()

      navigate({ search })
    },
    [navigate],
  )

  const fetchData = useCallback(async () => {
    const query = globalFilter || "*"

    setCursor("")
    const queryParams = new URLSearchParams(window.location.search)

    if (query === "*") {
      queryParams.delete("query")
    } else {
      queryParams.set("query", query)
    }

    const url = `https://rest.uniprot.org/uniprotkb/search?query=${
      searchQuery || "*"
    }&format=json&fields=accession,id,gene_names,organism_name,length,cc_subcellular_location&cursor=${
      cursor && cursor
    }&size=${fetchSize}`

    const response = await fetch(url)
    const link = response.headers.get("Link")

    const total = response.headers
      .get("X-Total-Results")
      ?.replace(/\B(?=(\d{3})+(?!\d))/g, " ")

    if (total) {
      setTotalResults(total)
    }

    const nextCursor = link?.match(/cursor=(.*?)size/)?.[1] ?? ""

    setCursor(nextCursor)

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
        entry: result.primaryAccession,
        entryName: result.uniProtkbId,
        genes: genes || "N/A",
        organism: result.organism.scientificName,
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
      totalResults: json.totalResults,
    }
  }, [globalFilter, cursor, updateQueryParam, searchQuery])

  const { data, fetchNextPage, isFetching, isLoading } =
    useInfiniteQuery({
      queryKey: ["table-data", globalFilter, sorting],
      queryFn: fetchData,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.results.length < fetchSize) {
          return
        }

        return pages.length
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
  }, [fetchMoreOnBottomReached, searchQuery])

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "number",
        header: "#",
        size: 60,
        cell: (info) => info.row.index + 1,
      },
      {
        accessorKey: "entry",
        header: "Entry",
        cell: (info) => {
          const value = info.getValue() as string

          return (
            <Link
              to={`/protein/${value}`}
              className="entry-link"
              target="_blank"
            >
              {value}
            </Link>
          )
        },
      },
      {
        accessorKey: "entryName",
        header: "Entry Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "genes",
        header: "Genes",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "organism",
        header: "Organism",
        cell: (info) => {
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
        cell: (info) => {
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
        cell: (info) => {
          return info.getValue()
        },
      },
    ],
    [],
  )

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
            {' Search Results '}
            {(searchQuery && searchQuery !== "*") && (
              `for "${searchQuery}" `)
            }
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
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<any>

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
              })}
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

const TableWithReactQuery = () => {
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

  .entry-link {
    color: var(--blue);
    font-weight: 600;
  }

  .container {
    height: 100%;
    overflow-y: hidden;
  }

  .container::-webkit-scrollbar {
    display: none;
  }
  h3 {
    text-align: left;
    margin-bottom: 20px;
    font-weight: 600;
  }

  /* .no-data-text {
    position: absolute;
    width: 300px;
    top: 50%;
    left: calc(50% - 150px);
   } */
`

export default TableWithReactQuery

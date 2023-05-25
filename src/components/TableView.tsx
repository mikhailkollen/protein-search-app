import {
  UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Link, useNavigate } from "react-router-dom"
import { Typography } from "@mui/material"
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "@tanstack/react-query"
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_SortingState,
  MRT_Virtualizer,
} from "material-react-table"

interface SearchResult {
  entry: string
  entryName: string
  genes: string
  organism: string
  subcellularLocation: string
  length: number
}

interface SearchApiResponse {
  results: SearchResult[]
  totalResults: number
}

const fetchSize = 25

const TableView = () => {
  const navigate = useNavigate()

  const columns: MRT_ColumnDef<SearchResult>[] = [
    {
      accessorKey: "entry",
      header: "Entry",
      accessorFn: (row) => (
        <Typography
          variant="body2"
          color="primary"
          component={Link}
          to={`/protein/${row.entry}`}
          // target='_blank'
        >
          {row.entry}
        </Typography>
      ),
    },
    {
      accessorKey: "entryName",
      header: "Entry Name",
    },
    {
      accessorKey: "genes",
      header: "Genes",
    },
    {
      accessorKey: "organism",
      header: "Organism",
      accessorFn: (row) => (
        <Typography
          variant="body2"
          sx={{
            style: {
              color: "var(--dark)",
              backgroundColor: "var(--light-blue)",
              borderRadius: "12px",
              padding: "2px 12px",
            },
          }}
          component="span"
          className="organism-name"
        >
          {row.organism}
        </Typography>
      ),
    },
    {
      accessorKey: "subcellularLocation",
      header: "Subcellular Location",
    },
    {
      accessorKey: "length",
      header: "Length",
    },
  ]

  const tableContainerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizerInstanceRef =
    useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null)

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [cursor, setCursor] = useState<string>("")

  const updateQueryParam = (params: URLSearchParams) => {
    const search = params.toString()

    navigate({ search })
  }

  const { data, fetchNextPage, isError, isFetching, isLoading } =
    useInfiniteQuery<SearchApiResponse>({
      queryKey: ["table-data", columnFilters, globalFilter, sorting],
      queryFn: async () => {
        const query = globalFilter || "*"

        setCursor("")
        const queryParams = new URLSearchParams(window.location.search)

        if (query === "*") {
          queryParams.delete("query")
        } else {
          queryParams.set("query", query)
        }

        const url = `https://rest.uniprot.org/uniprotkb/search?query=${query}&format=json&fields=accession,id,gene_names,organism_name,length,cc_subcellular_location&cursor=${
          cursor && cursor
        }&size=${fetchSize}`

        const response = await fetch(url)
        const link = response.headers.get("Link")
        const nextCursor = link?.match(/cursor=(.*?)size/)?.[1] ?? ""

        setCursor(nextCursor)

        const json = await response.json()

        if (json.results === 0) {
          return {
            results: [],
            totalResults: 0,
          }
        }

        const results: SearchResult[] = json.results?.map((result: any) => {
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

        return {
          results,
          totalResults: json.totalResults,
        }
      },
      getNextPageParam: (lastPage, pages) => {
        console.log()

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
    try {
      if (flatData.length > 0) {
        rowVirtualizerInstanceRef.current?.scrollToIndex?.(0)
      }
    } catch (error) {
      console.error(error)
    }
  }, [sorting, columnFilters, globalFilter, flatData])

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current)
  }, [fetchMoreOnBottomReached])

  return (
    <MaterialReactTable
      columns={columns}
      data={flatData}
      enablePagination={false}
      enableRowNumbers
      enableRowVirtualization
      manualFiltering
      manualSorting
      muiTableContainerProps={{
        ref: tableContainerRef,
        sx: { maxHeight: "600px", overflowY: "auto" },
        onScroll: (event: UIEvent<HTMLDivElement>) =>
          fetchMoreOnBottomReached(event.target as HTMLDivElement),
      }}
      muiToolbarAlertBannerProps={
        isError
          ? {
              color: "error",
              children: "Error loading data",
            }
          : undefined
      }
      onColumnFiltersChange={setColumnFilters}
      onGlobalFilterChange={setGlobalFilter}
      onSortingChange={setSorting}
      renderBottomToolbarCustomActions={() => (
        <Typography>
          {totalFetched}
          {" total rows"}
        </Typography>
      )}
      state={{
        columnFilters,
        globalFilter,
        isLoading,
        showAlertBanner: isError,
        showProgressBars: isFetching,
        sorting,
      }}
      rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
      rowVirtualizerProps={{ overscan: 4 }}
    />
  )
}

const queryClient = new QueryClient()

const TableViewWithReactQueryProvider = () => (
  <QueryClientProvider client={queryClient}>
    <TableView />
  </QueryClientProvider>
)

export default TableViewWithReactQueryProvider

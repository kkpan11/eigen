import { FilterParamName, FilterType } from "lib/Scenes/Collection/Helpers/FilterArtworksHelpers"
import { filter, find, pullAllBy, union, unionBy } from "lodash"
import React, { createContext, Dispatch, Reducer, useContext, useReducer } from "react"

const filterState: ArtworkFilterContextState = {
  appliedFilters: [],
  selectedFilters: [],
  previouslyAppliedFilters: [],
  applyFilters: false,
}

export const reducer = (
  artworkFilterState: ArtworkFilterContextState,
  action: FilterActions
): ArtworkFilterContextState => {
  switch (action.type) {
    case "applyFilters":
      let multiOptionFilters = unionBy(
        artworkFilterState.selectedFilters,
        artworkFilterState.previouslyAppliedFilters,
        "filterType"
      )

      multiOptionFilters = multiOptionFilters.filter(f => f.paramValue === true)

      // get all filter options excluding ways to buy filter types and replace previously applied options with currently selected options
      const singleOptionFilters = unionBy(
        pullAllBy(
          [...artworkFilterState.selectedFilters, ...artworkFilterState.previouslyAppliedFilters],
          multiOptionFilters,
          "paramValue"
        ),
        "filterType"
      )

      const filtersToApply = union([...singleOptionFilters, ...multiOptionFilters])

      // Remove default values as those are accounted for when we make the API request.
      const appliedFilters = filter(filtersToApply, ({ filterType, paramValue }) => {
        return defaultFilterOptions[filterType] !== paramValue
      })

      return {
        applyFilters: true,
        appliedFilters,
        selectedFilters: [],
        previouslyAppliedFilters: appliedFilters,
      }

    // First we update our potential "selectedFilters" based on the option that was selected in the UI
    case "selectFilters":
      const filtersToSelect = unionBy([action.payload], artworkFilterState.selectedFilters, "filterType")

      // Then we have to remove any "invalid" choices.
      const selectedFilters = filter(filtersToSelect, ({ filterType, paramValue }) => {
        const appliedFilter = find(artworkFilterState.appliedFilters, option => option.filterType === filterType)

        // Don't re-select options that have already been applied.
        // In the case where the option hasn't been applied, remove the option if it is the default.
        if (!appliedFilter) {
          return defaultFilterOptions[filterType] !== paramValue
        }

        if (appliedFilter.paramValue === paramValue) {
          return false
        }

        return true
      })

      return {
        applyFilters: false,
        selectedFilters,
        appliedFilters: artworkFilterState.appliedFilters,
        previouslyAppliedFilters: artworkFilterState.previouslyAppliedFilters,
      }

    case "clearAll":
      return {
        appliedFilters: artworkFilterState.appliedFilters,
        selectedFilters: [],
        previouslyAppliedFilters: [],
        applyFilters: false,
      }

    case "resetFilters":
      // We call this when we need to re-set to our initial state. Since previouslyAppliedFilters
      // is only used while in the filter modal, when we close out we need to re-set that back
      // to equal appliedFilters.
      return {
        applyFilters: false,
        appliedFilters: artworkFilterState.appliedFilters,
        selectedFilters: [],
        previouslyAppliedFilters: artworkFilterState.appliedFilters,
      }

    case "clearFiltersZeroState":
      // We call this when a user has filtered artworks and the result returns 0 artworks.
      return {
        appliedFilters: [],
        selectedFilters: [],
        previouslyAppliedFilters: [],
        applyFilters: true,
      }
  }
}

const defaultFilterOptions: Record<FilterType, string | boolean | null> = {
  sort: "-decayed_merch",
  medium: "*",
  priceRange: "*-*",
  size: "*-*",
  color: null,
  gallery: null,
  institution: null,
  majorPeriods: null,
  inquireableOnly: false,
  offerable: false,
  atAuction: false,
  acquireable: false,
}

export const useSelectedOptionsDisplay = (): FilterArray => {
  const { state } = useContext(ArtworkFilterContext)

  const defaultFilters: FilterArray = [
    {
      filterType: FilterType.sort,
      paramName: FilterParamName.sort,
      paramValue: "-decayed_merch",
      displayText: "Default",
    },
    { filterType: FilterType.medium, paramName: FilterParamName.medium, paramValue: "*", displayText: "All" },
    { filterType: FilterType.priceRange, paramName: FilterParamName.priceRange, paramValue: "*-*", displayText: "All" },
    { filterType: FilterType.size, paramName: FilterParamName.size, paramValue: "*-*", displayText: "All" },
    { filterType: FilterType.gallery, paramName: FilterParamName.gallery, displayText: "All" },
    {
      filterType: FilterType.institution,
      paramName: FilterParamName.institution,
      displayText: "All",
    },
    { filterType: FilterType.color, paramName: FilterParamName.color, displayText: "All" },
    { filterType: FilterType.timePeriod, paramName: FilterParamName.timePeriod, paramValue: "*-*", displayText: "All" },
    {
      filterType: FilterType.waysToBuyBuy,
      paramName: FilterParamName.waysToBuyBuy,
      paramValue: false,
      displayText: "Buy now",
    },
    {
      filterType: FilterType.waysToBuyInquire,
      paramName: FilterParamName.waysToBuyInquire,
      paramValue: false,
      displayText: "Inquire",
    },
    {
      filterType: FilterType.waysToBuyMakeOffer,
      paramName: FilterParamName.waysToBuyMakeOffer,
      paramValue: false,
      displayText: "Make offer",
    },
    {
      filterType: FilterType.waysToBuyBid,
      paramName: FilterParamName.waysToBuyBid,
      paramValue: false,
      displayText: "Bid",
    },
  ]

  return unionBy(state.selectedFilters, state.previouslyAppliedFilters, defaultFilters, "filterType")
}

export const ArtworkFilterContext = createContext<ArtworkFilterContextProps>(null as any /* STRICTNESS_MIGRATION */)

export const ArtworkFilterGlobalStateProvider: React.FC<ArtworkFilterGlobalContextProps> = ({
  children,
  aggregations,
}) => {
  const [state, dispatch] = useReducer<Reducer<ArtworkFilterContextState, FilterActions>>(reducer, filterState)
  return (
    <ArtworkFilterContext.Provider value={{ aggregations, state, dispatch }}>{children}</ArtworkFilterContext.Provider>
  )
}

export interface ArtworkFilterContextState {
  readonly appliedFilters: FilterArray
  readonly selectedFilters: FilterArray
  readonly previouslyAppliedFilters: FilterArray
  readonly applyFilters: boolean
}

export interface FilterData {
  readonly filterType: FilterType
  readonly displayText: string
  readonly paramName: FilterParamName
  paramValue?: string | boolean
}

export type FilterArray = ReadonlyArray<FilterData>

interface ResetFilters {
  type: "resetFilters"
}

interface ApplyFilters {
  type: "applyFilters"
}

interface SelectFilters {
  type: "selectFilters"
  payload: FilterData
}

interface ClearAllFilters {
  type: "clearAll"
}

interface ClearFiltersZeroState {
  type: "clearFiltersZeroState"
}

export type FilterActions = ResetFilters | ApplyFilters | SelectFilters | ClearAllFilters | ClearFiltersZeroState

interface ArtworkFilterContextProps {
  state: ArtworkFilterContextState
  dispatch: Dispatch<FilterActions>
  aggregations?: Aggregations
}

interface ArtworkFilterGlobalContextProps {
  aggregations?: Aggregations
}

/**
 * Possible aggregations that can be passed
 */
export type AggregationName =
  | "COLOR"
  | "DIMENSION_RANGE"
  | "FOLLOWED_ARTISTS"
  | "GALLERY"
  | "INSTITUTION"
  | "MAJOR_PERIOD"
  | "MEDIUM"
  | "MERCHANDISABLE_ARTISTS"
  | "PARTNER_CITY"
  | "PERIOD"
  | "PRICE_RANGE"
  | "TOTAL"

export type Aggregations = Array<{
  slice: AggregationName
  counts: Array<{
    count: number
    value: string
    name: string
  }>
}>

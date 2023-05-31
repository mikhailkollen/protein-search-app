import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"

import { auth } from "../../firebase"
import { Filter, Filters, SearchState } from "../../types"

const initialState: SearchState = {
  currentUser: null,
  searchQuery: "",
  results: [],
  error: "",
  selectedFilters: null,
  isFiltersModalOpen: false,
}

export const signIn = createAsyncThunk(
  "search/signIn",
  async ({ email, password }: any) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )

      const { user } = userCredential

      return { uid: user.uid, email: user.email }
    } catch (error) {
      throw error
    }
  },
)

export const signOut = createAsyncThunk("search/signOut", async () => {
  try {
    await auth.signOut()
    await console.log(auth.currentUser)
  } catch (error) {
    throw error
  }
})

export const signUp = createAsyncThunk(
  "search/signUp",
  async ({ email, password }: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )

      const { user } = userCredential

      return { uid: user.uid, email: user.email }
    } catch (error) {
      throw error
    }
  },
)

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = ""
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setResults: (state, action) => {
      state.results = action.payload
    },
    setFilters: (state, action) => {
      if (!action.payload) {
        state.selectedFilters = null

        return
      }

      const newFilters: Filters = action.payload.reduce(
        (accumulator: Filters, filter: Filter) => {
          const existingFilterIndex = accumulator.findIndex(
            (f) => f.name === filter.name,
          )

          if (existingFilterIndex !== -1) {
            const existingFilter = accumulator[existingFilterIndex]

            if (filter.name === "length") {
              accumulator[existingFilterIndex] = {
                ...existingFilter,
                minLength: filter.minLength,
                maxLength: filter.maxLength,
              }
            } else {
              accumulator[existingFilterIndex] = {
                ...existingFilter,
                value: filter.value,
              }
            }
          } else {
            accumulator.push(filter)
          }

          return accumulator
        },
        [],
      )

      state.selectedFilters = newFilters
    },
    setIsFiltersModalOpen: (state, action) => {
      state.isFiltersModalOpen = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.error = ""
      })
      .addCase(signIn.fulfilled, (state: SearchState, action) => {
        state.currentUser = action.payload
        console.log(action.payload)
      })
      .addCase(signIn.rejected, (state: SearchState, action) => {
        if (action.error.code === "auth/wrong-password") {
          state.error = "Wrong password"
        } else if (action.error.code === "auth/user-not-found") {
          state.error = "User not found"
        } else {
          state.error = action.error.code
        }
      })
      .addCase(signUp.pending, (state) => {
        state.error = ""
      })
      .addCase(signUp.fulfilled, (state: SearchState, action) => {
        state.currentUser = action.payload
      })
      .addCase(signUp.rejected, (state: SearchState, action) => {
        state.error =
          action.error.code === "auth/email-already-in-use"
            ? "Email already in use"
            : action.error.code
      })
      .addCase(signOut.pending, (state) => {
        state.error = ""
      })
      .addCase(signOut.fulfilled, (state: SearchState) => {
        state.currentUser = null
      })
      .addCase(signOut.rejected, (state: SearchState, action) => {
        state.error = action.error.message
        console.log(action.error.message)
      })
  },
})

export const {
  setCurrentUser,
  setError,
  clearError,
  setSearchQuery,
  setResults,
  setFilters,
  setIsFiltersModalOpen,
} = searchSlice.actions

export const selectCurrentUser = (state: any) => state.search.currentUser

export default searchSlice.reducer

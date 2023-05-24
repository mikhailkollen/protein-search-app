import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"; 
import { auth } from "../../firebase";

export interface SearchState {
  currentUser: any;
  error: any;
}

const initialState = {
  currentUser: null,
  error: "",
};

export const signIn = createAsyncThunk(
  "search/signIn",
  async ({ email, password }: any) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      return {uid: user.uid, email: user.email};
    } catch (err) {
      throw err;
    }
  }
);

export const signOut = createAsyncThunk("search/signOut", async () => {
  try {
    await auth.signOut();
    await console.log(auth.currentUser);
  } catch (err) {
    throw err;
  }
});

export const signUp = createAsyncThunk(
  "search/signUp",
  async ({ email, password }: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      return {uid: user.uid, email: user.email};

    } catch (err) {
      throw err;
    }
  }
);

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.error = "";
      })
      .addCase(signIn.fulfilled, (state: SearchState, action) => {
        state.currentUser = action.payload;
        console.log(action.payload);
      })
      .addCase(signIn.rejected, (state: SearchState, action) => {
        if (action.error.code === "auth/wrong-password") {
          state.error = "Wrong password";
        } else if (action.error.code === "auth/user-not-found") {
          state.error = "User not found";
        } else {
          state.error = action.error.code;
        }
      })
      .addCase(signUp.pending, (state) => {
        state.error = "";
      })
      .addCase(signUp.fulfilled, (state: SearchState, action) => {
        state.currentUser = action.payload;
      })
      .addCase(signUp.rejected, (state: SearchState, action) => {
        if (action.error.code === "auth/email-already-in-use") {
          state.error = "Email already in use";
        } else {
                  state.error = action.error.code;
        }

      })
      .addCase(signOut.pending, (state) => {
        state.error = "";
      })
      .addCase(signOut.fulfilled, (state: SearchState) => {
        state.currentUser = null;
      }).addCase(signOut.rejected, (state: SearchState, action) => {
        state.error = action.error.message;
        console.log(action.error.message);
      })
  },
});

export const { setCurrentUser, setError, clearError } = searchSlice.actions;

export const selectCurrentUser = (state: any) => state.search.currentUser;

export default searchSlice.reducer;
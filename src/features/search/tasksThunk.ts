// import { signIn, signUp } from "./searchSlice";
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// export const signInAsync = (email, password) => async (dispatch) => {
//   try {
//     const user = await signInWithEmailAndPassword(auth, email, password);
//     dispatch(signIn.fulfilled(user));
//     navigate("/search");
//   } catch (err) {
//     dispatch(signIn.rejected({ error: err }));
//   }
// };

// export const signUpAsync = (email, password) => async (dispatch) => {
//   try {
//     const user = await createUserWithEmailAndPassword(auth, email, password);
//     dispatch(signUp.fulfilled(user));
//     console.log(user);
//   } catch (err) {
//     dispatch(signUp.rejected({ error: err }));
//   }
// };

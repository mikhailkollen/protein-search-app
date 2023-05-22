import "./App.css"
import MainPage from "./pages/MainPage"
import { Fragment } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import { setCurrentUser } from './features/search/searchSlice';
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "./app/hooks"

const App = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     console.log(user);      
  //     navigate('/search');
  //   } else {
  //     navigate('/');
  //   }
  // });
  return (
      <MainPage />
  )
}

export default App

import "./css-reset.css"
import "./index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import ErrorPage from "./pages/ErrorPage"
import SearchPage from "./pages/SearchPage"

import App from "./App.tsx"

import { Provider } from "react-redux"
import {store} from "./app/store"
import { auth } from "./firebase";
import SingleProteinPage from "./pages/SingleProteinPage";




  const ProtectedRoute = ({ children }: any) => {
     const currentUser = auth.currentUser;

    if (!currentUser) {      
      return <Navigate to="/auth" />;
    }
    return children;
  };

ReactDOM.createRoot(document.querySelector("#root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
    <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<AuthPage/>}/>
          <Route path="*" element={<ErrorPage />} />
          <Route path="/search" element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          } />
          <Route path="/search/:searchValue" element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          } />
          <Route path="/protein/:id" element={
            <ProtectedRoute>
              <SingleProteinPage />
            </ProtectedRoute>
          } />
        </Routes>
    </Router>
    </Provider>
  </React.StrictMode>,
)

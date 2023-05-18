import "./index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import App from "./App.tsx"

ReactDOM.createRoot(document.querySelector("#root") as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<AuthPage/>}/>
      </Routes>
    </Router>
  </React.StrictMode>,
)

import "./App.css"
import MainPage from "./pages/MainPage"
import AuthPage from "./pages/AuthPage"
import ErrorPage from "./pages/ErrorPage"
import SearchPage from "./pages/SearchPage"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import SingleProteinPage from "./pages/SingleProteinPage";
import { Provider } from "react-redux"
import {store} from "./app/store"
import { auth } from "./firebase";
import { useCallback, useEffect, useState } from "react"

const ProtectedRoute = ({ element: Component, ...rest }: any) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        navigate('/auth', { state: { from: location.pathname } });
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [navigate, location]);

  if (loading) {
    return null;
  }

  if (!authenticated) {
    return <Navigate to="/auth" />;
  }

  return <Component {...rest} />;
};

  

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route
            path="/search"
            element={
              <ProtectedRoute element={SearchPage} />
            }
          />
          <Route
            path="/search/:searchValue"
            element={
              <ProtectedRoute element={SearchPage} />
            }
          />
          <Route
            path="/protein/:id"
            element={
              <ProtectedRoute element={SingleProteinPage} />
            }
          />
          <Route path="*" element={<Navigate to="/error" />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App

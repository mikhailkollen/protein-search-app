import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { auth } from "../firebase";
const ErrorPage = () => {

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        console.log("no user");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth.currentUser]);
  
  return (
    <Wrapper>
      {currentUser && <Header />}
      <section>
        <h1>404</h1>
        <h3>Page not found</h3>
        <Link to="/search" className="btn">
          Back to Search
        </Link>
      </section>
    </Wrapper>
  );
};

const Wrapper = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  min-height: fit-content;
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  h1 {
    font-size: 72px;
    margin-top: 255px;
    font-weight: 600;
  }
  h3 {
    font-size: 16px;
    color: var(--dark-grey-2);
    margin-bottom: 19px;
  }
  .btn {
    background-color: var(--light-blue);
    text-decoration: none;
    color: var(--black);
    padding: 16px 35px;
    font-weight: 700;
    font-size: 12px;
    border-radius: 24px;/* Add this line */
  }
`;

export default ErrorPage;

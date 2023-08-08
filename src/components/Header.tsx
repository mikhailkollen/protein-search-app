import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import styled from "styled-components"

import { useAppDispatch } from "../app/hooks"
import { signOut } from "../features/search/searchSlice"
import { auth } from "../firebase"

const Header = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSignOut = () => {
    dispatch(signOut())
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/")
      }
    })

    return () => {
      unsubscribe()
    }
  }, [auth.currentUser])

  return (
    <Wrapper>
      <div>
        <p>{auth.currentUser?.email}</p>
        <button onClick={handleSignOut}>{"Log out"}</button>
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.header`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  border-bottom: 1px solid var(--light-blue);
  div {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    align-self: center;
    margin: 0 auto;
    width: 80%;
    padding: 16px 0;
  }
  button {
    border-radius: none;
    padding: 0;
    background-color: transparent;
    border: none;
    color: var(--greyish-blue);
    margin-left: 30px;
    cursor: pointer;
    font-weight: 600;
  }
`

export default Header

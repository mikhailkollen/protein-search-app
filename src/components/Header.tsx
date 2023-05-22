import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../app/hooks'
import { signOut } from '../features/search/searchSlice'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'


const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('' as string | undefined);
    const handleSignOut =  () => {
    dispatch(signOut());
    navigate('/')
  }

      useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email!);
      } else {
        console.log('no user');
        
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth.currentUser]);



  return (
    <Wrapper>
     <div>
       <p>{userEmail}</p>
       <button onClick={handleSignOut}>Log out</button>
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
import { useState } from 'react'

import styled from 'styled-components'

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  return (
    <Wrapper>
      <h1>{isLogin ? "Login" : "Sign up"}</h1>
      <form>
        <label>
          <p>Username</p>
          <input type="text" />
        </label>
        <label>
          <p>Password</p>
          <input type="password" />
        </label>
        <div className='btn-container'>
          <button type="submit">Submit</button>
          <span >
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Login"}
            </button>
          </span>

        </div>
      </form>
    </Wrapper>
  )
}

const Wrapper = styled.main`
  display: flex;
  flex-direction: column;
  .btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  `

export default AuthPage
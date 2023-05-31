import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import styled from "styled-components"

import { useAppDispatch, useAppSelector } from "../app/hooks"
import backgroundImg from "../assets/background-img.png"
import { setCurrentUser, signIn, signUp } from "../features/search/searchSlice"
import { auth } from "../firebase"

const AuthPage = () => {
  const dispatch = useAppDispatch()

  const [isLogin, setIsLogin] = useState(true)
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const authError = useAppSelector((state) => state.search.error)

  const [isFormValid, setIsFormValid] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (location.state) {
          const { pathname, search } = location.state.from as any

          navigate(`${pathname}${search}`)
        } else {
          dispatch(setCurrentUser(user.email!))
          navigate("/search")
        }
      } else {
        console.log("no user")
      }
    })

    return () => {
      unsubscribe()
    }
  }, [auth.currentUser])

  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  useEffect(() => {
    checkFormValidity()
  }, [isLogin, email, password, passwordConfirm])

  const checkFormValidity = () => {
    if (isLogin) {
      setIsFormValid(email !== "" && password !== "")
    } else {
      setIsFormValid(
        email !== "" && password !== "" && password === passwordConfirm,
      )
    }
  }

  const handleSignIn = async (e: any) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")

      return
    }

    if (!validatePassword(password)) {
      setError("Please enter a valid password")

      return
    }

    try {
      await dispatch(signIn({ email, password })).then(() => {
        if (location.state) {
          const { pathname, search } = location.state.from as any

          console.log(location.state)

          console.log(`${pathname}${search}`)

          navigate(`${pathname}${search}`)
        } else {
          dispatch(setCurrentUser(auth.currentUser!.email!))
          navigate("/search")
        }
      })
    } catch (error_: any) {
      setError(error_.message)
      console.log(error_.message)
      console.log("error during auth")
    }
  }

  const handleSignUp = async (e: any) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")

      return
    }

    if (!validatePassword(password)) {
      setError(
        "Please enter a valid password (min. 6 characters and includes at least one lowercase letter, one uppercase letter, and one number)",
      )

      return
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match")

      return
    }

    try {
      await dispatch(signUp({ email, password }))
      console.log(auth.currentUser)
    } catch (error_: any) {
      setError(error_.message)
      console.log(error_.message)
    }
  }

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value)
  }

  const handlePasswordConfirmChange = (e: any) => {
    setPasswordConfirm(e.target.value)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasMinLength = password.length >= 6

    return hasLowerCase && hasUpperCase && hasNumber && hasMinLength
  }

  return (
    <Wrapper>
      <div>
        <h1>{isLogin ? "Login" : "Sign up"}</h1>
        <form onSubmit={isLogin ? handleSignIn : handleSignUp}>
          <label>
            <p>{"Email"}</p>
            <input
              type="email"
              required
              onChange={handleEmailChange}
              placeholder="Enter your email"
              style={{ outline: error ? "1px solid var(--alert-red)" : "" }}
            />
          </label>
          <label>
            <p>{"Password"}</p>
            <input
              type="password"
              required
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              style={{ outline: error ? "1px solid var(--alert-red)" : "" }}
            />
          </label>
          {!isLogin && (
            <label>
              <p>{"Repeat Password"}</p>
              <input
                type="password"
                required
                onChange={handlePasswordConfirmChange}
                placeholder="Enter your password again"
                style={{ outline: error ? "1px solid var(--alert-red)" : "" }}
              />
            </label>
          )}

          <div className="btn-container">
            <button type="submit" disabled={!isFormValid}>
              {isLogin ? "Login" : "Create Account"}
            </button>
            {error && <p className="error-message">{error}</p>}
            <span>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                }}
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </span>
          </div>
        </form>
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.main`
  display: flex;
  flex-direction: column;
  background-image: url(${backgroundImg});
  background-size: cover;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  min-height: 100vh;
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: fit-content;
    padding: 28px 30px;
    border-radius: 12px;
    align-self: center;
    background-color: var(--white);
    min-width: 400px;
  }
  h1 {
    font-weight: 700;
    font-size: 18px;
    margin-bottom: 28px;
  }
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    width: 100%;
  }

  label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    justify-content: flex-start;
  }

  label p {
    font-weight: 600;
    line-height: 19px;
    margin-bottom: 2px;
  }

  input {
    background-color: var(--grey);
    border: none;
    border-radius: 8px;
    padding: 15px;
    width: 100%;
  }

  .btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0;
  }

  .btn-container span {
    font-size: 12px;
    margin-top: 12px;
  }

  button[type="submit"] {
    background-color: var(--light-blue);
    border: none;
    border-radius: 8px;
    padding: 15px;
    width: 100%;
    color: var(--blue);
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
  }

  button[type="submit"]:disabled {
    background-color: var(--dark-grey-2);
    color: var(--white);
    cursor: not-allowed;
  }

  button[type="button"] {
    font-weight: 700;
    font-size: 12px;
  }

  .error-message {
    margin: 17px 20px;
    color: var(--alert-red);
    font-size: 12px;
    font-weight: 600;
  }
`

export default AuthPage

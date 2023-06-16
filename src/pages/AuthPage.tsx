import { ChangeEvent, useEffect, useState } from "react"
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
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()
  const authError = useAppSelector((state) => state.search.error)

  const [isFormValid, setIsFormValid] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (location.state) {
          const { pathname, search } = location.state.from

          navigate(`${pathname}${search}`)
        } else {
          dispatch(setCurrentUser(user.email!))
          navigate("/search")
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [auth.currentUser])

  useEffect(() => {
    if (authError) {
      setErrorMessage(authError)
    }
  }, [authError])

  const checkFormValidity = () => {
    if (isLogin) {
      setIsFormValid(email !== "" && password !== "")
    } else {
      setIsFormValid(
        email !== "" && password !== "" && password === passwordConfirm,
      )
    }
  }

  useEffect(() => {
    checkFormValidity()
  }, [isLogin, email, password, passwordConfirm])

  const validateEmail = (emailToValidate: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(emailToValidate)
  }

  const validatePassword = (passwordToValidate: string) => {
    const hasLowerCase = /[a-z]/.test(passwordToValidate)
    const hasUpperCase = /[A-Z]/.test(passwordToValidate)
    const hasNumber = /\d/.test(passwordToValidate)
    const hasMinLength = passwordToValidate.length >= 6

    return hasLowerCase && hasUpperCase && hasNumber && hasMinLength
  }

  const handleSignInAsync = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address")

      return
    }

    if (!validatePassword(password)) {
      setErrorMessage("Please enter a valid password")

      return
    }

    try {
      await dispatch(signIn({ email, password })).then(() => {
        if (location.state) {
          const { pathname, search } = location.state.from

          navigate(`${pathname}${search}`)
        } else {
          dispatch(setCurrentUser(auth.currentUser!.email!))
          navigate("/search")
        }

        return
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      }
    }
  }

  const handleSignUpAsync = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address")

      return
    }

    if (!validatePassword(password)) {
      setErrorMessage(
        "Please enter a valid password (min. 6 characters and includes at least one lowercase letter, one uppercase letter, and one number)",
      )

      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage("Passwords do not match")

      return
    }

    try {
      await dispatch(signUp({ email, password }))
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      }
    }
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value)
  }

  return (
    <Wrapper>
      <div>
        <h1>{isLogin ? "Login" : "Sign up"}</h1>
        <form onSubmit={isLogin ? handleSignInAsync : handleSignUpAsync}>
          <label>
            <p>{"Email"}</p>
            <input
              type="email"
              required
              onChange={handleEmailChange}
              placeholder="Enter your email"
              style={{
                outline: errorMessage ? "1px solid var(--alert-red)" : "",
              }}
            />
          </label>
          <label>
            <p>{"Password"}</p>
            <input
              type="password"
              required
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              style={{
                outline: errorMessage ? "1px solid var(--alert-red)" : "",
              }}
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
                style={{
                  outline: errorMessage ? "1px solid var(--alert-red)" : "",
                }}
              />
            </label>
          )}

          <div className="btn-container">
            <button type="submit" disabled={!isFormValid}>
              {isLogin ? "Login" : "Create Account"}
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <span>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrorMessage("")
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

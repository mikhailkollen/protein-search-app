import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import backgroundImg from '../assets/background-img.png'
import { auth } from '../firebase';
import { useAppDispatch } from "../app/hooks";
import { setCurrentUser, signIn, signUp } from "../features/search/searchSlice";
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

const AuthPage = () => {
  const dispatch = useAppDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('' as string | undefined);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setCurrentUser(user.email!));
        navigate('/search')
      } else {
        console.log('no user');
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, [auth.currentUser]);

  const handleSignIn = async (e: any) => {
    console.log('handleSignIn');

    e.preventDefault();
    setError('');
    try {
      await dispatch(signIn({ email, password })).then(()=> {
        console.log(auth.currentUser);
        
        navigate('/search')
      });
    } catch (err: any) {
      setError(err.message);
      console.log(err.message);
    }
  };

  const handleSignUp = async (e: any) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await dispatch(signUp({ email, password }));
      console.log(auth.currentUser);
    } catch (err: any) {
      setError(err.message);
      console.log(err.message);
    }
  };
  return (
    <Wrapper>
      <div>
        <h1>{isLogin ? "Login" : "Sign up"}</h1>
      <form onSubmit={isLogin ? handleSignIn : handleSignUp}>
        <label>
          <p>Email</p>
          <input type="email" required onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email' />
        </label>
        <label>
          <p>Password</p>
          <input type="password" required onChange={(e) => setPassword(e.target.value)} placeholder='Enter your password' />
        </label>
        {
          isLogin ? null : (
            <label>
              <p>Repeat Password</p>
              <input type="password" required onChange={(e)=> setPasswordConfirm(e.target.value)} placeholder='Enter your password again' />
            </label>
          )
        }

        <div className='btn-container'>
          <button type="submit">{isLogin ? "Login" : "Create Account"}</button>
          <p>{auth.currentUser?.email}</p>
          <span>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Login"}
            </button>
          </span>
        </div>
      </form>
      </div>
      
    </Wrapper>
  );
};

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

  button[type='submit'] {
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

  button[type='button'] {
    font-weight: 700;
    font-size: 12px;
  }
`;

export default AuthPage;
import { useEffect } from 'react'
import Header from '../components/Header'
import styled from 'styled-components'
import { onAuthStateChanged } from 'firebase/auth';
import { setCurrentUser } from '../features/search/searchSlice';
import { auth } from '../firebase';
import { useAppDispatch } from '../app/hooks';
import { useNavigate } from 'react-router-dom';
import FiltersIcon from '../assets/FiltersIcon';
import TableViewWithReactQueryProvider from '../components/TableView';


const SearchPage = () => {

  const dispatch = useAppDispatch();
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


  return (
    <Wrapper>
      <Header />
      <main>
        <form >
          <input type="text" placeholder="Enter search value" />
          <button type="submit">Search</button>
          <button type="button">
            <FiltersIcon />
          </button>
        </form>
        {/* <p className='no-data-text'>
     No data to display <br /> Please start search to display results
    </p> */}
        <div className='table-container'>
          <TableViewWithReactQueryProvider />
          {/* <ExampleWithReactQueryProvider/> */}

        </div>

      </main>

    </Wrapper>
  )
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  main {
    display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 100%;
  margin-top: 30px;
  form {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 9px;
    input {
      width: 70%;
      border: 1px solid var(--light-grey);
      border-radius: 8px;
      padding: 11px 16px;
      font-size: 14px;
      line-height: 19px;
      color: var(--dark-grey-2);
    }
    button {
      border-radius: 8px;
      background-color: var(--light-blue);
      border: none;
      padding: 11px 66px;
      
      color: var(--active-blue);
      font-weight: 600;
      line-height: 19px;
      text-align: center;
      vertical-align: middle;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
    }

    button[type="button"] {
      height: 40px;
    }
    button:hover {
      background-color: var(--light-blue);
    }
    
  }
  .no-data-text {
      position: absolute;
      top: 50%;
    }
  .table-container {
    margin-top: 30px;
    .organism-name {
      background-color: var(--light-blue);
      color: var(--dark);    
      border-radius: 12px;
      padding: 2px 12px;
    }
  }
  }
`

export default SearchPage
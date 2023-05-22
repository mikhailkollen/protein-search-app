import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import { onAuthStateChanged } from "firebase/auth";
import { setCurrentUser } from "../features/search/searchSlice";
import { auth } from "../firebase";
import { useAppDispatch } from "../app/hooks";
import { useNavigate, Navigate } from "react-router-dom";
import ProteinTabs from "../components/ProteinTabs";

const SingleProteinPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setCurrentUser(user.email!));
      } else {
        console.log('no user');
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, [auth.currentUser]);

  useEffect(() => {
    if (!initialLoad && auth.currentUser) {
      navigate(`/protein/${id}`);
    }
  }, [id, navigate, initialLoad]);

  useEffect(() => {
    if (auth.currentUser) {
      setInitialLoad(false);
    }
  }, [auth.currentUser]);

  const url = `https://rest.uniprot.org/uniprotkb/${id}`;
  const [data, setData] = useState({} as any);
  const [uniProtkbId, setUniProtkbId] = useState("");
  const [description, setDescription] = useState("");
  const [gene, setGene] = useState("");

  const fetchSingleProtein = async (id: string) => {
    const response = await fetch(url);
    const responseData = await response.json();
    setData({
      uniProtkbId: responseData.uniProtkbId,
      description: responseData.proteinDescription.recommendedName.fullName.value,
      gene: responseData.genes[0].geneName.value,
      length: responseData.sequence.length,
      lastUpdated: responseData.entryAudit.lastAnnotationUpdateDate,
      mass: responseData.sequence.molWeight,
      checksum: responseData.sequence.crc64,
      sequence: responseData.sequence.value,
    });
  };

  useEffect(() => {
    fetchSingleProtein(id!);
  }, [id]);


  return (
    <>
      <Header />
      <Wrapper>
        <main>
          <header>

          
          <h1>
            {id} / {data.uniProtkbId}
          </h1>
          <h2>Protein</h2>
          <p>{data.description}</p>
          <h2>Gene</h2>
          <p>{data.gene}</p>
          </header>
          <ProteinTabs data={data}/>
        </main>
      </Wrapper>
    </>
  );
};
const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 80%;
  margin-top: 30px;
  main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 130px;
    width: 80%;
    header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 12px;
    }
    h2 {
      color: var(--dark-grey-3);
      margin-bottom: 4px;
    }

    p {
      margin-bottom: 12px;
    }
  }
`;

export default SingleProteinPage;
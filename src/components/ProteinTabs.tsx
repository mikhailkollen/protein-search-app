import * as React from "react";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import ProtvistaUniprot from "protvista-uniprot";
import styled from "styled-components";


import { ProteinTabsProps, TabPanelProps } from "../types";
import Publications from "./Publications";
import ProteinDetailsTab from "./ProteinDetailsTab";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "protvista-uniprot": any;
    }
  }
}

window.customElements.define("protvista-uniprot", ProtvistaUniprot as any);

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ paddingTop: 3 }}>
          <Wrapper>{children}</Wrapper>
        </Box>
      )}
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const ProteinTabs: React.FC<ProteinTabsProps> = ({ data }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    event.target!;
    setValue(newValue);
  };
  
  const [publications, setPublications] = React.useState([]) as any;

  const fetchPublications = async () => {
    if (!data.accession) {
      return;
    }

    const response = await fetch(
      `https://rest.uniprot.org/uniprotkb/${data.accession}/publications`
    );

    const dataResponse = await response.json();

    setPublications(dataResponse.results);

    return publications;
  };

  useEffect(() => {
    fetchPublications();
  }, [data]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="protein details tabs"
          TabIndicatorProps={{
            style: {
              backgroundColor: "var(--active-blue)",
              color: "var(--dark-grey-3)",
            },
          }}
        >
          <Tab
            label="Details"
            {...a11yProps(0)}
            sx={{
              fontFamily: "Open Sans",
              textTransform: "initial",
              fontWeight: "600",
            }}
          />
          <Tab
            label="Feature Viewer"
            {...a11yProps(1)}
            sx={{
              fontFamily: "Open Sans",
              textTransform: "initial",
              fontWeight: "600",
            }}
          />
          <Tab
            label="Publications"
            sx={{
              fontFamily: "Open Sans",
              textTransform: "initial",
              fontWeight: "600",
            }}
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <ProteinDetailsTab {...data} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div>
          <protvista-uniprot accession={data.accession} />
        </div>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Publications publications={publications} />
      </TabPanel>
    </Box>
  );
};

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  .title {
    color: var(--black);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 17px;
  }

  .data-title {
    color: var(--dark-grey-3);
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .data-text {
    color: var(--black);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }

  .sequence-container {
    width: 100%;
    word-break: break-all;
    background-color: var(--light-grey-2);
    padding: 12px;
    border-radius: 8px;
    position: relative;
    .copy-btn {
      position: absolute;
      top: -25px;
      right: 0;
      display: flex;
      gap: 5px;
      font-weight: 600;
      align-items: center;
    }
  }
  .flex-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 21px;
    width: 50%;
    text-align: left;
    .column {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }
  }
`;

export default ProteinTabs;

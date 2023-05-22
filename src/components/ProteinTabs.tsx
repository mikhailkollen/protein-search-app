import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import styled from 'styled-components';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ProteinData {
  uniProtkbId: string;
  description: string;
  gene: string;
  length: number;
  lastUpdated: string;
  mass: number;
  checksum: string;
  sequence: string;
}

interface ProteinTabsProps {
  data: ProteinData;
}

function TabPanel(props: TabPanelProps) {
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
        <Box sx={{ p: 3 }}>
          <Wrapper>{children}</Wrapper>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ProteinTabs: React.FC<ProteinTabsProps> = ({ data }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box >
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example"
  TabIndicatorProps={{style: {backgroundColor: "var(--active-blue)", color: "var(--dark-grey-3)"}}}
        >
          <Tab label="Details" {...a11yProps(0)} sx={{fontFamily: "Open Sans", textTransform: "initial", fontWeight: "600"}} />
          <Tab label="Feature Viewer" {...a11yProps(1)} sx={{fontFamily: "Open Sans", textTransform: "initial", fontWeight: "600"}} />
          <Tab label="Publications" sx={{fontFamily: "Open Sans", textTransform: "initial", fontWeight: "600"}} {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
       <h2 className='title'>Sequence</h2>
      <div className='flex-container'>
        <div className="column">
         <div>
           <h3 className='data-title'>Length</h3>
           <p className='data-text'>{data.length}</p>
         </div>
         <div>
           <h3 className='data-title' >Mass</h3>
           <p className='data-text'>{data.mass}</p>
           </div>
        </div>
        <div className="column">
         <div>
           <h3 className='data-title'>Last Updated</h3>
           <p className='data-text'>{data.lastUpdated}</p>
         </div>
         <div>
           <h3 className='data-title'>Checksum</h3>
           <p className='data-text'>{data.checksum}</p>
         </div>
        </div>
      </div>
      <div className='sequence-container'>
       <p className='data-text'>{data.sequence}</p>

      </div>
      </TabPanel>
    </Box>
  );
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  .title {
   color: var(--black);
   font-size: 16px;
   font-weight: 600;
  }
  

  .data-title {
   color: var(--dark-grey-3);
   font-size: 12px;
   font-weight: 600;
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
  }
  .flex-container {
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   align-items: flex-start;
   width: 100%;
   gap: 21px;
   text-align: left;
   .column {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
   }
  }
 `



export default ProteinTabs;
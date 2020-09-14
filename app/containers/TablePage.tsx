import React, { useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import GenericTemplate from '../templates/GenericTemplate';
import DataTable from '../components/DataTable';
import SchemaTable from '../components/SchemaTable';
import ExportTable from '../components/ExportTable';
import ImportTable from '../components/ImportTable';
import SettingTable from '../components/SettingTable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <span
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </span>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function TablePage({ match }) {
  const classes = useStyles();
  const { table } = match.params;
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <GenericTemplate title={table} id={table}>
      <Paper square key={table}>
        <Tabs
          value={tab}
          onChange={handleChange}
          aria-label="simple tabs example"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Browse" {...a11yProps(0)} />
          <Tab label="Structure" {...a11yProps(1)} />
          <Tab label="Export" {...a11yProps(2)} />
          <Tab label="Import" {...a11yProps(3)} />
          <Tab label="Setting" {...a11yProps(4)} />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <DataTable table={table} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <SchemaTable table={table} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <ExportTable table={table} />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <ImportTable table={table} />
        </TabPanel>
        <TabPanel value={tab} index={4}>
          <SettingTable table={table} />
        </TabPanel>
      </Paper>
    </GenericTemplate>
  );
}

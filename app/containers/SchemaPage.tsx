import React, { useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import Typography from '@material-ui/core/Typography';
import GenericTemplate from '../templates/GenericTemplate';
import DataTable from './schema/DataTable';
import SchemaTable from './schema/SchemaTable';
import ExportTable from './schema/ExportTable';
import ImportTable from './schema/ImportTable';

import StoreContext from '../store/StoreContext';

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
      {value === index && <Box p={3}>{children}</Box>}
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

export default function SchemaPage() {
  const classes = useStyles();
  const { t } = useTranslation();
  const { name } = useParams();
  const [tab, setTab] = useState(0);

  const [{ schema: dataState }, dispatch] = useContext(StoreContext);

  useEffect(() => {
    ipcRenderer
      .invoke('schema', {
        name,
      })
      .then((schema) => {
        dispatch({
          type: 'SCHEMA_CHANGE',
          payload: schema,
        });
      });

    setTab(0);
    return () => {
      dispatch({
        type: 'SCHEMA_INIT',
      });
    };
  }, [name, dispatch]);

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  return (
    <GenericTemplate id={name}>
      <Paper square>
        <Typography variant="body1" gutterBottom>
          {dataState.memo}
        </Typography>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label={t('tabs')}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('data')} {...a11yProps(0)} />
          <Tab label={t('Structure')} {...a11yProps(1)} />
          <Tab label={t('Export')} {...a11yProps(2)} />
          <Tab label={t('Import')} {...a11yProps(3)} />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <DataTable />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <SchemaTable dataState={dataState} dispatch={dispatch} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <ExportTable dataState={dataState} />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <ImportTable dispatch={dispatch} dataState={dataState} />
        </TabPanel>
      </Paper>
    </GenericTemplate>
  );
}

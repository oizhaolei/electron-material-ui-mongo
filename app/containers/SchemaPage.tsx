import React, { useState, useEffect, useReducer } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

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

import { initialState, dataReducer } from '../reducers/schema';

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

export default function SchemaPage() {
  const classes = useStyles();
  const { t } = useTranslation();
  const { name } = useParams();
  const [tab, setTab] = useState(0);

  const [dataState, dispatch] = useReducer(dataReducer, {
    ...initialState,
    name,
  });

  useEffect(() => {
    const schemaListener = (event, schema) => {
      dispatch({
        type: 'SCHEMA_CHANGE',
        payload: schema,
      });
    };
    ipcRenderer.on('schema', schemaListener);
    ipcRenderer.send('schema', name);
    return () => {
      ipcRenderer.removeListener('schema', schemaListener);
    };
  }, [name]);

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const handleSaveSchema = () => {
    const newSchema = ipcRenderer.sendSync('schema-post', {
      name: dataState.name,
      definition: dataState.definition,
      sync: true,
    });
    dispatch({
      type: 'SCHEMA_CHANGE',
      payload: newSchema,
    });
  };

  return (
    <GenericTemplate id={name}>
      <Paper square key={name}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label="simple tabs example"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('Browse')} {...a11yProps(0)} />
          <Tab label={t('Structure')} {...a11yProps(1)} />
          <Tab label={t('Export')} {...a11yProps(2)} />
          <Tab label={t('Import')} {...a11yProps(3)} />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <DataTable
            dataState={dataState}
            dispatch={dispatch}
            readonly={false}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <SchemaTable
            dataState={dataState}
            dispatch={dispatch}
            handleSaveSchema={handleSaveSchema}
          />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <ExportTable
            dataState={dataState}
          />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <ImportTable
            dispatch={dispatch}
            dataState={dataState}
          />
        </TabPanel>
      </Paper>
    </GenericTemplate>
  );
}

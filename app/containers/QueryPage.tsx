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
import QueryTable from './query/QueryTable';
import SettingForm from './query/SettingForm';

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

export default function QueryPage() {
  const classes = useStyles();
  const { t } = useTranslation();
  const { name } = useParams();
  const [tab, setTab] = useState(0);

  const [{ query: dataState }, dispatch] = useContext(StoreContext);

  useEffect(() => {
    ipcRenderer
      .invoke('query', {
        name,
      })
      .then((query) => {
        dispatch({
          type: 'QUERY_CHANGE',
          payload: query,
        });
      });

    setTab(0);
    return () => {
      dispatch({
        type: 'QUERY_INIT',
      });
    };
  }, [name, dispatch]);

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  return (
    <GenericTemplate id={name}>
      <Paper square>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label={t('tabs')}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('data')} {...a11yProps(0)} />
          <Tab label={t('setting')} {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <QueryTable />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <SettingForm />
        </TabPanel>
      </Paper>
    </GenericTemplate>
  );
}

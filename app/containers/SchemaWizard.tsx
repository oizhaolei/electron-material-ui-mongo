import React, { useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import GenericTemplate from '../templates/GenericTemplate';
import NameForm from '../components/schema/NameForm';
import CSVImport from '../components/schema/CSVImport';
import StoreContext from '../store/StoreContext';

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const useStyles = makeStyles((theme) => ({
  paper: {
    maxWidth: 800,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    alignItems: 'center',
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

function SchemaWizard() {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const [activeStep, setActiveStep] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);
  const [{ schemaWizard: dataState }, dispatch] = useContext(StoreContext);

  useEffect(() => {
    dispatch({
      type: 'SCHEMA_WIZARD_CLEAN',
    });
    return () => {
      dispatch({
        type: 'SCHEMA_WIZARD_CLEAN',
      });
    };
  }, []);

  const handleSnackClose = (event, reason) => {
    setSnackOpen(false);
    history.replace(`/table/${dataState.name}`);
  };

  const steps = [
    t('Table Name'),
    t('Upload Data'),

  ];
  const stepLabels = [
    t('Next'),
    t('Create Table'),
  ];

  const stepActions = [
    () => {}, // 'Next'
    () => {   // 'Create Table'
      console.log('dataState:', dataState);
      ipcRenderer.invoke('schema-post', {
        name: dataState.name,
        definition: dataState.definition,
        docs: dataState.data,
      }).then((newSchema) => {
        console.log('schema-post:', newSchema);
        setSnackOpen(true);
      });
    },
  ];

  const handleNext = () => {
    stepActions[activeStep]();
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
      return (
        <NameForm
          dataState={dataState}
          dispatch={dispatch}
        />
      );
      case 1:
      return (
        <CSVImport
          dataState={dataState}
          dispatch={dispatch}
        />
      );
      default:
      throw new Error('Unknown step');
    }
  };

  return (
    <GenericTemplate title="Create Table" id="create-wizard">
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" align="center">
          {t('Create Table')}
        </Typography>
        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <>
          {activeStep === steps.length ? (
            <>
              <Typography variant="h5" gutterBottom>
                {t('Congratulations.')}
              </Typography>
              <Typography variant="subtitle1">
                {t('create. succeed')}
              </Typography>
            </>
          ) : (
            <>
              {getStepContent(activeStep)}
              <div className={classes.buttons}>
                {activeStep !== 0 && (
                  <Button
                    disabled={dataState.error}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    {t('Back')}
                  </Button>
                )}
                <Button
                  disabled={dataState.error}
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                >
                  {stepLabels[activeStep]}
                </Button>
              </div>
            </>
          )}
        </>

        <Snackbar
          open={snackOpen}
          autoHideDuration={2000}
          onClose={handleSnackClose}
          >
          <Alert onClose={handleSnackClose} severity="success">
            {t('Table created, redirect')}
          </Alert>
        </Snackbar>
      </Paper>
    </GenericTemplate>
  );
}
export default SchemaWizard;

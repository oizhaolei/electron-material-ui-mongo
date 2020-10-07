import React, { useState, useEffect, useReducer } from 'react';
import { ipcRenderer } from 'electron';

import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';


import GenericTemplate from '../templates/GenericTemplate';
import NameForm from '../components/query/NameForm';
import RelationForm from '../components/query/RelationForm';
import Review from '../components/query/Review';
import { initialState, dataReducer } from '../reducers/query';

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

const steps = ['Query Name', 'Relations', 'Preview'];
const stepLabels = ['Next', 'Next', 'Create Query'];

function QueryWizard({ history }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);
  const [dataState, dispatch] = useReducer(dataReducer, initialState);
  useEffect(() => {
    const queryPostListener = (event, args) => {
      console.log('query-post:', args);
      setSnackOpen(true);
    };
    ipcRenderer.on('query-post', queryPostListener);

    return () => {
      ipcRenderer.removeListener('query-post', queryPostListener);
    };
  }, []);
  const handleSnackClose = (event, reason) => {
    setSnackOpen(false);
    history.replace(`/table/${dataState.table}`);
  };

  const stepActionss = [
    // 'Next'
    () => {},
    // 'Next'
    () => {},
    // 'Create Query'
    () => {
      ipcRenderer.send('query-post', {
        query: dataState.query,
        data: {
          type: dataState.type,
          relations: dataState.relations,
          code: dataState.code,
        },
      });
    },
  ];

  const handleNext = () => {
    stepActionss[activeStep]();
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
          onChange={(payload) => dispatch({
            type: 'QUERY_DATA_CHANGE',
            payload,
          })}
        />
        );
      case 1:
        return (
        <RelationForm
          dataState={dataState}
          onChange={(payload) => dispatch({
            type: 'QUERY_DATA_CHANGE',
            payload,
          })}
        />
        );
      case 2:
        return (
        <Review
          dataState={dataState}
          onChange={(payload) => dispatch({
            type: 'QUERY_DATA_CHANGE',
            payload,
          })}
        />
        );
      default:
        throw new Error('Unknown step');
    }
  };

  return (
    <GenericTemplate title="Create Query" id="create-wizard">
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" align="center">
        Create Query
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
                Thank you for your order.
              </Typography>
              <Typography variant="subtitle1">
                Your order number is #2001539. We have emailed your order confirmation, and will
                send you an update when your order has shipped.
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
                   className={classes.button}>
                    Back
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
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackOpen}
        autoHideDuration={2000}
        onClose={handleSnackClose}
        message="Table created, redirect..."
      />
      </Paper>
    </GenericTemplate>
  );
}
export default withRouter(QueryWizard);

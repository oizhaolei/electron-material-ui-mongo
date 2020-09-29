import React, { useState, useEffect, useReducer } from 'react';
import { ipcRenderer } from 'electron';

import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import GenericTemplate from '../templates/GenericTemplate';
import NameForm from '../components/schema/NameForm';
import EtcForm from '../components/schema/EtcForm';
import CSVImport from '../components/schema/CSVImport';
import Review from '../components/schema/Review';
import { initialState, dataReducer } from './schemaSlice';

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

const steps = ['Table Name', 'Title, Icon', 'Upload Data'];
const stepLabels = ['Next', 'Next', 'Create Table'];

function SchemaWizard({ history }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [dataState, dispatch] = useReducer(dataReducer, initialState)
  useEffect(() => {
    const schemaPostListener = (event, args) => {
      console.log('schema-post:', args);
      history.replace(`/table/${args.table}`);
    };
    ipcRenderer.on('schema-post', schemaPostListener);

    return () => {
      ipcRenderer.removeListener('schema-post', schemaPostListener);
    };
  }, []);

  const stepActionss = [
    // 'Check Name'
    () => {},
    // 'Next'
    () => {},
    // 'Create Table'
    () => {
      ipcRenderer.send('schema-post', {
        table: dataState.table,
        definition: dataState.definition,
        etc: {
          label: dataState.label,
          icon: dataState.icon,
        },
        docs: dataState.data,
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
            type: 'DATA_CHANGE',
            payload,
          })}
        />
        );
      case 1:
        return (
        <EtcForm
          dataState={dataState}
          onChange={(payload) => dispatch({
            type: 'DATA_CHANGE',
            payload,
          })}
        />
        );
      case 2:
        return (
        <CSVImport
          dataState={dataState}
          onChange={(payload) => dispatch({
            type: 'DATA_CHANGE',
            payload,
          })}
        />
        );
      case 3:
        return <Review dataState={dataState} />;
      default:
        throw new Error('Unknown step');
    }
  };

  return (
    <GenericTemplate title="Create Table" id="create-wizard">
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" align="center">
        Create Table
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
                  <Button onClick={handleBack} className={classes.button}>
                    Back
                  </Button>
                )}
                <Button
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
      </Paper>
    </GenericTemplate>
  );
}
export default withRouter(SchemaWizard);

import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import GenericTemplate from '../templates/GenericTemplate';
import Query from '../components/query/Query';
import { initialState, dataReducer } from '../reducers/query';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function QueryPage({ match }) {
  const classes = useStyles();
  const { query } = match.params;
  const [dataState, dispatch] = useReducer(dataReducer, initialState);

  return (
    <GenericTemplate title="Query" id="query">
      <div className={classes.root}>
        <Query
         dataState={query}
         onChange={(payload) => dispatch({
          type: 'QUERY_DATA_CHANGE',
          payload,
        })}
        />
      </div>
    </GenericTemplate>
  );
}

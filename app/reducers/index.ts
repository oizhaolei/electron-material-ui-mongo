import queryWizard from './query-wizard';
import schemaWizard from './schema-wizard';
import schema from './schema';
import auth from './auth';

export default (state = {}, action = {}) => {
  return {
    queryWizard: queryWizard(state.queryWizard, action),
    schemaWizard: schemaWizard(state.schemaWizard, action),
    schema: schema(state.schema, action),
    auth: auth(state.auth, action),
  };
};

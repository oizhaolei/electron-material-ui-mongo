import queryWizard from './query-wizard';
import schemaWizard from './schema-wizard';
import schema from './schema';
import query from './query';
import mongodb from './mongodb';

export default (state = {}, action = {}) => {
  return {
    queryWizard: queryWizard(state.queryWizard, action),
    schemaWizard: schemaWizard(state.schemaWizard, action),
    schema: schema(state.schema, action),
    query: query(state.query, action),
    mongodb: mongodb(state.mongodb, action),
  };
};

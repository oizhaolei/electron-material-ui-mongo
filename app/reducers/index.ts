import schema from "./schema";
import query from "./query";

export default function(state = {}, action = {}) {
  return {
    schema: schema(state.schema, action),
    query: query(state.query, action),
  };
}

export default function createReducer (initial_state, handlers) {
  return ( state = initial_state, action ) => {
    var h = handlers[ action.type ];
    return h ? h( state, action, initial_state ) : state;
  }
}

import { useMemo, useReducer } from "react";

export function createGovernor(initialState = {}, actions = {}) {
  if (!initialState || typeof initialState !== "object") {
    throw new TypeError(
      `initialState is invalid: expected "object"; got "${typeof initialState}"`,
      initialState
    );
  }
  if (!actions || typeof actions !== "object") {
    throw new TypeError(
      `actions is invalid: expected "object"; got "${typeof actions}"`,
      actions
    );
  }

  class HookActions {

    constructor() {
      for (let key in actions) {
        if (key === 'dispatch' || key === 'state') {
          throw new Error('Cannot name actions as "dispatch" or "state"');
        }
        this[key] = async (...payload) => {
          const newState = await actions[key](...payload, this.state);
          this.dispatch({
            type: key,
            newState: newState
          });
        };
      }
    }

  }


  function createHook() {
    return function() {
      const [state, dispatch] = useReducer((state, action) => {
        return { ...state, ...action.newState };
      }, initialState);

      const hookActions = useMemo(() => {
        const hookActions = new HookActions();
        hookActions.dispatch = dispatch;
        return hookActions;
      }, []);

      hookActions.state = state;

      return [state, hookActions];
    };
  }

  return createHook();
}
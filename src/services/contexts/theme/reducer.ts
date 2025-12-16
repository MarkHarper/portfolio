import { produce } from 'immer';

export const themeReducer = produce((draft, action) => {
  switch (action.type) {
    case 'setName': {
      draft.name = action.name;

      break;
    }

    case 'setTokens': {
      draft.tokens = action.tokens;

      break;
    }

    case 'setMode': {
      draft.mode = action.mode;

      break;
    }

    case 'setTheme': {
      return {
        name: action.name,
        mode: action.mode,
        tokens: action.tokens,
      };
    }

    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
});

export default themeReducer;

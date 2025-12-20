import { produce, enableMapSet } from 'immer';

enableMapSet();

export const vizReducer = produce((draft, action) => {
  switch (action.type) {
    case 'density': {
      draft.density = action.density;

      break;
    }

    case 'lineColor': {
      draft.lineColor = action.lineColor;
      draft.lineColorVar = action.lineColorVar;

      break;
    }

    case 'edgeDistance': {
      draft.edgeDistance = action.edgeDistance;

      break;
    }

    case 'maxVelocity': {
      draft.maxVelocity = action.maxVelocity;

      break;
    }

    case 'springStrength': {
      draft.springStrength = action.springStrength;

      break;
    }

    case 'nodeMass': {
      const { id, mass } = action;
      const nodeSetting = draft.nodes.get(id);
      draft.nodes.set(id, {
        ...nodeSetting,
        mass,
      });

      break;
    }

    case 'nodeColor': {
      const { id, color } = action;
      const nodeSetting = draft.nodes.get(id);
      draft.nodes.set(id, {
        ...nodeSetting,
        color,
      });

      break;
    }

    case 'nodeRadius': {
      const { id, radius } = action;
      const nodeSetting = draft.nodes.get(id);
      draft.nodes.set(id, {
        ...nodeSetting,
        radius,
      });

      break;
    }

    case 'nodeSpeed': {
      const { id, speed } = action;
      const nodeSetting = draft.nodes.get(id);
      draft.nodes.set(id, {
        ...nodeSetting,
        speed,
      });

      break;
    }

    case 'deleteNodeSetting': {
      draft.nodes.delete(action.id);

      break;
    }

    case 'addNodeSetting': {
      draft.nodes.set(action.nodeSetting.id, action.nodeSetting);

      break;
    }

    case 'setSettings': {
      return action.settings;
    }

    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
});

export default vizReducer;

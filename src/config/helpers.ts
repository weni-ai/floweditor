import {
  FlowTypes,
  FlowTypeVisibility,
  Operator,
  Type,
  VISIBILITY_ONLINE,
} from 'config/interfaces';
import { FlowEditorConfig } from 'flowTypes';
import i18n from './i18n';

export const isOnlineFlowType = (flowType: FlowTypes) => {
  return !!VISIBILITY_ONLINE.find((type: FlowTypes) => type === flowType);
};

export const filterOperators = (
  operators: Operator[],
  config: FlowEditorConfig,
): Operator[] => {
  return filterVisibility(operators, config);
};

export const filterTypeConfigs = (
  typeConfigs: Type[],
  config: FlowEditorConfig,
): Type[] => {
  return filterVisibility(typeConfigs, config).map((typeConfig: Type) => {
    if (typeConfig.new) {
      return {
        ...typeConfig,
        description: `${typeConfig.description} (${i18n.t('new', 'New')})`,
      };
    }

    return typeConfig;
  });
};

const filterVisibility = (
  items: FlowTypeVisibility[],
  config: FlowEditorConfig,
): any[] => {
  return items.filter((item: FlowTypeVisibility) => {
    // if we have a filter on our type, don't return it unless its present in our config
    if (item.filter) {
      if (
        !(config.filters || []).find((name: string) => name === item.filter)
      ) {
        return false;
      }
    }

    if (item.visibility === undefined) {
      return true;
    }

    return (
      item.visibility.findIndex((ft: FlowTypes) => ft === config.flowType) > -1
    );
  });
};

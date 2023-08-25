import ExcellentParser, { Expression } from '../../components/form/textinput/ExcellentParser';
import { TembaStore } from '../../temba-components';

const messageParser = new ExcellentParser('@', ['contact', 'fields', 'globals', 'urns']);

const sessionParser = new ExcellentParser('@', [
  'contact',
  'fields',
  'globals',
  'urns',
  'results',
  'input',
  'run',
  'child',
  'parent',
  'node',
  'webhook',
  'ticket',
  'trigger',
  'resume'
]);

export interface Position {
  top: number;
  left: number;
}

export interface FunctionExample {
  template: string;
  output: string;
}

export interface CompletionOption {
  name?: string;
  summary: string;

  // functions
  signature?: string;
  detail?: string;
  examples?: FunctionExample[];
}

export interface CompletionResult {
  // anchorPosition: Position;
  query: string;
  options: CompletionOption[];
  currentFunction: CompletionOption;
}

export interface CompletionProperty {
  key: string;
  help: string;
  type: string;
}

export interface CompletionType {
  name: string;

  key_source?: string;
  property_template?: CompletionProperty;
  properties?: CompletionProperty[];
}

export interface CompletionSchema {
  types: CompletionType[];
  root: CompletionProperty[];
  root_no_session: CompletionProperty[];
}

export interface KeyedAssets {
  [assetType: string]: string[];
}

export const getFunctions = (functions: CompletionOption[], query: string): CompletionOption[] => {
  if (!query) {
    return functions;
  }
  return functions.filter((option: CompletionOption) => {
    if (option.signature) {
      return option.signature.indexOf((query || '').toLowerCase()) === 0;
    }
    return false;
  });
};

/**
 * Takes a dot query and returns the completions options at the current level
 * @param dotQuery query such as "contact.first_n"
 */
export const getCompletions = (
  schema: CompletionSchema,
  dotQuery: string,
  keyedAssets: KeyedAssets = {},
  session: boolean
): CompletionOption[] => {
  const parts = (dotQuery || '').split('.');
  let currentProps: CompletionProperty[] = session ? schema.root : schema.root_no_session;

  if (!currentProps) {
    return [];
  }

  let prefix = '';
  let part = '';
  while (parts.length > 0) {
    part = parts.shift();
    if (part) {
      // eslint-disable-next-line
      const nextProp = currentProps.find((prop: CompletionProperty) => prop.key === part);
      if (nextProp) {
        // eslint-disable-next-line
        const nextType = schema.types.find((type: CompletionType) => type.name === nextProp.type);
        if (nextType && nextType.properties) {
          currentProps = nextType.properties;
          prefix += part + '.';
        } else if (nextType && nextType.property_template) {
          prefix += part + '.';
          const template = nextType.property_template;
          if (keyedAssets[nextType.name]) {
            currentProps = keyedAssets[nextType.name].map((key: string) => ({
              key: template.key.replace('{key}', key),
              help: template.help.replace('{key}', key),
              type: template.type
            }));
          } else {
            currentProps = [];
          }
        } else {
          // eslint-disable-next-line
          currentProps = currentProps.filter((prop: CompletionProperty) =>
            prop.key.startsWith(part.toLowerCase())
          );
          break;
        }
      } else {
        // eslint-disable-next-line
        currentProps = currentProps.filter((prop: CompletionProperty) =>
          prop.key.startsWith(part.toLowerCase())
        );
        break;
      }
    }
  }

  return currentProps.map((prop: CompletionProperty) => {
    const name =
      prop.key === '__default__' ? prefix.substr(0, prefix.length - 1) : prefix + prop.key;
    return { name, summary: prop.help };
  });
};

export const updateInputElementWithCompletion = (
  currentQuery: string,
  ele: HTMLInputElement,
  option: CompletionOption
) => {
  let insertText = '';

  if (option.signature) {
    // they selected a function
    insertText = option.signature.substr(0, option.signature.indexOf('(') + 1);
  } else {
    insertText = option.name;
  }

  const queryLength = currentQuery.length;

  if (ele) {
    const value = ele.value;
    const insertionPoint = ele.selectionStart - queryLength;

    // strip out our query
    const leftSide = value.substr(0, insertionPoint);
    const remaining = value.substr(insertionPoint + queryLength);
    const caret = leftSide.length + insertText.length;

    // set our value and our new caret
    ele.value = leftSide + insertText + remaining;
    ele.setSelectionRange(caret, caret);

    ele.dispatchEvent(new Event('input'));
    ele.focus();
  }
};

export const executeCompletionQuery = (
  ele: HTMLInputElement,
  store: TembaStore,
  session: boolean,
  functions: CompletionOption[],
  context: CompletionSchema
): CompletionResult => {
  const result: CompletionResult = {
    currentFunction: null,
    options: [],
    query: null
  };

  if (!ele) {
    return;
  }

  // we need a store to do anything useful
  // this also disables expressions in local development environment
  if (!store) {
    return result;
  }

  const cursor = ele.selectionStart;
  const input = ele.value.substring(0, cursor);

  const parser = session ? sessionParser : messageParser;
  const expressions = parser.findExpressions(input);
  const currentExpression = expressions.find(
    (expr: Expression) =>
      expr.start <= cursor && (expr.end > cursor || (expr.end === cursor && !expr.closed))
  );

  if (currentExpression) {
    const includeFunctions = currentExpression.text.indexOf('(') > -1;
    if (includeFunctions) {
      const functionQuery = parser.functionContext(currentExpression.text);
      if (functionQuery) {
        const fns = getFunctions(functions, functionQuery);
        if (fns.length > 0) {
          result.currentFunction = fns[0];
        }
      }
    }

    for (let i = currentExpression.text.length; i >= 0; i--) {
      const curr = currentExpression.text[i];
      if (curr === '@' || curr === '(' || curr === ' ' || curr === ',' || curr === ')' || i === 0) {
        // don't include non-expression chars
        if (curr === '(' || curr === ' ' || curr === ',' || curr === ')' || curr === '@') {
          i++;
        }

        result.query = currentExpression.text.substr(i, currentExpression.text.length - i);

        result.options = [
          ...getCompletions(context, result.query, store.getKeyedAssets(), session),
          ...(includeFunctions ? getFunctions(functions, result.query) : [])
        ];

        return result;
      }
    }
  } else {
    result.options = [];
    result.query = '';
  }
  return result;
};

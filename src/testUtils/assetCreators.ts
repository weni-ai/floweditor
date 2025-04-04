import { determineTypeConfig } from 'components/flow/helpers';
import {
  ActionFormProps,
  LocalizationFormProps,
  RouterFormProps,
} from 'components/flow/props';
import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { DefaultExitNames } from 'components/flow/routers/constants';
import { ResolvedRoutes, resolveRoutes } from 'components/flow/routers/helpers';
import { Methods } from 'components/flow/routers/webhook/helpers';
import {
  DEFAULT_OPERAND,
  DIAL_OPERAND,
  GROUPS_OPERAND,
  SCHEMES_OPERAND,
} from 'components/nodeeditor/constants';
import {
  Operators,
  Types,
  ContactStatus,
  ServiceCall,
} from 'config/interfaces';
import { getTypeConfig, Scheme } from 'config/typeConfigs';
import {
  AnyAction,
  BroadcastMsg,
  CallResthook,
  CallWebhook,
  Case,
  Category,
  ChangeGroups,
  Contact,
  Exit,
  Field,
  Flow,
  FlowNode,
  Group,
  Label,
  OpenTicket,
  PlayAudio,
  RemoveFromGroups,
  Router,
  RouterTypes,
  SayMsg,
  SendEmail,
  SendMsg,
  SetContactChannel,
  SetContactField,
  SetContactLanguage,
  SetContactStatus,
  SetContactProperty,
  SetRunResult,
  StartFlow,
  StartFlowArgs,
  StartFlowExitNames,
  StartSession,
  SwitchRouter,
  TransferAirtime,
  UINode,
  Wait,
  WaitTypes,
  WebhookExitNames,
  HintTypes,
  CallClassifier,
  CallExternalService,
  SendWhatsAppProduct,
  SendWhatsAppMsg,
  CallWeniGPT,
  CallBrain,
  MsgTemplating,
  Classifier,
} from 'flowTypes';
import Localization, { LocalizedObject } from 'services/Localization';
import { Asset, Assets, AssetType, RenderNode } from 'store/flowContext';
import { assetListToMap } from 'store/helpers';
import { EMPTY_TEST_ASSETS } from 'test/utils';
import { mock } from 'testUtils';
import * as utils from 'utils';
import {
  ProductSearchType,
  ProductViewSettings,
} from 'components/flow/routers/whatsapp/sendproduct/SendWhatsAppProductRouterForm';
import {
  FlowData,
  WhatsAppListItem,
} from 'components/flow/actions/whatsapp/sendmsg/SendWhatsAppMsgForm';
import {
  WhatsAppHeaderType,
  WhatsAppInteractionType,
  WhatsAppMessageType,
} from 'components/flow/actions/whatsapp/sendmsg/constants';
import { WhatsAppOrderDetails } from '../components/flow/actions/whatsapp/sendmsg/payments/types';

const { results: groupsResults } = require('test/assets/groups.json');
const languagesResults = require('test/assets/languages.json');
const completions = require('test/assets/completion.json');
mock(utils, 'createUUID', utils.seededUUIDs());

export const createSayMsgAction = ({
  uuid = utils.createUUID(),
  text = 'Welcome to Moviefone!',
  audio_url = null,
}: {
  uuid?: string;
  text?: string;
  audio_url?: string;
} = {}): SayMsg => ({
  type: Types.say_msg,
  uuid,
  text,
  audio_url,
});

export const createPlayAudioAction = ({
  uuid = utils.createUUID(),
  audio_url = '/my_audio.mp3',
}: {
  uuid?: string;
  text?: string;
  audio_url?: string;
} = {}): PlayAudio => ({
  type: Types.play_audio,
  uuid,
  audio_url,
});

export const createSendMsgAction = ({
  uuid = utils.createUUID(),
  text = 'Hey!',
  all_urns = false,
  quick_replies = [],
  templating = null,
  attachments = [],
}: {
  uuid?: string;
  text?: string;
  // tslint:disable-next-line:variable-name
  all_urns?: boolean;
  quick_replies?: string[];
  templating?: MsgTemplating;
  attachments?: string[];
} = {}): SendMsg => ({
  type: Types.send_msg,
  uuid,
  text,
  all_urns,
  quick_replies,
  templating,
  attachments,
});

export const createSendEmailAction = ({
  uuid = utils.createUUID(),
  subject = 'New Sign Up',
  body = '@run.results.name just signed up.',
  addresses = ['jane@example.com'],
}: {
  uuid?: string;
  subject?: string;
  body?: string;
  addresses?: string[];
} = {}): SendEmail => ({
  uuid,
  type: Types.send_email,
  subject,
  body,
  addresses,
});

export const createTransferAirtimeAction = ({
  uuid = utils.createUUID(),
}: {
  uuid?: string;
} = {}): TransferAirtime => ({
  uuid,
  type: Types.transfer_airtime,
  amounts: {
    USD: 1.5,
  },
  result_name: 'Result',
});

export const createCallResthookAction = ({
  uuid = utils.createUUID(),
  resthook = 'my-resthook',
  result_name = 'result',
}: {
  uuid?: string;
  resthook?: string;
  result_name?: string;
} = {}): CallResthook => ({
  uuid,
  type: Types.call_resthook,
  resthook,
  result_name,
});

export const createCallWebhookAction = ({
  uuid = utils.createUUID(),
  url = 'https://www.example.com',
  method = Methods.GET,
  result_name = 'result_name',
}: {
  uuid?: string;
  url?: string;
  method?: Methods;
  result_name?: string;
} = {}): CallWebhook => ({
  uuid,
  type: Types.call_webhook,
  url,
  method,
  result_name,
});

export const createStartSessionAction = ({
  uuid = utils.createUUID(),
  groups = [{ uuid: utils.createUUID(), name: 'Cat Fanciers' }],
  contacts = [
    { uuid: utils.createUUID(), name: 'Norbert Kwizera' },
    { uuid: utils.createUUID(), name: 'Rowan Seymour' },
  ],
  flow = {
    uuid: 'flow_uuid',
    name: 'Flow to Start',
  },
  create_contact = false,
}: {
  uuid?: string;
  groups?: Group[];
  contacts?: Contact[];
  flow?: Flow;
  create_contact?: boolean;
} = {}): StartSession => ({
  uuid,
  groups,
  contacts,
  flow,
  create_contact,
  type: Types.start_session,
});

export const createBroadcastMsgAction = ({
  uuid = utils.createUUID(),
  groups = [
    { uuid: utils.createUUID(), name: 'Cat Fanciers' },
    { uuid: utils.createUUID(), name: 'Cat Facts' },
  ],
  contacts = [
    { uuid: utils.createUUID(), name: 'Kellan Alexander' },
    { uuid: utils.createUUID(), name: 'Norbert Kwizera' },
    { uuid: utils.createUUID(), name: 'Rowan Seymour' },
  ],
  text = 'Hello World',
}: {
  uuid?: string;
  groups?: Group[];
  contacts?: Contact[];
  text?: string;
} = {}): BroadcastMsg => ({
  uuid,
  groups,
  contacts,
  text,
  type: Types.send_broadcast,
});

export const createAddGroupsAction = ({
  uuid = utils.createUUID(),
  groups = groupsResults,
}: { uuid?: string; groups?: Group[] } = {}): ChangeGroups => ({
  uuid,
  type: Types.add_contact_groups,
  groups,
});

export const createRemoveGroupsAction = ({
  uuid = utils.createUUID(),
  groups = groupsResults,
}: { uuid?: string; groups?: Group[] } = {}): RemoveFromGroups => ({
  uuid,
  all_groups: false,
  type: Types.remove_contact_groups,
  groups,
});

export const createStartFlowAction = ({
  uuid = utils.createUUID(),
  flow = {
    name: 'Colors',
    uuid: 'd4a3a01c-1dee-4324-b107-4ac7a21d836f',
  },
}: {
  uuid?: string;
  flow?: {
    name: string;
    uuid: string;
  };
} = {}): StartFlow => ({
  type: Types.enter_flow,
  uuid: 'd4a3a01c-1dee-4324-b107-4ac7a21d836f',
  flow: {
    name: utils.capitalize(flow.name.trim()),
    uuid,
  },
});

export const createSetContactNameAction = ({
  uuid = utils.createUUID(),
  name = 'Jane Goodall',
}: {
  uuid?: string;
  name?: string;
} = {}): SetContactProperty => ({
  uuid,
  name,
  type: Types.set_contact_name,
});

export const createSetContactFieldAction = ({
  uuid = utils.createUUID(),
  field = {
    key: 'age',
    name: 'Age',
  },
  value = '25',
}: {
  uuid?: string;
  field?: Field;
  value?: string;
} = {}): SetContactField => ({
  uuid,
  field,
  value,
  type: Types.set_contact_field,
});

export const createSetContactLanguageAction = ({
  uuid = utils.createUUID(),
  language = 'eng',
}: {
  uuid?: string;
  language?: string;
} = {}): SetContactLanguage => ({
  uuid,
  language,
  type: Types.set_contact_language,
});

export const createSetContactStatusAction = ({
  uuid = utils.createUUID(),
  status = ContactStatus.BLOCKED,
}: {
  uuid?: string;
  status?: ContactStatus;
} = {}): SetContactStatus => ({
  uuid,
  status,
  type: Types.set_contact_status,
});

export const createSetContactChannelAction = ({
  uuid = utils.createUUID(),
  channelName = 'Twilio Channel',
}: {
  uuid?: string;
  channelName?: string;
} = {}): SetContactChannel => ({
  uuid,
  channel: {
    uuid,
    name: channelName,
  },
  type: Types.set_contact_channel,
});

export const createSetRunResultAction = ({
  uuid = utils.createUUID(),
  name = 'Name',
  value = 'Grace',
  category = '',
}: {
  uuid?: string;
  name?: string;
  value?: string;
  category?: string;
} = {}): SetRunResult => ({
  uuid,
  name,
  value,
  category,
  type: Types.set_run_result,
});

export const createSendWhatsAppMsgAction = ({
  uuid = utils.createUUID(),
  text = '',
  attachment = null,
  messageType = WhatsAppMessageType.SIMPLE,
  header_type = WhatsAppHeaderType.MEDIA,
  header_text = '',
  footer = '',
  interaction_type = null,
  button_text = '',
  action_url = '',
  list_items = [],
  quick_replies = [],
  flow_id = '',
  flow_data = {},
  flow_screen = '',
  flow_data_attachment_name_map = {},
  order_details = null,
}: {
  uuid?: string;
  text?: string;
  attachment?: string;
  messageType?: WhatsAppMessageType;
  header_type?: WhatsAppHeaderType;
  header_text?: string;
  footer?: string;
  interaction_type?: WhatsAppInteractionType;
  button_text?: string;
  action_url?: string;
  list_items?: WhatsAppListItem[];
  quick_replies?: string[];
  flow_id?: string;
  flow_data?: FlowData;
  flow_screen?: string;
  flow_data_attachment_name_map?: Record<string, string>;
  order_details?: WhatsAppOrderDetails;
} = {}): SendWhatsAppMsg => ({
  type: Types.send_whatsapp_msg,
  uuid,
  text,
  messageType,
  attachment,
  header_type,
  header_text,
  footer,
  interaction_type,
  button_text,
  action_url,
  list_items,
  quick_replies,
  flow_id,
  flow_data,
  flow_screen,
  flow_data_attachment_name_map,
  order_details,
});

export const createCallWeniGPTAction = ({
  uuid = utils.createUUID(),
  input = 'Hello',
  knowledge_base = 1,
  result_name = 'Result',
}: {
  uuid?: string;
  input?: string;
  knowledge_base?: number;
  result_name?: string;
} = {}): CallWeniGPT => ({
  uuid: uuid,
  type: Types.call_wenigpt,
  input,
  knowledge_base,
  result_name,
});

export const createCallBrainAction = ({
  uuid = utils.createUUID(),
  brainInfo = {
    enabled: true,
    name: 'Dóris',
    occupation: 'Marketing Specialist',
  },
  entry = 'brain entry',
} = {}): CallBrain => ({
  type: Types.call_brain,
  uuid,
  brainInfo,
  entry,
});

export const createCallClassifierAction = ({
  classifier = {
    uuid: 'purrington',
    name: 'Purrington',
  },
  input = '@input',
  result_name = 'Result',
}: {
  classifier?: Classifier;
  input?: string;
  result_name?: string;
} = {}): CallClassifier => ({
  type: Types.call_classifier,
  uuid: utils.createUUID(),
  classifier: classifier,
  input: input,
  result_name: result_name,
});

export const createCallExternalServiceAction = ({
  type = 'chatgpt',
  actions = [],
  serviceUuid = 'dummy uuid',
  serviceCall = {
    value: 'dummy call',
    name: 'dummy call name',
    verboseName: 'dummy call verbose name',
    params: [],
    disableEmptyParams: false,
  },
}: {
  type?: string;
  actions?: any[];
  serviceUuid?: string;
  serviceCall?: ServiceCall;
} = {}): CallExternalService => ({
  type: Types.call_external_service,
  uuid: utils.createUUID(),
  external_service: {
    uuid: serviceUuid,
    name: `${type} dummy service`,
    external_service_type: type,
    actions: actions,
  },
  call: serviceCall,
  params: [],
  result_name: 'Result',
});

export const createWebhookNode = (
  action:
    | CallWebhook
    | CallResthook
    | OpenTicket
    | TransferAirtime
    | CallClassifier
    | CallExternalService
    | SendWhatsAppProduct,
  useCategoryTest: boolean,
) => {
  const { categories, exits } = createCategories([
    WebhookExitNames.Success,
    WebhookExitNames.Failure,
  ]);

  const cases: Case[] = [
    {
      uuid: utils.createUUID(),
      type: useCategoryTest ? Operators.has_category : Operators.has_only_text,
      arguments: [WebhookExitNames.Success],
      category_uuid: categories[0].uuid,
    },
  ];

  let operand = '@results.' + utils.snakify(action.result_name);
  if (!useCategoryTest) {
    operand += '.category';
  }

  return {
    uuid: utils.createUUID(),
    actions: [action],
    router: {
      type: RouterTypes.switch,
      operand: operand,
      cases,
      categories,
      default_category_uuid: categories[categories.length - 1].uuid,
    } as SwitchRouter,
    exits,
  };
};

export const createWebhookRouterNode = (
  headers: { [key: string]: string } = {},
): FlowNode => {
  const action: CallWebhook = {
    uuid: utils.createUUID(),
    headers,
    type: Types.call_webhook,
    url: 'http://www.google.com',
    method: Methods.GET,
    result_name: 'Response',
  };
  return createWebhookNode(action, false);
};

export const createOpenTicketNode = (
  subject: string,
  body: string,
): FlowNode => {
  const action: OpenTicket = {
    uuid: utils.createUUID(),
    type: Types.open_ticket,
    ticketer: {
      name: 'Email (bob@acme.com)',
      uuid: '1165a73a-2ee0-4891-895e-768645194862',
    },
    subject: subject,
    body: body,
    result_name: 'Result',
  };
  return createWebhookNode(action, true);
};

export const createOpenWeniChatsTicketNode = (
  subject: string,
  body: string,
  uuid: string = utils.createUUID(),
): FlowNode => {
  const action: OpenTicket = {
    uuid: utils.createUUID(),
    type: Types.open_ticket,
    ticketer: {
      name: `Weni Chats Sector - ${uuid}`,
      uuid: uuid,
    },
    subject: subject,
    body: body,
    result_name: 'Result',
  };
  return createWebhookNode(action, true);
};

export const createSendWhatsAppProductNode = (
  productViewSettings: ProductViewSettings,
  products?: any[],
  automaticProductSearch?: boolean,
  sendCatalog?: boolean,
  search_type: ProductSearchType = ProductSearchType.Default,
  search_url?: string,
  productSearch?: string,
  seller_id?: string,
  postal_code?: string,
): FlowNode => {
  const action: SendWhatsAppProduct = {
    uuid: utils.createUUID(),
    type: Types.send_msg_catalog,
    productViewSettings,
    products,
    automaticProductSearch,
    sendCatalog,
    search_type,
    search_url,
    seller_id,
    postal_code,
    productSearch,
    result_name: 'Result',
  };
  return createWebhookNode(action, true);
};

export const createCallExternalServiceNode = (
  type: string,
  actions: any[],
  serviceUuid: string,
  serviceCall: ServiceCall,
): FlowNode => {
  const action: CallExternalService = {
    uuid: utils.createUUID(),
    type: Types.call_external_service,
    external_service: {
      uuid: serviceUuid,
      name: `${type} dummy project`,
      external_service_type: type,
      actions: actions,
    },
    call: serviceCall,
    params: [],
    result_name: 'Result',
  };
  return createWebhookNode(action, true);
};

export const getLocalizationFormProps = (
  action: AnyAction,
  lang?: Asset,
  translations?: { [uuid: string]: any },
): LocalizationFormProps => {
  const language = lang || {
    id: 'eng',
    name: 'English',
    type: AssetType.Language,
  };

  const additionalLocalizations: LocalizedObject[] = [];

  if (action.type === Types.send_whatsapp_msg) {
    const sendWppMsgAction = action as SendWhatsAppMsg;
    if (sendWppMsgAction.list_items) {
      sendWppMsgAction.list_items.forEach(item => {
        additionalLocalizations.push(
          Localization.translate(item, language, translations),
        );
      });
    }
  }

  return {
    language,
    onClose: vi.fn(),
    updateLocalizations: vi.fn(),
    issues: [],
    helpArticles: {},
    nodeSettings: {
      originalNode: createRenderNode({
        actions: [action],
        uuid: utils.createUUID(),
        router: null,
        exits: [{ uuid: utils.createUUID() }],
        ui: {
          position: { left: 0, top: 0 },
          type: Types.execute_actions,
        },
      }),
      originalAction: action,
      localizations: [
        Localization.translate(action, language, translations),
        ...additionalLocalizations,
      ],
    },
  };
};

export const getActionFormProps = (action: AnyAction): ActionFormProps => ({
  assetStore: {
    channels: { items: {}, type: AssetType.Channel },
    fields: { items: {}, type: AssetType.Field },
    languages: { items: {}, type: AssetType.Language },
    labels: { items: {}, type: AssetType.Label },
    results: { items: {}, type: AssetType.Result },
    flows: { items: {}, type: AssetType.Flow },
    recipients: {
      items: {},
      type: AssetType.Contact || AssetType.Group || AssetType.URN,
    },
    completion: { items: completions, type: AssetType.Expression },
    whatsapp_flows: { items: {}, type: AssetType.WhatsAppFlow },
  },
  helpArticles: {},
  addAsset: vi.fn(),
  updateAction: vi.fn(),
  onClose: vi.fn(),
  onTypeChange: vi.fn(),
  issues: [],
  typeConfig: getTypeConfig(action.type),
  nodeSettings: {
    originalNode: createRenderNode({
      actions: [action],
      uuid: utils.createUUID(),
      router: null,
      exits: [{ uuid: utils.createUUID() }],
      ui: {
        position: { left: 0, top: 0 },
        type: Types.execute_actions,
      },
    }),
    originalAction: action,
  },
});

export const getRouterFormProps = (
  renderNode: RenderNode,
): RouterFormProps => ({
  helpArticles: {},
  updateRouter: vi.fn(),
  onClose: vi.fn(),
  onTypeChange: vi.fn(),
  issues: [],
  typeConfig: determineTypeConfig({ originalNode: renderNode }),
  assetStore: EMPTY_TEST_ASSETS,
  nodeSettings: {
    originalNode: renderNode,
    originalAction: null,
  },
});

// tslint:disable-next-line:variable-name
export const createCase = ({
  uuid,
  type,
  category_uuid,
  args = [],
}: {
  uuid: string;
  type: Operators;
  category_uuid: string;
  args?: string[];
}) => ({
  uuid,
  type,
  category_uuid,
  arguments: args,
});

export const createExit = ({
  uuid = utils.createUUID(),
  destination_uuid = null,
}: {
  uuid?: string;
  destination_uuid?: string;
} = {}) => ({
  uuid,
  destination_uuid,
});

// tslint:disable-next-line:variable-name
export const createRouter = (result_name?: string): Router => ({
  categories: [],
  type: RouterTypes.switch,
  ...(result_name ? { result_name } : {}),
});

export const createMatchCase = (
  match: string,
  operator: Operators = Operators.has_any_word,
): CaseProps => {
  return {
    uuid: utils.createUUID(),
    categoryName: match,
    valid: true,
    kase: {
      uuid: utils.createUUID(),
      arguments: [match.toLowerCase()],
      type: operator,
      category_uuid: null,
    },
  };
};

export const createEmptyNode = (): FlowNode => {
  return {
    uuid: utils.createUUID(),
    actions: [],
    exits: [],
  };
};

export const createCases = (categories: string[]): CaseProps[] => {
  const cases: CaseProps[] = [];
  categories.forEach((category: string) => {
    cases.push(createMatchCase(category));
  });
  return cases;
};

export const createRoutes = (
  categories: string[],
  operator: Operators = Operators.has_any_word,
  hasTimeout = false,
): ResolvedRoutes => {
  const cases: CaseProps[] = [];
  categories.forEach((category: string) => {
    cases.push(createMatchCase(category, operator));
  });

  return resolveRoutes(cases, hasTimeout, null);
};

export const createWaitRouter = (
  hintType: HintTypes,
  resultName = 'Result Name',
) => {
  const originalNode = createMatchRouter([]);
  originalNode.node.router.wait = {
    type: WaitTypes.msg,
    hint: { type: hintType },
  };
  originalNode.node.router.result_name = resultName;
  return originalNode;
};

export const createMatchRouter = (
  matches: string[],
  operand: string = DEFAULT_OPERAND,
  operator: Operators = Operators.has_any_word,
  resultName = '',
  hasTimeout = false,
): RenderNode => {
  const { exits, categories, cases, timeoutCategory } = createRoutes(
    matches,
    operator,
    hasTimeout,
  );

  const wait: Wait = hasTimeout
    ? {
        type: WaitTypes.msg,
        timeout: { seconds: 60, category_uuid: timeoutCategory },
      }
    : { type: WaitTypes.msg };

  return createRenderNode({
    actions: [],
    exits,
    router: {
      type: RouterTypes.switch,
      operand: operand,
      categories,
      cases,
      wait,
      default_category_uuid: categories[categories.length - 1].uuid,
      result_name: resultName,
    } as SwitchRouter,
    ui: {
      type: Types.wait_for_response,
      position: { left: 0, top: 0 },
    },
  });
};

export const createSchemeRouter = (schemes: Scheme[]): RenderNode => {
  const matchRouter = createMatchRouter(
    schemes.map((scheme: Scheme) => scheme.scheme),
    SCHEMES_OPERAND,
    Operators.has_only_phrase,
  );

  const router = matchRouter.node.router as SwitchRouter;

  // update generated router to be consistent with scheme routers
  delete router['wait'];
  router.cases.forEach((kase: Case) => {
    const category = router.categories.find(
      (category: Category) => category.uuid === kase.category_uuid,
    );
    category.name = schemes.find(
      (scheme: Scheme) => scheme.scheme === kase.arguments[0],
    ).name;
  });

  matchRouter.ui.type = Types.split_by_scheme;

  return matchRouter;
};

export const createDialRouter = (
  phone: string,
  resultName: string,
): RenderNode => {
  const matchRouter = createMatchRouter(
    ['Answered', 'No Answer', 'Busy', 'Failed'],
    DIAL_OPERAND,
    Operators.has_only_text,
    resultName,
    true,
  );

  const router = matchRouter.node.router as SwitchRouter;

  // switch our wait to match a dial router
  router.wait = { type: WaitTypes.dial, phone: phone };

  matchRouter.ui.type = Types.wait_for_dial;

  return matchRouter;
};

export const createSwitchRouter = ({
  cases,
  categories = [],
  operand = '@input',
  wait = null,
  default_category_uuid = null,
  result_name = null,
}: {
  cases: Case[];
  categories: Category[];
  operand?: string;
  wait?: Wait;
  // tslint:disable-next-line:variable-name
  default_category_uuid?: string;
  result_name?: string;
}) => ({
  ...createRouter(result_name),
  cases,
  categories,
  operand,
  wait,
  default_category_uuid,
});

export const createRenderNode = ({
  actions,
  exits,
  uuid = utils.createUUID(),
  router = null,
  ui = {
    position: { left: 0, top: 0 },
    type: Types.split_by_expression,
  },
}: {
  actions: AnyAction[];
  exits: Exit[];
  uuid?: string;
  router?: Router | SwitchRouter;
  ui?: UINode;
}): RenderNode => {
  const renderNode: RenderNode = {
    node: {
      actions,
      exits,
      uuid,
      ...(router ? { router } : ({} as any)),
    },
    ui,
    inboundConnections: {},
  };
  return renderNode;
};

export const createFlowNode = ({
  actions,
  exits,
  uuid = utils.createUUID(),
  router = null,
  wait = null,
}: {
  actions: AnyAction[];
  exits: Exit[];
  uuid?: string;
  router?: Router | SwitchRouter;
  wait?: Wait;
}): FlowNode => ({
  actions,
  exits,
  uuid,
  ...(router ? { router } : ({} as any)),
  ...(wait ? { wait } : ({} as any)),
});

export const createCategories = (
  names: string[],
): { categories: Category[]; exits: Exit[] } => {
  const exits = names.map((cat: string) => {
    return {
      uuid: utils.createUUID(),
      destination_uuid: null,
    };
  });

  const categories = exits.map((ex: Exit, index: number) => {
    return {
      name: names[index],
      uuid: utils.createUUID(),
      exit_uuid: ex.uuid,
    };
  });

  return { exits, categories };
};

export const createRandomNode = (buckets: number): RenderNode => {
  const { categories, exits } = createCategories(
    utils
      .range(0, buckets)
      .map((bucketIdx: number) => `Bucket ${bucketIdx + 1}`),
  );
  return createRenderNode({
    actions: [],
    exits,
    uuid: utils.createUUID(),
    router: {
      type: RouterTypes.random,
      categories,
    },
    ui: { position: { left: 0, top: 0 }, type: Types.split_by_random },
  });
};

export const createSubflowNode = (
  startFlowAction: StartFlow,
  uuid: string = utils.createUUID(),
): RenderNode => {
  const { categories, exits } = createCategories([
    StartFlowExitNames.Complete,
    StartFlowExitNames.Expired,
  ]);

  return createRenderNode({
    actions: [startFlowAction],
    exits,
    uuid,
    router: createSwitchRouter({
      categories,
      cases: [
        createCase({
          uuid: utils.createUUID(),
          type: Operators.has_run_status,
          category_uuid: categories[0].uuid,
          args: [StartFlowArgs.Complete],
        }),
        createCase({
          uuid: utils.createUUID(),
          type: Operators.has_run_status,
          category_uuid: categories[1].uuid,
          args: [StartFlowArgs.Expired],
        }),
      ],
      operand: '@child',
      default_category_uuid: null,
    }),
    ui: { position: { left: 0, top: 0 }, type: Types.split_by_subflow },
  });
};

export const createClassifyRouter = (): RenderNode => {
  const action: CallClassifier = {
    uuid: utils.createUUID(),
    type: Types.call_classifier,
    result_name: 'Result',
    classifier: { uuid: 'purrington', name: 'Purrington' },
    input: '@input',
  };

  return {
    node: createWebhookNode(action, true),
    ui: { position: { left: 0, top: 0 }, type: Types.split_by_intent },
    inboundConnections: {},
  };
};

export const createAirtimeTransferNode = (
  transferAirtimeAction: TransferAirtime,
): RenderNode => {
  return {
    node: createWebhookNode(transferAirtimeAction, true),
    ui: { position: { left: 0, top: 0 }, type: Types.split_by_airtime },
    inboundConnections: {},
  };
};

export const createResthookNode = (
  callResthookAction: CallResthook,
): RenderNode => {
  return {
    node: createWebhookNode(callResthookAction, false),
    ui: { position: { left: 0, top: 0 }, type: Types.split_by_resthook },
    inboundConnections: {},
  };
};

export const createGroupsRouterNode = (
  groups: Group[] = groupsResults,
  uuid: string = utils.createUUID(),
): RenderNode => {
  const exits = groups.map((group, idx) =>
    createExit({
      uuid: utils.createUUID(),
      destination_uuid: null,
    }),
  );

  exits.push({ uuid: utils.createUUID(), destination_uuid: null });

  const categories = groups.map((group, idx) => {
    return {
      name: group.name,
      uuid: utils.createUUID(),
      exit_uuid: exits[0].uuid,
    };
  });

  categories.push({
    name: DefaultExitNames.Other,
    uuid: utils.createUUID(),
    exit_uuid: exits[exits.length - 1].uuid,
  });

  const cases = groups.map((group, idx) =>
    createCase({
      uuid: utils.createUUID(),
      type: Operators.has_group,
      category_uuid: categories[idx].uuid,
      args: [group.uuid],
    }),
  );

  return createRenderNode({
    actions: [],
    exits,
    uuid,
    router: createSwitchRouter({
      categories,
      cases,
      operand: GROUPS_OPERAND,
      default_category_uuid: categories[categories.length - 1].uuid,
    }),
    ui: {
      type: Types.split_by_groups,
      position: { left: 0, top: 0 },
    },
  });
};

export const createContactFieldRouterNode = (
  fields: string[] = ['name', 'age'],
  uuid: string = utils.createUUID(),
): RenderNode => {
  const { categories, exits } = createCategories(fields);

  return createRenderNode({
    actions: [],
    exits,
    uuid,
    router: createSwitchRouter({
      categories,
      cases: [
        createCase({
          uuid: utils.createUUID(),
          type: Operators.has_any_word,
          category_uuid: categories[0].uuid,
        }),
        createCase({
          uuid: utils.createUUID(),
          type: Operators.has_any_word,
          category_uuid: categories[1].uuid,
        }),
      ],
      operand: '@contact',
      default_category_uuid: categories[categories.length - 1].uuid,
    }),
    ui: {
      type: Types.split_by_contact_field,
      position: { left: 0, top: 0 },
      config: {
        operand: {
          id: 'name',
          name: 'Name',
          type: AssetType.ContactProperty,
        },
      },
    },
  });
};

export const getGroupOptions = (groups: Group[] = groupsResults) =>
  groups.map(({ name, uuid }) => ({
    name,
    id: uuid,
  }));

export const getGroups = (sliceAt: number, groups: Group[] = groupsResults) =>
  groups
    .map(({ name, uuid }) => ({
      name,
      id: uuid,
    }))
    .slice(sliceAt);

export const createAddLabelsAction = (labels: Label[]) => ({
  type: Types.add_input_labels,
  uuid: 'aa15ef19-da81-43d0-b6e5-84b47216aeb8',
  labels,
});

export const English = { name: 'English', id: 'eng', type: AssetType.Language };

export const Spanish = { name: 'Spanish', id: 'spa', type: AssetType.Language };

export const SubscribersGroup = {
  id: '489763',
  type: AssetType.Group,
  name: 'Subscriber',
  uuid: '68223118-109f-442a-aed3-7bb3e1eab687',
};

export const ColorFlowAsset = {
  name: 'Favorite Color',
  uuid: '9a93ede6-078f-44c9-ad0a-133793be5d56',
  parent_refs: ['colors'],
};

export const ResthookAsset = {
  resthook: 'new-resthook',
  name: 'new-resthook',
  type: AssetType.Resthook,
};

export const FeedbackLabel = {
  name: 'Feedback',
  id: 'feedback_label',
  type: AssetType.Label,
};

export const languages: Assets = {
  items: assetListToMap(
    languagesResults.results.map((language: any) => language),
  ),
  type: AssetType.Language,
};

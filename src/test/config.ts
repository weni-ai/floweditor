import { FlowTypes } from 'config/interfaces';
import { FlowEditorConfig } from 'flowTypes';

export const config: FlowEditorConfig = {
  flow: 'a4f64f1b-85bc-477e-b706-de313a022979',
  localStorage: true,
  showDownload: true,
  flowType: FlowTypes.MESSAGING,
  mutable: true,
  filters: ['whatsapp', 'airtime', 'resthook', 'classifier', 'ticketer'],
  help: {},
  brand: 'RapidPro',
  endpoints: {
    resthooks: '/assets/resthooks.json',
    flows: '/assets/flows.json',
    globals: '/assets/globals.json',
    groups: '/assets/groups.json',
    fields: '/assets/fields.json',
    recipients: '/assets/recipients.json',
    labels: '/assets/labels.json',
    languages: '/assets/languages.json',
    channels: '/assets/channels.json',
    environment: '/assets/environment.json',
    revisions: '/assets/revisions.json',
    classifiers: '/assets/classifiers.json',
    ticketers: '/assets/ticketers.json',
    attachments: '/assets/attachments.json',
    recents: '/assets/recents.json',
    templates: '/assets/templates.json',
    users: '/assets/users.json',
    topics: '/assets/topics.json',
    editor: '/flow/editor',
    activity: '',
    simulateStart: '',
    simulateResume: '',
    ticketer_queues: '',
    external_services: '/assets/external_services.json',
    external_services_calls: '/assets/external_services_calls.json',
    external_services_calls_base: '',
    completion: '/assets/completion.json',
    knowledgeBases: '/assets/knowledge_bases.json',
    whatsapp_products: '/assets/whatsapp_products.json'
  },
  onChangeLanguage: (code: string, name: string) => {}
};

export default config;

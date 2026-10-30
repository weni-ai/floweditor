import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { config } from 'test/config';

const endpoints = config.endpoints;

export const restHandlers = [
  http.get(endpoints.flows, () => {
    return HttpResponse.json(require('test/assets/flows.json'));
  }),
  http.get(endpoints.groups, () => {
    return HttpResponse.json(require('test/assets/groups.json'));
  }),
  http.get(endpoints.recipients, () => {
    return HttpResponse.json(require('test/assets/contacts.json'));
  }),
  http.get(endpoints.fields, () => {
    return HttpResponse.json(require('test/assets/fields.json'));
  }),
  http.get(endpoints.labels, () => {
    return HttpResponse.json(require('test/assets/labels.json'));
  }),
  http.get(endpoints.revisions, () => {
    return HttpResponse.json(require('test/assets/revisions.json'));
  }),
  http.get(endpoints.external_services_calls, () => {
    return HttpResponse.json(
      require('test/assets/external_services_calls.json'),
    );
  }),
  http.get(endpoints.completion, () => {
    return HttpResponse.json(require('test/assets/completion.json'));
  }),
  http.get(endpoints.users, () => {
    return HttpResponse.json(require('test/assets/users.json'));
  }),
  http.get(endpoints.topics, () => {
    return HttpResponse.json(require('test/assets/topics.json'));
  }),
  http.get(endpoints.knowledgeBases, () => {
    return HttpResponse.json(require('test/assets/knowledge_bases.json'));
  }),
  http.get(endpoints.whatsapp_products, () => {
    return HttpResponse.json(require('test/assets/whatsapp_products.json'));
  }),
  http.get(endpoints.ticketers, () => {
    return HttpResponse.json(require('test/assets/ticketers.json'));
  }),
  http.get(endpoints.ticketer_queues, () => {
    return HttpResponse.json(require('test/assets/ticketer_queues.json'));
  }),
  http.post(endpoints.simulateStart, () => {
    return HttpResponse.json(require('test/assets/simulate_start.json'));
  }),
  http.post(endpoints.simulateResume, () => {
    return HttpResponse.json(require('test/assets/simulate_resume.json'));
  }),
  http.get(endpoints.classifiers, () => {
    return HttpResponse.json(require('test/assets/classifiers.json'));
  }),
  http.get(`${endpoints.revisions}`, () => {
    return HttpResponse.json(require('test/assets/revisions.json'));
  }),
  http.get(`${endpoints.revisions}{/:id}`, () => {
    return HttpResponse.json(require('test/assets/flow_details.json'));
  }),
  http.get(endpoints.activity, () => {
    return HttpResponse.json(require('test/assets/activity.json'));
  }),
  http.get(endpoints.brain, () => {
    return HttpResponse.json(require('test/assets/brain.json'));
  }),
  http.post(endpoints.revisions, () => {
    return HttpResponse.json(require('test/assets/save_revisions.json'));
  }),
  http.post(endpoints.media_urls as string, async ({ request }) => {
    const body = (await request.json()) as { urls: string[] };
    const urls = body.urls.reduce(
      (signed: { [url: string]: string }, url: string) => {
        signed[url] = url + '?X-Amz-Signature=test';
        return signed;
      },
      {},
    );
    return HttpResponse.json({ urls, expires_in: 3600 });
  }),
];

// The defaults must be the initial handlers: resetHandlers() with no
// arguments restores only those, so tests can safely call server.use(...)
export const server = setupServer(...restHandlers);

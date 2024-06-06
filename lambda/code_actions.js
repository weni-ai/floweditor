const { getOpts } = require('./utils');
const codeActions = [
  {
    id: '5e97005b-bd2f-402b-b007-671b965de828',
    name: 'process specific dummy data',
    created_on: '2019-04-02T22:14:31.569739Z',
    modified_on: '2019-04-02T22:14:31.569739Z',
  },
  {
    id: 'a4f93f98-f63e-49a7-9dad-c13d621b35bc',
    name: 'save data to external db',
    created_on: '2019-04-02T22:14:31.569739Z',
    modified_on: '2019-04-02T22:14:31.569739Z',
  },
  {
    id: '973e0258-8ca8-4413-993c-05d05eb89e59',
    name: 'call specific API',
    created_on: '2019-04-02T22:14:31.569739Z',
    modified_on: '2019-04-02T22:14:31.569739Z',
  },
];

exports.handler = (evt, ctx, cb) =>
  cb(null, getOpts({ body: JSON.stringify({ results: codeActions }) }));

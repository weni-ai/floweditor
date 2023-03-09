/* eslint-disable @typescript-eslint/camelcase */
const external_services = [
  {
    uuid: '4b154b06-5ecd-43d9-afca-39738e6859d7',
    name: 'Omie dummy project',
    external_service_type: 'omie',
    created_on: '2019-10-15T20:07:58.529130Z'
  },
  {
    uuid: '5b154b06-5ecd-43d9-afca-39738e6859d7',
    name: 'Omie dummy project 2',
    external_service_type: 'omie',
    created_on: '2020-10-15T20:07:58.529130Z'
  }
];

const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
  cb(null, getOpts({ body: JSON.stringify({ results: external_services }) }));

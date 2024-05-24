/* eslint-disable @typescript-eslint/camelcase */
const whatsapp_products = [
  {
    facebook_product_id: '7417461401663795',
    title: 'Product 5',
    created_on: '2021-09-01T01:06:39.178493Z',
  },
  {
    facebook_product_id: '8417461401663796',
    title: 'Product 6',
    created_on: '2021-09-01T01:06:39.178493Z',
  },
  {
    facebook_product_id: '9417461401663797',
    title: 'Product 7',
    created_on: '2021-09-01T01:06:39.178493Z',
  },
  {
    facebook_product_id: '5417461401663798',
    title: 'Product 8',
    created_on: '2021-09-01T01:06:39.178493Z',
  },
];

const whatsapp_products2 = [];
whatsapp_products.forEach(item => {
  for (let index = 0; index < 25; index++) {
    whatsapp_products2.push(item);
  }
});

const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
  cb(
    null,
    getOpts({
      body: JSON.stringify({
        next: null,
        results: whatsapp_products2,
      }),
    }),
  );

// <reference types="vitest" />
/* eslint-disable no-redeclare */
/* eslint-disable no-undef */
import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import { cleanup } from '@testing-library/react';
import * as jestMatchers from '@testing-library/jest-dom/matchers';
import matchers from 'testUtils/matchers';
import { server } from 'test/mswServer';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as utils from 'utils';
import { mock } from 'testUtils';
import { Console } from 'console';

// The setup file already loads MediaUrlSigner through testUtils, so a
// vi.mock in a test file would come too late to replace Sentry for it.
// Mocking here makes captureException the same spy for every test file.
vi.mock('@sentry/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@sentry/react')>()),
  captureException: vi.fn(),
}));

expect.extend(jestMatchers);

expect.extend(matchers);

mock(utils, 'createUUID', utils.seededUUIDs());

// mock navigator clipboard
const writeText = vi.fn();

Object.assign(navigator, {
  clipboard: {
    writeText,
  },
});

const seededRandom = new utils.SeededRandom(1);
mock(Math, 'random', () => seededRandom.random());

// Configure Enzyme adapter
configure({ adapter: new Adapter() });

global.console = new Console(process.stderr, process.stderr);

// tslint:disable-next-line:ban-types
(global as any).requestAnimationFrame = (callback: Function) => {
  setTimeout(callback, 0);
};

const MockIntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal(`IntersectionObserver`, MockIntersectionObserver);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

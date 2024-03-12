import { SearchBar, SearchStoreProps } from './SearchBar';
import * as React from 'react';
import { composeComponentTestUtils } from 'testUtils';
import { render } from 'test/utils';

const nodes = {
  '11f18b66-37ce-43f0-a74e-4638eb7e5921': {
    node: {
      uuid: '11f18b66-37ce-43f0-a74e-4638eb7e5921',
      actions: [
        {
          attachments: [],
          text: 'teste',
          type: 'send_msg',
          quick_replies: [],
          uuid: 'bbb43f9d-d254-44ef-a9d1-7a3e392f972c'
        }
      ],
      exits: [
        {
          uuid: '07e2e3d2-d7cb-4905-93b8-50598ec4fdf3',
          destination_uuid: 'f5804ae2-2103-4b55-b17a-129b359d39a2'
        }
      ]
    },
    ui: {
      position: {
        left: 160,
        top: 100
      },
      type: 'execute_actions'
    },
    inboundConnections: {}
  },
  'f5804ae2-2103-4b55-b17a-129b359d39a2': {
    node: {
      uuid: 'f5804ae2-2103-4b55-b17a-129b359d39a2',
      actions: [
        {
          attachments: [],
          text: 'teste',
          type: 'send_msg',
          quick_replies: [],
          uuid: '77e4f770-42ad-4573-95cf-f7d96a020dd9'
        }
      ],
      exits: [
        {
          uuid: '72e44e5c-777e-41de-a35c-c52f418d6c6c',
          destination_uuid: null
        }
      ]
    },
    ui: {
      position: {
        left: 129,
        top: 409
      },
      type: 'execute_actions'
    },
    inboundConnections: {
      '07e2e3d2-d7cb-4905-93b8-50598ec4fdf3': '11f18b66-37ce-43f0-a74e-4638eb7e5921'
    }
  }
};

const filteredNode = [
  {
    data: {
      inboundConnections: {},
      node: {
        actions: [
          {
            attachments: [],
            quick_replies: [],
            text: 'teste',
            type: 'send_msg',
            uuid: 'bbb43f9d-d254-44ef-a9d1-7a3e392f972c'
          }
        ],
        exits: [
          {
            destination_uuid: 'f5804ae2-2103-4b55-b17a-129b359d39a2',
            uuid: '07e2e3d2-d7cb-4905-93b8-50598ec4fdf3'
          }
        ],
        uuid: '11f18b66-37ce-43f0-a74e-4638eb7e5921'
      },
      ui: {
        position: {
          left: 160,
          top: 100
        },
        type: 'execute_actions'
      }
    },
    uuid: '11f18b66-37ce-43f0-a74e-4638eb7e5921'
  },
  {
    data: {
      inboundConnections: {
        '07e2e3d2-d7cb-4905-93b8-50598ec4fdf3': '11f18b66-37ce-43f0-a74e-4638eb7e5921'
      },
      node: {
        actions: [
          {
            attachments: [],
            quick_replies: [],
            text: 'teste',
            type: 'send_msg',
            uuid: '77e4f770-42ad-4573-95cf-f7d96a020dd9'
          }
        ],
        exits: [
          {
            destination_uuid: null,
            uuid: '72e44e5c-777e-41de-a35c-c52f418d6c6c'
          }
        ],
        uuid: 'f5804ae2-2103-4b55-b17a-129b359d39a2'
      },
      ui: {
        position: {
          left: 129,
          top: 409
        },
        type: 'execute_actions'
      }
    },
    uuid: 'f5804ae2-2103-4b55-b17a-129b359d39a2'
  }
];

const baseProps: SearchStoreProps = {
  search: {
    active: true,
    value: 'teste',
    selected: 0,
    nodes: [
      {
        uuid: 'f5804ae2-2103-4b55-b17a-129b359d39a2',
        data: {
          node: {
            uuid: 'f5804ae2-2103-4b55-b17a-129b359d39a2',
            actions: [
              {
                attachments: [],
                text: 'teste',
                type: 'send_msg',
                quick_replies: [],
                uuid: '77e4f770-42ad-4573-95cf-f7d96a020dd9'
              }
            ],
            exits: [
              {
                uuid: '72e44e5c-777e-41de-a35c-c52f418d6c6c',
                destination_uuid: null
              }
            ]
          },
          ui: {
            position: {
              left: 129,
              top: 409
            },
            type: 'execute_actions'
          },
          inboundConnections: {
            '07e2e3d2-d7cb-4905-93b8-50598ec4fdf3': '11f18b66-37ce-43f0-a74e-4638eb7e5921'
          }
        }
      }
    ]
  },
  nodes: nodes,
  handleSearchChange: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(SearchBar, baseProps);

describe(SearchBar.name, () => {
  it('should render searchbar', () => {
    const { baseElement } = render(<SearchBar {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });
  describe('getAllNodes()', () => {
    it('should call getAllNodes', () => {
      const { instance } = setup(true);
      const spy = spyOn('getAllNodes');
      expect(spy).not.toHaveBeenCalled();
      instance.getAllNodes();
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should return filtered nodes', () => {
      const { instance } = setup(true);
      const response = instance.getAllNodes();
      expect(response).toEqual(filteredNode);
    });
  });
  describe('findNodes()', () => {
    it('should call findNodes', () => {
      const { instance } = setup(true);
      const spy = spyOn('findNodes');
      expect(spy).not.toHaveBeenCalled();
      instance.findNodes('teste');
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should return found nodes', () => {
      const { instance } = setup(true);
      const response = instance.findNodes('teste');
      expect(response).toEqual([]);
    });
  });
  describe('dragBackground()', () => {
    it('should call dragBackground', () => {
      const { instance } = setup(true);
      const spy = spyOn('dragBackground');
      expect(spy).not.toHaveBeenCalled();
      instance.dragBackground();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
  describe('toggleMoveSelected()', () => {
    it('should call toggleMoveSelected', () => {
      const { instance } = setup(true);
      const spy = spyOn('toggleMoveSelected');
      expect(spy).not.toHaveBeenCalled();
      instance.toggleMoveSelected('up');
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should call dragBackground', () => {
      const { instance } = setup(true);
      const spy = spyOn('dragBackground');
      expect(spy).toHaveBeenCalledTimes(2);
      instance.toggleMoveSelected('up');
      expect(spy).toHaveBeenCalledTimes(3);
    });
    it('should set search', () => {
      const { instance, props } = setup(true);
      instance.toggleMoveSelected('down');
      expect(props.search).not.toEqual({});
    });
  });
  describe('closeSearch()', () => {
    it('should call closeSearch', () => {
      const { instance } = setup(true);
      const spy = spyOn('closeSearch');
      expect(spy).not.toHaveBeenCalled();
      instance.closeSearch();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});

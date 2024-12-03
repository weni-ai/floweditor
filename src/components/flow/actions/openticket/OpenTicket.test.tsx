import * as React from 'react';
import { render, screen } from '@testing-library/react';
import OpenTicketComp from './OpenTicket';
import { Types } from 'config/interfaces';

const mockContext = {
  config: {
    brand: 'MyBrand',
  },
};

const ConfigContext = React.createContext(mockContext);

describe('OpenTicketComp', () => {
  it('should render subject if provided', () => {
    const props = {
      ticketer: { name: 'John Doe', uuid: '1234' },
      subject: 'Test Subject',
      body: 'This is the body',
      result_name: 'Result Name',
      type: Types.open_ticket,
      uuid: '5678',
    };

    render(
      <ConfigContext.Provider value={mockContext}>
        <OpenTicketComp {...props} />
      </ConfigContext.Provider>,
    );

    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('should render topic name if subject is not provided', () => {
    const props = {
      ticketer: { name: 'John Doe', uuid: '1234' },
      topic: { name: 'Test Topic', uuid: '5678' },
      body: 'This is the body',
      result_name: 'Result Name',
      type: Types.open_ticket,
      uuid: '5678',
    };

    render(
      <ConfigContext.Provider value={mockContext}>
        <OpenTicketComp {...props} />
      </ConfigContext.Provider>,
    );

    expect(screen.getByText('Test Topic')).toBeInTheDocument();
  });

  it('should display ticketer name if brand is not present in ticketer name', () => {
    const props = {
      context: {
        config: {
          brand: 'MyBrand',
        },
      },
      ticketer: { name: 'Another Brand Support', uuid: '1234' },
      body: 'This is the body',
      result_name: 'Result Name',
      type: Types.open_ticket,
      uuid: '5678',
    };

    render(
      <ConfigContext.Provider value={mockContext}>
        <OpenTicketComp {...props} />
      </ConfigContext.Provider>,
    );

    expect(screen.getByText(/Another Brand Support/)).toBeInTheDocument();
  });

  // it('should not display ticketer name if brand is in ticketer name', () => {
  //   const props = {
  //     context: {
  //       config: {
  //         brand: 'MyBrand',
  //       },
  //     },
  //     ticketer: { name: 'MyBrand Support', uuid: '1234' },
  //     body: 'This is the body',
  //     result_name: 'Result Name',
  //     type: Types.open_ticket,
  //     uuid: '5678',
  //   };

  //   render(
  //     <ConfigContext.Provider value={mockContext}>
  //       <OpenTicketComp {...props} />
  //     </ConfigContext.Provider>,
  //   );

  //   expect(screen.queryByText(/Using/)).not.toBeInTheDocument();
  // });
});

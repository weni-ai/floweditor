import * as React from 'react';
import { OpenTicket } from 'flowTypes';
import { fakePropType } from 'config/ConfigProvider';

const OpenTicketComp: React.SFC<OpenTicket> = (
  { ticketer, subject, topic }: OpenTicket,
  context: any,
): JSX.Element => {
  const brand =
    context && context.config && 'brand' in context.config
      ? context.config.brand
      : null;
  const showTicketer = brand ? ticketer.name.indexOf(brand) === -1 : true;
  return (
    <div style={{ textAlign: 'center' }}>
      <div>{subject ? subject : topic ? topic.name : null}</div>
      {showTicketer ? (
        <div style={{ fontSize: '80%' }}>
          Using aaaa {JSON.stringify(context)}{' '}
          <span style={{ fontWeight: 400 }}>{ticketer.name}</span>
        </div>
      ) : null}
    </div>
  );
};

OpenTicketComp.contextTypes = {
  config: fakePropType,
};

export default OpenTicketComp;

import { SendWhatsAppMsg } from 'flowTypes';
import * as React from 'react';

import styles from './SendWhatsAppMsg.module.scss';
import Pill from '../../../../pill/Pill';

const SendWhatsAppMsgComp: React.FunctionComponent<SendWhatsAppMsg> = (
  action: SendWhatsAppMsg
): JSX.Element => {
  let replies = null;
  let items = null;

  let quickReplies = action.quick_replies || [];
  if (quickReplies.length > 0) {
    replies = (
      <div className={styles.quick_replies}>
        {quickReplies.map(reply => (
          <Pill maxLength={20} advanced={true} key={action.uuid + reply} text={reply} disabled />
        ))}
      </div>
    );
  }

  let listItems = action.list_items || [];
  if (listItems.length > 0) {
    items = (
      <div className={styles.list_items}>
        {listItems.map(item => (
          <Pill
            maxLength={20}
            advanced={true}
            key={action.uuid + item.title}
            text={item.title}
            disabled
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div>
        {action.text &&
          action.text.split(/\r?\n/).map((line: string, idx: number) => (
            <div key={action.uuid + idx} className={styles.line}>
              {line}
            </div>
          ))}

        {action.attachment ? <div className={`${styles.attachment} fe-paperclip`} /> : null}
      </div>

      <div className={replies ? styles.summary : ''}>{replies}</div>
      <div className={items ? styles.summary : ''}>{items}</div>
    </>
  );
};

export default SendWhatsAppMsgComp;

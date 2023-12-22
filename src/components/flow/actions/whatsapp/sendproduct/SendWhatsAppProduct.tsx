import { SendWhatsAppProduct } from 'flowTypes';
import * as React from 'react';

import styles from './SendWhatsAppProduct.module.scss';
import i18n from 'config/i18n';

const SendWhatsAppProductComp: React.FunctionComponent<SendWhatsAppProduct> = (
  action: SendWhatsAppProduct
): JSX.Element => {
  return (
    <>
      <div className={styles.icons_wrapper}>
        <span className={`${styles.icon} material-symbols-outlined`}>storefront</span>
        {action.automaticProductSearch ? (
          <span>{i18n.t('actions.send_msg_catalog.automatic_sending', 'Automatic sending')}</span>
        ) : action.sendCatalog ? (
          <span>{i18n.t('actions.send_msg_catalog.complete_catalog', 'Complete catalog')}</span>
        ) : (
          <span>
            {action.products.length === 1
              ? i18n.t('actions.send_msg_catalog.manual_sending', {
                  count: action.products.length
                })
              : action.products.length <= 3
              ? i18n.t('actions.send_msg_catalog.manual_sending_plural', {
                  count: action.products.length
                })
              : i18n.t('actions.send_msg_catalog.manual_sending_multiple')}
          </span>
        )}
      </div>
    </>
  );
};

export default SendWhatsAppProductComp;

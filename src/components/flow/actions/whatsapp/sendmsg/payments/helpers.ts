import {
  OrderDetailsSectionState,
  OrderDetailsSectionProps,
} from 'components/flow/actions/whatsapp/sendmsg/payments/OrderDetailsSection';
import {
  WhatsAppOrderBasePaymentSettingsTypes,
  WhatsAppOrderDetails,
} from 'components/flow/actions/whatsapp/sendmsg/payments/types';

export const propsToState = (
  props: OrderDetailsSectionProps,
): OrderDetailsSectionState => {
  const orderDetails = props && props.orderDetails;
  if (orderDetails) {
    const paymentSettings = orderDetails.paymentSettings;
    return {
      activeTab: 0,
      referenceID: {
        value: orderDetails.referenceID,
      },
      items: {
        value: orderDetails.items,
      },
      taxValue: {
        value: orderDetails.tax.value,
      },
      taxDescription: {
        value: orderDetails.tax.description,
      },
      shippingValue: {
        value: orderDetails.shipping.value,
      },
      shippingDescription: {
        value: orderDetails.shipping.description,
      },
      discountValue: {
        value: orderDetails.discount.value,
      },
      discountDescription: {
        value: orderDetails.discount.description,
      },
      discountProgramName: {
        value: orderDetails.discount.programName,
      },
      paymentType: {
        value: paymentSettings.type,
      },
      paymentLink: {
        value: paymentSettings.paymentLink,
      },
      pixConfigKey: {
        value: paymentSettings.pixConfig ? paymentSettings.pixConfig.key : '',
      },
      pixConfigKeyType: {
        value: paymentSettings.pixConfig
          ? paymentSettings.pixConfig.keyType
          : '',
      },
      pixConfigMerchantName: {
        value: paymentSettings.pixConfig
          ? paymentSettings.pixConfig.merchantName
          : '',
      },
      pixConfigCode: {
        value: paymentSettings.pixConfig ? paymentSettings.pixConfig.code : '',
      },
      valid: true,
    };
  }

  return {
    activeTab: 0,
    referenceID: {
      value: '',
    },
    items: {
      value: '',
    },
    taxValue: {
      value: '0',
    },
    taxDescription: {
      value: '',
    },
    shippingValue: {
      value: '',
    },
    shippingDescription: {
      value: '',
    },
    discountValue: {
      value: '',
    },
    discountDescription: {
      value: '',
    },
    discountProgramName: {
      value: '',
    },
    paymentType: {
      value: 'physical-goods',
    },
    paymentLink: {
      value: '',
    },
    pixConfigKey: {
      value: '',
    },
    pixConfigKeyType: {
      value: '',
    },
    pixConfigMerchantName: {
      value: '',
    },
    pixConfigCode: {
      value: '',
    },
    valid: true,
  };
};

export const stateToProps = (
  state: OrderDetailsSectionState,
): WhatsAppOrderDetails => {
  return {
    referenceID: state.referenceID.value,
    items: state.items.value,
    tax: {
      value: state.taxValue.value,
      description: state.taxDescription.value,
    },
    shipping: {
      value: state.shippingValue.value,
      description: state.shippingDescription.value,
    },
    discount: {
      value: state.discountValue.value,
      description: state.discountDescription.value,
      programName: state.discountProgramName.value,
    },
    paymentSettings: {
      type: state.paymentType.value as WhatsAppOrderBasePaymentSettingsTypes,
      paymentLink: state.paymentLink.value,
      pixConfig: {
        key: state.pixConfigKey.value,
        keyType: state.pixConfigKeyType.value,
        merchantName: state.pixConfigMerchantName.value,
        code: state.pixConfigCode.value,
      },
    },
  };
};

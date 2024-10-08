export interface WhatsAppOrderAmount {
  value: string;
  description?: string;
}

export interface WhatsAppOrderDiscount {
  value: string;
  description?: string;
  programName?: string;
}

export interface WhatsAppOrderPixConfig {
  key: string;
  keyType: string;
  merchantName: string;
  code: string;
}

export type WhatsAppOrderBasePaymentSettingsTypes =
  | 'physical-goods'
  | 'digital-goods';

export interface WhatsAppOrderPaymentSettings {
  type: WhatsAppOrderBasePaymentSettingsTypes;
  paymentLink?: string;
  pixConfig?: WhatsAppOrderPixConfig;
}

export interface WhatsAppOrderDetails {
  referenceID: string;
  items: string;
  tax: WhatsAppOrderAmount;
  shipping: WhatsAppOrderAmount;
  discount: WhatsAppOrderDiscount;
  paymentSettings: WhatsAppOrderPaymentSettings;
}

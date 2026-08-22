/**
 * Settings are split on a hard security boundary:
 *
 *  - PUBLIC settings (chat support) render on the storefront and may be
 *    returned to any client.
 *  - SECRET settings (payment + courier credentials) are admin-only and must
 *    NEVER be returned to a non-admin caller or rendered on the storefront.
 */

export type ChatSupportSettings = {
  activePlatform: "facebook" | "whatsapp" | "both" | "none";
  facebookUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
};

export type BkashSettings = {
  appKey: string;
  secretKey: string;
  username: string;
  password: string;
  isEnabled: boolean;
  isCoDEnabled: boolean;
};

export type DeliverySettings = {
  activeService: "pathao" | "steadfast" | "none";
  pathaoStoreId: string;
  pathaoClientId: string;
  pathaoClientSecret: string;
  pathaoUsername: string;
  pathaoPassword: string;
  steadfastApiKey: string;
  steadfastSecretKey: string;
};

/** The subset of payment config the storefront checkout is allowed to know. */
export type PublicPaymentOptions = {
  isBkashEnabled: boolean;
  isCoDEnabled: boolean;
};

export const SETTING_KEYS = {
  chatSupport: "chat_support",
  bkashMerchant: "bkash_merchant",
  deliveryService: "delivery_service",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const DEFAULT_CHAT_SUPPORT: ChatSupportSettings = {
  activePlatform: "facebook",
  facebookUrl: "https://www.facebook.com/MasterMart007",
  whatsappNumber: "",
  whatsappMessage: "",
};

export const DEFAULT_BKASH: BkashSettings = {
  appKey: "",
  secretKey: "",
  username: "",
  password: "",
  isEnabled: false,
  isCoDEnabled: true,
};

export const DEFAULT_DELIVERY: DeliverySettings = {
  activeService: "none",
  pathaoStoreId: "",
  pathaoClientId: "",
  pathaoClientSecret: "",
  pathaoUsername: "",
  pathaoPassword: "",
  steadfastApiKey: "",
  steadfastSecretKey: "",
};

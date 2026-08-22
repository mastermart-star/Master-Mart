import * as z from "zod";

export const chatSupportSchema = z.object({
  activePlatform: z.enum(["facebook", "whatsapp", "both", "none"]),
  facebookUrl: z.string().max(300),
  whatsappNumber: z.string().max(20),
  whatsappMessage: z.string().max(300),
});

export const bkashSchema = z.object({
  appKey: z.string().max(200),
  secretKey: z.string().max(200),
  username: z.string().max(200),
  password: z.string().max(200),
  isEnabled: z.boolean(),
  isCoDEnabled: z.boolean(),
});

export const deliverySchema = z.object({
  activeService: z.enum(["pathao", "steadfast", "none"]),
  pathaoStoreId: z.string().max(200),
  pathaoClientId: z.string().max(200),
  pathaoClientSecret: z.string().max(200),
  pathaoUsername: z.string().max(200),
  pathaoPassword: z.string().max(200),
  steadfastApiKey: z.string().max(200),
  steadfastSecretKey: z.string().max(200),
});

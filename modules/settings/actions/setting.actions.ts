"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/core/db/connect";
import { ok, fail, type ActionResult } from "@/core/types";
import { requireRole } from "@/lib/auth-guards";
import { SettingModel } from "../models/setting.model";
import {
  bkashSchema,
  chatSupportSchema,
  deliverySchema,
} from "../schemas/setting.schema";
import {
  DEFAULT_BKASH,
  DEFAULT_CHAT_SUPPORT,
  DEFAULT_DELIVERY,
  SETTING_KEYS,
  type BkashSettings,
  type ChatSupportSettings,
  type DeliverySettings,
  type PublicPaymentOptions,
} from "../types/setting.types";

async function readSetting<T>(key: string, fallback: T): Promise<T> {
  await connectDB();
  const doc = await SettingModel.findOne({ key }).lean();
  if (!doc) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(doc.value) as T) };
  } catch {
    return fallback;
  }
}

async function writeSetting(key: string, value: unknown): Promise<void> {
  await connectDB();
  await SettingModel.updateOne(
    { key },
    { $set: { value: JSON.stringify(value) } },
    { upsert: true }
  );
}

// The chat bubble renders inside the public layout, so every prerendered
// public page bakes it in. Invalidate them all when it changes.
function revalidatePublicSurface() {
  revalidatePath("/");
  revalidatePath("/(public)/products/[slug]", "page");
  revalidatePath("/(public)/track/[orderCode]", "page");
  revalidatePath("/admin/settings");
}

// ── PUBLIC reads (safe subset only) ─────────────────────────────────────────

/** Storefront chat bubble config. Contains no secrets by design. */
export async function getChatSupportSettings(): Promise<ChatSupportSettings> {
  return readSetting(SETTING_KEYS.chatSupport, DEFAULT_CHAT_SUPPORT);
}

/** What checkout may know about payments — booleans only, never credentials. */
export async function getPublicPaymentOptions(): Promise<PublicPaymentOptions> {
  const bkash = await readSetting(SETTING_KEYS.bkashMerchant, DEFAULT_BKASH);
  return { isBkashEnabled: bkash.isEnabled, isCoDEnabled: bkash.isCoDEnabled };
}

// ── ADMIN reads (full payloads including credentials) ───────────────────────

export async function getBkashSettings(): Promise<BkashSettings> {
  await requireRole("admin");
  return readSetting(SETTING_KEYS.bkashMerchant, DEFAULT_BKASH);
}

export async function getDeliverySettings(): Promise<DeliverySettings> {
  await requireRole("admin");
  return readSetting(SETTING_KEYS.deliveryService, DEFAULT_DELIVERY);
}

export async function getChatSupportSettingsAdmin(): Promise<ChatSupportSettings> {
  await requireRole("admin");
  return readSetting(SETTING_KEYS.chatSupport, DEFAULT_CHAT_SUPPORT);
}

// ── ADMIN mutations ─────────────────────────────────────────────────────────

export async function updateChatSupportSettings(
  input: unknown
): Promise<ActionResult<ChatSupportSettings>> {
  try {
    await requireRole("admin");
    const data = chatSupportSchema.parse(input);
    await writeSetting(SETTING_KEYS.chatSupport, data);
    revalidatePublicSurface();
    return ok(data);
  } catch (error) {
    return fail(error, "Failed to save chat support settings");
  }
}

export async function updateBkashSettings(
  input: unknown
): Promise<ActionResult<BkashSettings>> {
  try {
    await requireRole("admin");
    const data = bkashSchema.parse(input);
    await writeSetting(SETTING_KEYS.bkashMerchant, data);
    revalidatePublicSurface(); // checkout payment options may have changed
    return ok(data);
  } catch (error) {
    return fail(error, "Failed to save bKash settings");
  }
}

export async function updateDeliverySettings(
  input: unknown
): Promise<ActionResult<DeliverySettings>> {
  try {
    await requireRole("admin");
    const data = deliverySchema.parse(input);
    await writeSetting(SETTING_KEYS.deliveryService, data);
    revalidatePath("/admin/settings");
    return ok(data);
  } catch (error) {
    return fail(error, "Failed to save delivery settings");
  }
}

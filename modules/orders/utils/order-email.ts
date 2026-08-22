import "server-only";
import { siteConfig, phoneDisplay } from "@/core/config";
import { sendMail } from "@/lib/mailer";
import type { Order } from "../types/order.types";

const tk = siteConfig.commerce.currencySymbol;

function buildInvoiceHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (i) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: left;">
        <strong>${i.nameEn}</strong><br/>
        <span style="color:#64748b; font-size:12px;">${i.nameBn}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${tk}${i.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${tk}${i.price * i.quantity}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #059669; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${siteConfig.name}</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <h3 style="margin-top: 0; color: #0f172a;">অর্ডার বিবরণী (Order Invoice)</h3>
        <p style="color: #475569; font-size: 14px;">
          প্রিয় <strong>${order.customerName || "গ্রাহক"}</strong>, ${siteConfig.nameBn} থেকে কেনাকাটা করার জন্য ধন্যবাদ।
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8fafc; color: #1e293b;">
              <th style="padding: 10px; text-align: left;">পণ্য (Product)</th>
              <th style="padding: 10px; text-align: center;">মূল্য (Price)</th>
              <th style="padding: 10px; text-align: center;">পরিমাণ (Qty)</th>
              <th style="padding: 10px; text-align: right;">মোট (Total)</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align: right; margin-bottom: 25px; line-height: 1.6; font-size: 14px; color: #334155;">
          <div>উপ-মোট (Subtotal): <strong>${tk}${order.subtotal}</strong></div>
          <div>ডেলিভারি চার্জ (Delivery): <strong>${tk}${order.deliveryFee}</strong></div>
          <div style="font-size: 18px; color: #059669; margin-top: 5px;">সর্বমোট (Grand Total): <strong>${tk}${order.total}</strong></div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 13px; color: #334155; margin-bottom: 20px;">
          <strong>ডেলিভারি ঠিকানা (Shipping Address):</strong><br/>
          নাম: ${order.customerName}<br/>
          ফোন: ${order.customerPhone}<br/>
          ঠিকানা: ${order.customerAddress}<br/>
          পেমেন্ট মাধ্যম: ${order.paymentMethod.toUpperCase()}<br/>
          পেমেন্ট স্ট্যাটাস: <span style="color: ${order.paymentStatus === "success" ? "#16a34a" : "#ea580c"}; font-weight: bold;">${order.paymentStatus.toUpperCase()}</span>
        </div>
        ${
          order.courierTrackingId
            ? `
          <div style="border: 2px dashed #059669; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0 0 5px 0; color: #059669; font-weight: bold;">📦 Steadfast Courier Dispatch</p>
            <p style="margin: 0; font-size: 14px;">ট্র্যাকিং আইডি: <strong>${order.courierTrackingId}</strong></p>
            ${order.courierTrackingUrl ? `<a href="${order.courierTrackingUrl}" style="display: inline-block; margin-top: 10px; background-color: #059669; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px;">অনলাইন ডেলিভারি ট্র্যাকিং করুন</a>` : ""}
          </div>`
            : ""
        }
        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          এটি একটি স্বয়ংক্রিয়ভাবে জেনারেট হওয়া ইনভয়েস। যোগাযোগ: ${siteConfig.contact.email} | ${phoneDisplay}
        </p>
      </div>
    </div>
  `;
}

/** Fire-and-forget order notification — never throws. */
export async function sendOrderEmail(order: Order): Promise<void> {
  if (!order.customerEmail) {
    console.log(`[Email Notifier] Order ${order.orderCode}: no customer email, skipped.`);
    return;
  }
  await sendMail({
    to: order.customerEmail,
    subject: `🛒 ${siteConfig.name} - Order Confirmed! (Invoice #${order.orderCode})`,
    html: buildInvoiceHtml(order),
  });
}

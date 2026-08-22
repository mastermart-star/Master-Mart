import "server-only";
import { phoneDisplay, siteConfig } from "@/core/config";
import type { Order } from "../types/order.types";

const tk = siteConfig.commerce.currencySymbol;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Printable HTML receipt — served by /api/invoice/[orderCode]. */
export function buildPrintableInvoice(order: Order): string {
  const itemsRows = order.items
    .map(
      (i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 500;">
          ${escapeHtml(i.nameEn)}<br/>
          <small style="color: #64748b;">${escapeHtml(i.nameBn)}</small>
        </td>
        <td style="padding: 12px; text-align: center;">${tk}${i.price}</td>
        <td style="padding: 12px; text-align: center;">${i.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">${tk}${i.price * i.quantity}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${escapeHtml(order.orderCode)} | ${siteConfig.name}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 40px; }
    .invoice-card { background: white; max-width: 800px; margin: 0 auto; border-radius: 16px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; }
    .brand-logo { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
    .brand-logo .mart-highlight { color: #FF8A00; }
    .brand-logo .cart-icon { background: #FF8A00; color: white; padding: 6px 10px; border-radius: 10px; font-size: 18px; }
    .invoice-meta { text-align: right; font-size: 14px; color: #64748b; line-height: 1.5; }
    .meta-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
    .billing-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; font-size: 14px; }
    .billing-box { background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
    .billing-box h4 { margin: 0 0 10px 0; font-size: 15px; color: #0f172a; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
    .items-table th { background-color: #f8fafc; padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
    .invoice-summary { display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 30px; }
    .summary-totals { text-align: right; font-size: 15px; line-height: 1.8; }
    .print-btn-bar { text-align: center; margin-top: 30px; }
    .btn-print { background-color: #FF8A00; color: white; padding: 12px 32px; font-weight: bold; border-radius: 10px; border: none; font-size: 15px; cursor: pointer; }
    @media print {
      body { background: white; padding: 0; }
      .invoice-card { box-shadow: none; border: none; padding: 0; }
      .print-btn-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header-row">
      <div>
        <h1 class="brand-logo">
          <span class="cart-icon">🛒</span>
          <span>Master<span class="mart-highlight">Mart</span></span>
        </h1>
        <p style="margin: 6px 0 0 0; color: #64748b; font-size: 13px; font-weight: 600;">
          ${siteConfig.tagline}, ${escapeHtml(siteConfig.contact.address)}
        </p>
      </div>
      <div class="invoice-meta">
        <div class="meta-title">INVOICE</div>
        Invoice ID: <strong>#${escapeHtml(order.orderCode)}</strong><br/>
        Date: <strong>${new Date(order.createdAtUtc).toLocaleString()}</strong><br/>
        Payment: <strong style="color: ${order.paymentStatus === "success" ? "#16a34a" : "#ea580c"};">${order.paymentStatus.toUpperCase()}</strong>
      </div>
    </div>

    <div class="billing-columns">
      <div class="billing-box">
        <h4>Billed To (Customer Detail)</h4>
        <strong>Name:</strong> ${escapeHtml(order.customerName)}<br/>
        <strong>Phone:</strong> ${escapeHtml(order.customerPhone)}<br/>
        <strong>Address:</strong> ${escapeHtml(order.customerAddress)}<br/>
        <strong>Email:</strong> ${escapeHtml(order.customerEmail ?? "N/A")}
      </div>
      <div class="billing-box">
        <h4>Merchant Info</h4>
        <strong>${siteConfig.legalName}</strong><br/>
        ${escapeHtml(siteConfig.contact.address)}<br/>
        <strong>Phone:</strong> ${phoneDisplay}<br/>
        <strong>Support Email:</strong> ${siteConfig.contact.ordersEmail}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align: left;">Product Details</th>
          <th style="text-align: center; width: 100px;">Unit Price</th>
          <th style="text-align: center; width: 80px;">Qty</th>
          <th style="text-align: right; width: 120px;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div class="invoice-summary">
      <div>
        <p style="margin: 0; font-size: 13px; color: #64748b; max-width: 350px;">
          * Thank you for ordering from ${siteConfig.name}. All items have been
          double-inspected for freshness and sealed properly for express dispatch.
        </p>
      </div>
      <div class="summary-totals">
        Subtotal: <strong>${tk}${order.subtotal}</strong><br/>
        Delivery Charge: <strong>${tk}${order.deliveryFee}</strong><br/>
        <span style="font-size: 19px; color: #FF8A00; font-weight: bold;">Grand Total: ${tk}${order.total}</span>
      </div>
    </div>

    ${
      order.courierTrackingId
        ? `
    <div style="background-color: #FFF3E5; border: 1px solid #FFE1BB; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; margin-bottom: 20px;">
      <div><strong style="color: #B85B00;">📦 Dispatch Provider:</strong> Steadfast Courier Service</div>
      <div><strong>Tracking ID:</strong> <span style="font-family: monospace; background: white; padding: 4px 8px; border-radius: 6px; border: 1px solid #FFC588; font-weight: bold; color: #B85B00;">${escapeHtml(order.courierTrackingId)}</span></div>
    </div>`
        : ""
    }

    <div class="print-btn-bar">
      <button onclick="window.print()" class="btn-print">⎙ Print Invoice</button>
    </div>
  </div>
</body>
</html>`;
}

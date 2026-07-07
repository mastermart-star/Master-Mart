import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, LayoutDashboard, ShoppingBag, Layers, Star, 
  TrendingUp, Users, AlertTriangle, Check, Truck, 
  Trash2, Edit, Plus, ArrowLeft, ShieldAlert,
  Sliders, ArrowUpRight, DollarSign, Package, CheckCircle,
  RefreshCw, Settings, Eye, EyeOff, Printer, FileText
} from 'lucide-react';
import { Product, Order, OrderStatus, ProductReview, BkashSettings, DeliverySettings, ChatSupportSettings } from '../types';

interface AdminPanelProps {
  lang: 'en' | 'bn';
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, progress: number, extra?: Partial<Order>) => Promise<void>;
  onAddProductClick: () => void;
  onDeleteProduct: (product: Product) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onRestoreDefaultProducts?: () => Promise<void>;
  bkashSettings: BkashSettings;
  onSaveBkashSettings: (settings: BkashSettings) => Promise<void>;
  deliverySettings: DeliverySettings;
  onSaveDeliverySettings: (settings: DeliverySettings) => Promise<void>;
  chatSupportSettings: ChatSupportSettings;
  onSaveChatSupportSettings: (settings: ChatSupportSettings) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lang,
  onClose,
  products,
  orders,
  onUpdateOrderStatus,
  onAddProductClick,
  onDeleteProduct,
  onUpdateProduct,
  onRestoreDefaultProducts,
  bkashSettings,
  onSaveBkashSettings,
  deliverySettings,
  onSaveDeliverySettings,
  chatSupportSettings,
  onSaveChatSupportSettings
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'settings'>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [saveProductSuccess, setSaveProductSuccess] = useState(false);

  // bKash local settings state
  const [appKey, setAppKey] = useState(bkashSettings.appKey || '');
  const [secretKey, setSecretKey] = useState(bkashSettings.secretKey || '');
  const [username, setUsername] = useState(bkashSettings.username || '');
  const [password, setPassword] = useState(bkashSettings.password || '');
  const [isEnabled, setIsEnabled] = useState(bkashSettings.isEnabled || false);
  const [isCoDEnabled, setIsCoDEnabled] = useState(bkashSettings.isCoDEnabled !== false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Delivery Service local states
  const [activeDeliveryService, setActiveDeliveryService] = useState<'pathao' | 'steadfast' | 'none'>(deliverySettings?.activeService || 'none');
  const [pathaoStoreId, setPathaoStoreId] = useState(deliverySettings?.pathaoStoreId || '');
  const [pathaoClientId, setPathaoClientId] = useState(deliverySettings?.pathaoClientId || '');
  const [pathaoClientSecret, setPathaoClientSecret] = useState(deliverySettings?.pathaoClientSecret || '');
  const [pathaoUsername, setPathaoUsername] = useState(deliverySettings?.pathaoUsername || '');
  const [pathaoPassword, setPathaoPassword] = useState(deliverySettings?.pathaoPassword || '');
  const [steadfastApiKey, setSteadfastApiKey] = useState(deliverySettings?.steadfastApiKey || '');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState(deliverySettings?.steadfastSecretKey || '');
  const [isSavingDeliverySettings, setIsSavingDeliverySettings] = useState(false);

  // Chat Support local states
  const [activeChatPlatform, setActiveChatPlatform] = useState<'facebook' | 'whatsapp' | 'none'>(chatSupportSettings?.activePlatform || 'none');
  const [facebookUrl, setFacebookUrl] = useState(chatSupportSettings?.facebookUrl || '');
  const [whatsappNumber, setWhatsappNumber] = useState(chatSupportSettings?.whatsappNumber || '');
  const [whatsappMessage, setWhatsappMessage] = useState(chatSupportSettings?.whatsappMessage || '');
  const [isSavingChatSettings, setIsSavingChatSettings] = useState(false);

  // Password / Secret field visibility states
  const [showPathaoClientSecret, setShowPathaoClientSecret] = useState(false);
  const [showPathaoPassword, setShowPathaoPassword] = useState(false);
  const [showSteadfastSecretKey, setShowSteadfastSecretKey] = useState(false);

  useEffect(() => {
    setAppKey(bkashSettings.appKey || '');
    setSecretKey(bkashSettings.secretKey || '');
    setUsername(bkashSettings.username || '');
    setPassword(bkashSettings.password || '');
    setIsEnabled(bkashSettings.isEnabled || false);
    setIsCoDEnabled(bkashSettings.isCoDEnabled !== false);
  }, [bkashSettings]);

  useEffect(() => {
    if (deliverySettings) {
      setActiveDeliveryService(deliverySettings.activeService || 'none');
      setPathaoStoreId(deliverySettings.pathaoStoreId || '');
      setPathaoClientId(deliverySettings.pathaoClientId || '');
      setPathaoClientSecret(deliverySettings.pathaoClientSecret || '');
      setPathaoUsername(deliverySettings.pathaoUsername || '');
      setPathaoPassword(deliverySettings.pathaoPassword || '');
      setSteadfastApiKey(deliverySettings.steadfastApiKey || '');
      setSteadfastSecretKey(deliverySettings.steadfastSecretKey || '');
    }
  }, [deliverySettings]);

  useEffect(() => {
    if (chatSupportSettings) {
      setActiveChatPlatform(chatSupportSettings.activePlatform || 'none');
      setFacebookUrl(chatSupportSettings.facebookUrl || '');
      setWhatsappNumber(chatSupportSettings.whatsappNumber || '');
      setWhatsappMessage(chatSupportSettings.whatsappMessage || '');
    }
  }, [chatSupportSettings]);

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await onSaveBkashSettings({
        appKey,
        secretKey,
        username,
        password,
        isEnabled,
        isCoDEnabled
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveDeliverySettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDeliverySettings(true);
    try {
      await onSaveDeliverySettings({
        activeService: activeDeliveryService,
        pathaoStoreId,
        pathaoClientId,
        pathaoClientSecret,
        pathaoUsername,
        pathaoPassword,
        steadfastApiKey,
        steadfastSecretKey
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingDeliverySettings(false);
    }
  };

  const handleSaveChatSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingChatSettings(true);
    try {
      await onSaveChatSupportSettings({
        activePlatform: activeChatPlatform,
        facebookUrl,
        whatsappNumber,
        whatsappMessage
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingChatSettings(false);
    }
  };

  const handlePrintLabel = () => {
    if (!selectedOrder) return;

    const courierText = deliverySettings?.activeService === 'none' || !deliverySettings?.activeService
      ? (lang === 'en' ? 'General Courier' : 'সাধারণ কুরিয়ার')
      : deliverySettings?.activeService === 'pathao' 
        ? 'Pathao Courier' 
        : 'Steadfast Courier';

    const itemsRows = selectedOrder.items.map((item, index) => {
      const itemPrice = item.product.discountPrice || item.product.price;
      const lineTotal = itemPrice * item.quantity;
      return `
        <tr style="border-bottom: 1px dashed #eee; color: #000;">
          <td style="padding: 1.5px 0; font-size: 7.5px; text-align: left; line-height: 1.15;">
            [ ] ${index + 1}. ${lang === 'en' ? item.product.nameEn : item.product.nameBn}
            <span style="font-size: 6.5px; color: #555; display: inline-block; margin-left: 4px;">(${itemPrice} TK)</span>
          </td>
          <td style="padding: 1.5px 0; font-size: 7.5px; text-align: center; vertical-align: top;">${item.quantity}</td>
          <td style="padding: 1.5px 0; font-size: 7.5px; text-align: right; vertical-align: top;">${lineTotal} TK</td>
        </tr>
      `;
    }).join('');

    const getSlipHtml = (copyLabelEn: string, copyLabelBn: string) => `
      <div style="width: 100%; max-width: 95mm; margin: 0 auto; border: 1px solid #000; padding: 5px; box-sizing: border-box; background: #fff; page-break-inside: avoid; font-family: 'Courier New', Courier, monospace, 'Inter', sans-serif; color: #000; text-align: left; line-height: 1.15;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px;">
          <div>
            <h1 style="font-size: 11px; font-weight: 950; text-transform: uppercase; margin: 0; font-family: sans-serif; color: #000;">${lang === 'en' ? 'Master Mart' : 'মাস্টার মার্ট'}</h1>
            <div style="font-size: 7.5px; color: #000; margin-top: 1px;">
              <b>Date:</b> ${selectedOrder.timestamp.split(' ')[0]} | <b>ID:</b> ${selectedOrder.id}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 7.5px; background: #000; color: #fff; padding: 1px 3px; font-weight: bold; text-transform: uppercase; border-radius: 1px; display: inline-block; margin-bottom: 2px;">
              ${lang === 'en' ? 'INVOICE' : 'চালান'}
            </div>
            <br/>
            <div style="font-size: 7.5px; font-weight: bold; text-transform: uppercase; border: 1px solid #000; padding: 1px 3px; display: inline-block; background: #eee; color: #000; border-radius: 1px;">
              ${lang === 'en' ? copyLabelEn : copyLabelBn}
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 7.5px; margin-bottom: 4px; border-bottom: 1px dashed #ccc; padding-bottom: 3px; color: #000;">
          <div><b>Courier:</b> ${courierText}</div>
          <div><b>Payment:</b> ${selectedOrder.paymentMethod === 'bkash' ? 'bKash (Paid)' : 'COD'}</div>
        </div>

        <div style="border: 1px solid #000; padding: 3px 5px; margin-bottom: 4px; background: #fdfdfd; border-radius: 1px; font-size: 7.5px; color: #000;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #eee; padding-bottom: 1.5px; margin-bottom: 2.5px;">
            <span>👤 <b>${selectedOrder.customerName || (lang === 'en' ? 'Guest' : 'অতিথি')}</b></span>
            <span style="font-size: 8px; font-weight: bold; background: #f0f0f0; border: 1px dashed #000; padding: 0.5px 3px; border-radius: 1px;">📞 ${selectedOrder.customerPhone}</span>
          </div>
          <div style="word-break: break-word; line-height: 1.15;">
            📍 <b>Address:</b> ${selectedOrder.customerAddress}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px; color: #000; font-size: 7.5px;">
          <thead>
            <tr style="border-bottom: 1px solid #000; text-transform: uppercase; font-weight: bold;">
              <th style="text-align: left; padding: 1.5px 0;">Item</th>
              <th style="text-align: center; width: 25px; padding: 1.5px 0;">Qty</th>
              <th style="text-align: right; width: 55px; padding: 1.5px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
            <tr style="border-top: 1px solid #000; font-weight: bold;">
              <td colspan="2" style="text-align: right; padding: 1.5px 0;">Subtotal:</td>
              <td style="text-align: right; padding: 1.5px 0;">${selectedOrder.subtotal} TK</td>
            </tr>
            <tr style="font-weight: bold;">
              <td colspan="2" style="text-align: right; padding: 1.5px 0;">Delivery:</td>
              <td style="text-align: right; padding: 1.5px 0;">+${selectedOrder.deliveryFee} TK</td>
            </tr>
            <tr style="border-top: 1px dashed #000; font-weight: 900; font-size: 8px;">
              <td colspan="2" style="text-align: right; padding: 1.5px 0;">Grand Total:</td>
              <td style="text-align: right; padding: 1.5px 0;">${selectedOrder.total} TK</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #000; color: #fff; padding: 3px; text-align: center; font-weight: bold; margin-bottom: 4px; border-radius: 1px;">
          <span style="font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.3px; color: #fff;">
            ${lang === 'en' ? 'CASH TO COLLECT (COD):' : 'কালেক্টেড ক্যাশ (COD):'}
          </span>
          <span style="font-size: 11px; font-weight: 900; color: #fff; margin-left: 5px; background: #fff; color: #000; padding: 0.5px 4px; border-radius: 1px; display: inline-block;">
            ${selectedOrder.total} TK
          </span>
          <div style="font-size: 6.5px; text-transform: uppercase; font-weight: bold; color: #fff; margin-top: 1px; opacity: 0.9;">
            ${selectedOrder.paymentMethod === 'bkash' ? (lang === 'en' ? 'PAID ONLINE (bKash)' : 'বিকাশে পরিশোধিত') : (lang === 'en' ? 'COLLECT CASH ON DELIVERY' : 'ডেলিভারিতে ক্যাশ সংগ্রহ করুন')}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #ccc; padding-top: 3px; margin-top: 3px; color: #000;">
          <div style="font-size: 6.5px; color: #000; max-width: 55%; text-align: left; font-weight: bold; line-height: 1.15;">
            ${lang === 'en' ? 'Thank you for shopping with Master Mart!' : 'মাস্টার মার্ট এর সাথে কেনাকাটার জন্য ধন্যবাদ!'}
          </div>
          <div style="text-align: right;">
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 1px; height: 10px;">
              <div style="width: 2px; height: 10px; background: #000;"></div>
              <div style="width: 1px; height: 10px; background: #000;"></div>
              <div style="width: 3px; height: 10px; background: #000;"></div>
              <div style="width: 1.5px; height: 10px; background: #000;"></div>
              <div style="width: 1px; height: 10px; background: #000;"></div>
              <div style="width: 2px; height: 10px; background: #000;"></div>
              <div style="width: 1px; height: 10px; background: #000;"></div>
              <div style="width: 3px; height: 10px; background: #000;"></div>
              <div style="width: 1.5px; height: 10px; background: #000;"></div>
            </div>
            <div style="font-size: 6.5px; font-weight: bold; color: #000; margin-top: 1px;">*${selectedOrder.id}*</div>
          </div>
        </div>
      </div>
    `;

    const slip1 = getSlipHtml('CUSTOMER / PACKAGE COPY', 'গ্রাহক / প্যাকেজ কপি');
    const slip2 = getSlipHtml('OFFICE / MERCHANT COPY', 'অফিস / মার্চেন্ট কপি');
    const divider = `
      <div style="width: 100%; max-width: 95mm; margin: 4px auto; border-top: 1px dashed #000; position: relative; text-align: center; height: 1px; page-break-inside: avoid;">
        <span style="position: absolute; top: -7px; left: 50%; transform: translateX(-50%); background: #fff; padding: 0 6px; font-size: 8px; font-weight: bold; color: #000; font-family: sans-serif;">✂️ ${lang === 'en' ? 'TEAR ALONG LINE' : 'এখান থেকে কাটুন'} ✂️</span>
      </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${lang === 'en' ? 'Print Slip' : 'প্রিন্ট স্লিপ'} - ${selectedOrder.id}</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: #fff !important;
                color: #000 !important;
              }
              @page {
                size: A6 portrait;
                margin: 2mm 3mm;
              }
              .slip-container {
                page-break-inside: avoid;
                width: 100%;
                display: flex;
                justify-content: center;
              }
            }
            body {
              background: #fff;
              padding: 5px;
              margin: 0;
              color: #000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .slip-container {
              width: 100%;
              display: flex;
              justify-content: center;
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 0;">
            <div class="slip-container">
              ${slip1}
            </div>
            ${divider}
            <div class="slip-container">
              ${slip2}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    // Try to open a new tab/window for printing to bypass the iframe sandbox limitations
    let printWindow: Window | null = null;
    try {
      printWindow = window.open('', '_blank');
    } catch (e) {
      console.warn('Blocked opening print window directly. Falling back to same-page printing.', e);
    }

    if (printWindow) {
      printWindow.document.write(fullHtml);
      printWindow.document.close();
    } else {
      // Fallback same-page printing
      const existingSection = document.getElementById('print-section');
      if (existingSection) {
        existingSection.remove();
      }

      const printSection = document.createElement('div');
      printSection.id = 'print-section';
      printSection.innerHTML = `
        <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 5px; page-break-inside: avoid;">
          ${slip1}
        </div>
        ${divider}
        <div style="width: 100%; display: flex; justify-content: center; page-break-inside: avoid;">
          ${slip2}
        </div>
      `;
      document.body.appendChild(printSection);
      
      window.print();

      setTimeout(() => {
        printSection.remove();
      }, 1500);
    }
  };

  const [editDiscountPrice, setEditDiscountPrice] = useState<string>('');
  const [editStock, setEditStock] = useState<number>(0);

  // Stats calculators
  const totalSales = orders
    .filter(o => o.paymentStatus === 'success')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  const lowStockCount = products.filter(p => p.stock <= 3).length;

  // Driver details helper state
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverProgress, setDriverProgress] = useState<number>(25);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setDriverName(order.driverName || '');
    setDriverPhone(order.driverPhone || '');
    setDriverProgress(order.stepProgress || 25);
  };

  const handleUpdateOrderDetails = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    
    // Auto map progress to statuses if not customized
    let progress = driverProgress;
    if (newStatus === 'placed') progress = 10;
    else if (newStatus === 'preparing') progress = 35;
    else if (newStatus === 'on_the_way') progress = 70;
    else if (newStatus === 'delivered') progress = 100;

    const extra: Partial<Order> = {
      driverName: driverName.trim() || undefined,
      driverPhone: driverPhone.trim() || undefined,
    };

    await onUpdateOrderStatus(selectedOrder.id, newStatus, progress, extra);
    setSelectedOrder({
      ...selectedOrder,
      status: newStatus,
      stepProgress: progress,
      ...extra
    });
  };

  const handleQuickUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isSavingProduct) return;

    setIsSavingProduct(true);
    setSaveProductSuccess(false);

    try {
      const updated: Product = {
        ...editingProduct,
        price: Number(editPrice),
        stock: Number(editStock)
      };
      if (editDiscountPrice && Number(editDiscountPrice) > 0) {
        updated.discountPrice = Number(editDiscountPrice);
      } else {
        delete updated.discountPrice;
      }
      await onUpdateProduct(updated);
      setSaveProductSuccess(true);
      // Wait for 1 second to let the user see the success checkmark
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to quick update product:", err);
    } finally {
      setIsSavingProduct(false);
      setSaveProductSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/10">
      
      {/* Admin Top Header Navigation */}
      <header className="bg-white border-b border-slate-150 py-4.5 px-6 dark:bg-slate-900 dark:border-slate-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-md font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {lang === 'en' ? 'Master Mart Admin Portal' : 'মাস্টার মার্ট এডমিন প্যানেল'}
                </h1>
                <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm">
                  Live DB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                {lang === 'en' ? 'Manage products, track orders, live metrics' : 'পণ্য ও অর্ডার লাইভ কন্ট্রোল করুন'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Nav tabs (desktop) */}
            <div className="hidden md:flex bg-slate-100 p-1 rounded-xl dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40">
              <button
                onClick={() => { setActiveTab('overview'); setSelectedOrder(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{lang === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'}</span>
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>{lang === 'en' ? 'Orders' : 'অর্ডারসমূহ'}</span>
                {pendingOrdersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[8px] bg-amber-500 text-white rounded-full animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setActiveTab('products'); setSelectedOrder(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{lang === 'en' ? 'Products' : 'পণ্য তালিকা'}</span>
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setSelectedOrder(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{lang === 'en' ? 'Settings' : 'সেটিংস'}</span>
              </button>
            </div>

            {/* Back button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 px-4 py-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{lang === 'en' ? 'Exit Admin' : 'বাহির হোন'}</span>
            </button>
          </div>
        </div>

        {/* Tab navigation (Mobile Only) */}
        <div className="flex md:hidden mt-4 bg-slate-100 p-1 rounded-xl dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40">
          <button
            onClick={() => { setActiveTab('overview'); setSelectedOrder(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'}</span>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'Orders' : 'অর্ডার'}</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 text-[8px] bg-amber-500 text-white rounded-full ml-1">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('products'); setSelectedOrder(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'Products' : 'পণ্য'}</span>
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setSelectedOrder(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'Settings' : 'সেটিংস'}</span>
          </button>
        </div>
      </header>

      {/* Main Admin Panel Dashboard Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* STATS COUNTERS GRID */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-overview-grid">
            {/* Sales Card */}
            <div className="bg-white border border-slate-150 p-4.5 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-110 transition-all duration-300" />
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Total Revenue' : 'মোট বিক্রয়'}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  TK {totalSales.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-white border border-slate-150 p-4.5 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:scale-110 transition-all duration-300" />
              <div className="h-11 w-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Total Orders' : 'মোট অর্ডার'}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {orders.length} {lang === 'en' ? 'Placed' : 'টি'}
                </span>
              </div>
            </div>

            {/* Total Products Card */}
            <div className="bg-white border border-slate-150 p-4.5 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:scale-110 transition-all duration-300" />
              <div className="h-11 w-11 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center dark:bg-purple-500/20 dark:text-purple-400 shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Active Catalog' : 'মোট প্রোডাক্ট'}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {products.length} {lang === 'en' ? 'Items' : 'টি'}
                </span>
              </div>
            </div>

            {/* Low stock Card */}
            <div className={`border p-4.5 rounded-3xl shadow-xs flex items-center gap-4 relative overflow-hidden group transition-all ${
              lowStockCount > 0 
                ? 'bg-rose-50 border-rose-150 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-600 dark:text-rose-400' 
                : 'bg-white border-slate-150 dark:bg-slate-900 dark:border-slate-800 text-slate-800'
            }`}>
              <div className="h-11 w-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center dark:bg-rose-500/20 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Low Stock Warning' : 'কম স্টক পণ্য'}
                </span>
                <span className="text-lg font-black tracking-tight">
                  {lowStockCount} {lang === 'en' ? 'Low stock' : 'টি প্রোডাক্ট'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW & SALES GRAPHICS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales performance bar chart mock */}
            <div className="lg:col-span-2 bg-white border border-slate-150 rounded-3xl dark:bg-slate-900 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    {lang === 'en' ? 'Live Order Pipeline (Sales Stream)' : 'লাইভ অর্ডার এবং সেলস সামারি'}
                  </h3>
                  <p className="text-sm font-black text-slate-800 dark:text-white">
                    {lang === 'en' ? 'E-Commerce Live Transaction Metrics' : 'ই-কমার্স রিয়েল-টাইম ডাটাবেস ট্রানজেকশন'}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500 animate-pulse" />
              </div>

              {/* Graphical bars illustrating hourly deliveries */}
              <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 dark:border-slate-800">
                {[45, 60, 35, 75, 90, 110, 140, 120, 165, 150, 190, 220].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                    <span className="text-[8px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                      {val}
                    </span>
                    <div 
                      className="w-full rounded-t-lg bg-linear-to-t from-emerald-500 to-teal-400 group-hover:brightness-105 transition-all"
                      style={{ height: `${(val / 220) * 110}px` }}
                    />
                    <span className="text-[8px] font-bold text-slate-400 mt-1">
                      {12 + idx}:00
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{lang === 'en' ? 'Showing last 12 hours activity' : 'গত ১২ ঘণ্টার ট্রানজেকশন অগ্রগতি'}</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {lang === 'en' ? 'Firestore Connection Active' : 'ফায়ারস্টোর কানেকশন সক্রিয়'}
                </span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-linear-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between border border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="h-5 w-5 text-emerald-400" />
                  <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                    {lang === 'en' ? 'Quick Operations' : 'কুইক অ্যাকশন'}
                  </span>
                </div>
                <h3 className="text-base font-black tracking-tight leading-tight mb-2">
                  {lang === 'en' ? 'Instant Product Administration' : 'তাত্ক্ষণিক মার্চেন্ট এডমিন'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                  {lang === 'en' 
                    ? 'Deploy new items, monitor incoming shopping carts, modify delivery tracking riders, and view store analytics in live mode.' 
                    : 'ডাটাবেসে নতুন পণ্য যোগ করুন, গ্রাহকদের অর্ডার ট্র্যাক করুন এবং অর্ডারের ধাপগুলি লাইভ পরিচালনা করুন।'}
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={onAddProductClick}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
                  id="admin-add-product-btn"
                >
                  <Plus className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Add New Product to DB' : 'নতুন পণ্য যোগ করুন'}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider transition-all border border-slate-700 active:scale-98 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Manage Orders Queue' : 'অর্ডার তালিকা পরিচালনা'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Orders List Panel */}
            <div className="lg:col-span-2 bg-white border border-slate-150 rounded-3xl dark:bg-slate-900 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    {lang === 'en' ? 'Customer Orders List' : 'গ্রাহকদের অর্ডার তালিকা'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {lang === 'en' ? 'Click on any order to manage driver & live status' : 'ড্রাইভার বিবরণ ও অর্ডারের ধাপ পরিবর্তন করতে ক্লিক করুন'}
                  </p>
                </div>
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  {orders.length} {lang === 'en' ? 'Orders' : 'টি অর্ডার'}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-bold space-y-2">
                  <ShoppingBag className="h-10 w-10 mx-auto text-slate-300 animate-bounce" />
                  <p>{lang === 'en' ? 'No orders placed yet in Sandbox!' : 'কোনো অর্ডার এখনো পাওয়া যায়নি।'}</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1" id="admin-orders-list">
                  {orders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <button
                        key={order.id}
                        onClick={() => handleOpenOrder(order)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/5 border-emerald-500 ring-2 ring-emerald-500/10'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800'
                        }`}
                      >
                        <div className="space-y-1.5 truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {order.id}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                              order.status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 font-bold space-y-0.5 truncate">
                            <p className="truncate">
                              👤 {order.customerName || (lang === 'en' ? 'Guest Customer' : 'অতিথি কাস্টমার')} ({order.customerPhone})
                            </p>
                            <p className="truncate">
                              📍 {order.customerAddress}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                            TK {order.total}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 block">
                            🕒 {order.timestamp}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Order Control Panel Detail Card */}
            <div className="bg-white border border-slate-150 rounded-3xl dark:bg-slate-900 dark:border-slate-800 p-5 space-y-5">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
                {lang === 'en' ? 'Live Order Control Hub' : 'অর্ডার কন্ট্রোল প্যানেল'}
              </h3>

              {!selectedOrder ? (
                <div className="text-center py-20 text-slate-400 text-xs font-bold space-y-2">
                  <ShieldAlert className="h-8 w-8 mx-auto text-slate-300" />
                  <p>{lang === 'en' ? 'Select an order from the list to update progress' : 'স্ট্যাটাস আপডেট করার জন্য বাম থেকে অর্ডার সিলেক্ট করুন'}</p>
                </div>
              ) : (
                <div className="space-y-4" id="order-control-hub-details">
                  
                  {/* Customer Information summary */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {lang === 'en' ? 'Customer Profile' : 'কাস্টমার প্রোফাইল'}
                    </p>
                    <p><span className="text-slate-400">{lang === 'en' ? 'Name:' : 'নাম:'}</span> {selectedOrder.customerName || 'N/A'}</p>
                    <p><span className="text-slate-400">{lang === 'en' ? 'Phone:' : 'মোবাইল:'}</span> {selectedOrder.customerPhone || 'N/A'}</p>
                    <p><span className="text-slate-400">{lang === 'en' ? 'Address:' : 'ঠিকানা:'}</span> {selectedOrder.customerAddress || 'N/A'}</p>
                    <p><span className="text-slate-400">{lang === 'en' ? 'Payment Method:' : 'পেমেন্ট মেথড:'}</span> {selectedOrder.paymentMethod || 'COD'}</p>
                    <p><span className="text-slate-400">{lang === 'en' ? 'Items ordered:' : 'পণ্য বিবরণী:'}</span></p>
                    <div className="pl-2 border-l-2 border-emerald-500 space-y-1 text-[11px] font-bold text-slate-500">
                      {selectedOrder.items.map((item, i) => (
                        <p key={i}>
                          - {lang === 'en' ? item.product.nameEn : item.product.nameBn} ({item.quantity} x {item.product.price} TK)
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Rider Assign Fields */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {lang === 'en' ? 'Assign Delivery Rider' : 'ডেলিভারি রাইডার নিয়োগ'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                          {lang === 'en' ? 'Rider Name' : 'রাইডার নাম'}
                        </label>
                        <input
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          placeholder="e.g. Shakil Ahmed"
                          className="w-full text-xs font-bold rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                          {lang === 'en' ? 'Rider Phone' : 'রাইডার ফোন'}
                        </label>
                        <input
                          type="text"
                          value={driverPhone}
                          onChange={(e) => setDriverPhone(e.target.value)}
                          placeholder="e.g. 018XXXXXXXX"
                          className="w-full text-xs font-bold rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-wide mb-1">
                        <span>{lang === 'en' ? 'Rider Transit Progress (%)' : 'রাইডার ট্রানজিট অগ্রগতি (%)'}</span>
                        <span className="text-emerald-500">{driverProgress}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={driverProgress}
                        onChange={(e) => setDriverProgress(Number(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Stage state switcher */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                      {lang === 'en' ? 'Update Tracking Status' : 'অর্ডার স্ট্যাটাস পরিবর্তন'}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateOrderDetails('preparing')}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border ${
                          selectedOrder.status === 'preparing'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                            : 'border-slate-150 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 text-slate-600'
                        }`}
                      >
                        <Package className="h-3 w-3" />
                        <span>{lang === 'en' ? 'Preparing' : 'প্যাকিং'}</span>
                      </button>

                      <button
                        onClick={() => handleUpdateOrderDetails('on_the_way')}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border ${
                          selectedOrder.status === 'on_the_way'
                            ? 'bg-blue-500 border-blue-500 text-white shadow-xs animate-pulse'
                            : 'border-slate-150 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 text-slate-600'
                        }`}
                      >
                        <Truck className="h-3 w-3" />
                        <span>{lang === 'en' ? 'On The Way' : 'অন দ্য ওয়ে'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleUpdateOrderDetails('delivered')}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border ${
                        selectedOrder.status === 'delivered'
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                          : 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100/40 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{lang === 'en' ? 'Mark as Delivered' : 'ডেলিভারি সম্পন্ন নিশ্চিত করুন'}</span>
                    </button>

                    <button
                      onClick={() => setIsPrintModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm mt-2 transition-all hover:scale-102 active:scale-98"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>{lang === 'en' ? 'Print Packet Bill & Label' : 'বিল ও লেবেল প্রিন্ট করুন'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS CATALOGUE / INVENTORY */}
        {activeTab === 'products' && (
          <div className="bg-white border border-slate-150 rounded-3xl dark:bg-slate-900 dark:border-slate-800 p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  {lang === 'en' ? 'Database Product Catalog' : 'ডাটাবেস পণ্য নিয়ন্ত্রণ তালিকা'}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {lang === 'en' ? 'Quickly modify catalog prices, inventory stock and delete items' : 'প্রোডাক্টের মূল্য ও স্টক তাৎক্ষণিক এডিট করুন এবং ডিলেট করুন'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onAddProductClick}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
                  id="admin-inventory-add-btn"
                >
                  <Plus className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Add New Product' : 'নতুন পণ্য যোগ করুন'}</span>
                </button>
              </div>
            </div>

            {/* Inventory table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800" id="admin-inventory-table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 px-4">{lang === 'en' ? 'Product' : 'পণ্য বিবরণ'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Category' : 'ক্যাটাগরি'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Price (TK)' : 'মূল্য (টাকা)'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Stock' : 'স্টক পরিমাণ'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'en' ? 'Actions' : 'অ্যাকশন'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                      
                      {/* Image & Title Column */}
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.nameEn}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-50 border border-slate-100 dark:border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate max-w-[150px] sm:max-w-[220px]">
                          <span className="font-extrabold text-slate-950 dark:text-white block truncate leading-tight">
                            {lang === 'en' ? prod.nameEn : prod.nameBn}
                          </span>
                          <span className="text-[10px] text-slate-400 block tracking-tight font-medium">
                            {lang === 'en' ? prod.unitEn : prod.unitBn} | ID: {prod.id}
                          </span>
                        </div>
                      </td>

                      {/* Category Label */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                          {prod.category}
                        </span>
                      </td>

                      {/* Pricing Column */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 dark:text-white">
                          TK {prod.discountPrice || prod.price}
                        </span>
                        {prod.discountPrice && (
                          <span className="text-[10px] text-slate-400 line-through block font-medium">
                            TK {prod.price}
                          </span>
                        )}
                      </td>

                      {/* Stock Inventory Column */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-1 text-[10px] font-black rounded-md ${
                          prod.stock <= 3
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {prod.stock} {lang === 'en' ? 'left' : 'টি'}
                        </span>
                      </td>

                      {/* Quick Edit or Delete Operations Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setEditPrice(prod.price);
                              setEditDiscountPrice(prod.discountPrice !== undefined && prod.discountPrice !== null ? String(prod.discountPrice) : '');
                              setEditStock(prod.stock);
                            }}
                            className="p-1.5 rounded-lg border border-slate-150 hover:border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                            title={lang === 'en' ? 'Quick Edit Price/Stock' : 'মূল্য/স্টক এডিট করুন'}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setProductToDelete(prod);
                            }}
                            className="p-1.5 rounded-lg border border-rose-100 hover:bg-rose-500 hover:text-white text-rose-500 transition-all cursor-pointer dark:border-rose-950/40"
                            title={lang === 'en' ? 'Delete Permanently' : 'মুছে ফেলুন'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB: PAYMENT CONFIGURATIONS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header / Intro */}
            <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-1">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="h-4 w-4 text-pink-600 animate-spin-slow" />
                {lang === 'en' ? 'Payment Gateway Configuration' : 'পেমেন্ট গেটওয়ে কনফিগারেশন'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {lang === 'en' 
                  ? 'Manage your store checkout options, toggle payment methods, and configure bKash Merchant APIs.' 
                  : 'আপনার দোকানের ক্যাশআউট পদ্ধতি নির্বাচন করুন এবং বিকাশ মার্চেন্ট এপিআই কনফিগার করুন।'}
              </p>
            </div>

            <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
              {/* Payment Methods Activation Grid */}
              <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  {lang === 'en' ? 'Select Payment Methods' : 'পেমেন্ট মাধ্যম নির্বাচন'}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CoD Toggle Card */}
                  <div 
                    onClick={() => {
                      setIsCoDEnabled(true);
                      setIsEnabled(false);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isCoDEnabled 
                        ? 'bg-emerald-50/50 border-emerald-500 dark:bg-emerald-950/10 dark:border-emerald-600' 
                        : 'bg-slate-50/50 border-slate-200 dark:bg-slate-950/10 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCoDEnabled 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-slate-150 text-slate-400 dark:bg-slate-850'
                      }`}>
                        COD
                      </div>
                      <div>
                        <span className="block text-xs font-black text-slate-900 dark:text-white">
                          {lang === 'en' ? 'Cash On Delivery' : 'ক্যাশ অন ডেলিভারি'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {lang === 'en' ? 'Pay upon delivery' : 'ডেলিভারির সময় পেমেন্ট'}
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isCoDEnabled 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {isCoDEnabled && <Check className="h-3 w-3" />}
                    </div>
                  </div>

                  {/* bKash Toggle Card */}
                  <div 
                    onClick={() => {
                      setIsEnabled(true);
                      setIsCoDEnabled(false);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isEnabled 
                        ? 'bg-pink-50/50 border-pink-500 dark:bg-pink-950/10 dark:border-pink-900' 
                        : 'bg-slate-50/50 border-slate-200 dark:bg-slate-950/10 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs ${
                        isEnabled 
                          ? 'bg-pink-500/10 text-pink-600' 
                          : 'bg-slate-150 text-slate-400 dark:bg-slate-850'
                      }`}>
                        bK
                      </div>
                      <div>
                        <span className="block text-xs font-black text-slate-900 dark:text-white">
                          {lang === 'en' ? 'bKash Merchant' : 'বিকাশ মার্চেন্ট'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {lang === 'en' ? 'Accept secure mobile payments' : 'অনলাইন বিকাশ পেমেন্ট নিন'}
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isEnabled 
                        ? 'bg-pink-500 border-pink-500 text-white' 
                        : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {isEnabled && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* bKash Merchant Configuration Card */}
              <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                      {lang === 'en' ? 'Configure bKash Merchant' : 'বিকাশ মার্চেন্ট অ্যাকাউন্ট সেটআপ'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {lang === 'en' 
                        ? 'Configure your live/sandbox bKash credentials' 
                        : 'আপনার বিকাশ মার্চেন্ট এপিআই শংসাপত্রসমূহ প্রদান করুন'}
                    </p>
                  </div>
                  
                  <a 
                    href="https://www.bkash.com/business" 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="text-[10px] font-black text-pink-600 hover:underline inline-flex items-center gap-1 bg-pink-50 dark:bg-pink-950/30 px-2.5 py-1 rounded-lg self-start shrink-0"
                  >
                    <span>{lang === 'en' ? 'Apply for bKash Merchant' : 'মার্চেন্ট অ্যাকাউন্ট আবেদন'}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'App Key' : 'অ্যাপ কি (App Key)'}
                    </label>
                    <input
                      type="text"
                      value={appKey}
                      onChange={(e) => setAppKey(e.target.value)}
                      placeholder="e.g. 5x897dfs9a8d7sfa98s"
                      className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-pink-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                      required={isEnabled}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'Secret Key' : 'সিক্রেট কি (Secret Key)'}
                    </label>
                    <input
                      type="text"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="e.g. s987a98sf7da98sf987asda978"
                      className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-pink-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                      required={isEnabled}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'Username' : 'ইউজারনেম (Username)'}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. master_mart_bkash"
                      className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-pink-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                      required={isEnabled}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'Password' : 'পাসওয়ার্ড (Password)'}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••••••••••••"
                      className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-pink-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                      required={isEnabled}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-pink-100 bg-pink-50/20 dark:border-pink-900/30 dark:bg-pink-950/10 p-4 space-y-1.5">
                  <h4 className="text-[11px] font-extrabold text-pink-700 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-pink-500" />
                    {lang === 'en' ? "Don't have bKash Merchant account? Apply Now." : "বিকাশ মার্চেন্ট অ্যাকাউন্ট নেই? আজই আবেদন করুন।"}
                  </h4>
                  <p className="text-[10px] leading-relaxed font-bold text-slate-500 dark:text-zinc-400">
                    {lang === 'en' 
                      ? 'You can instantly activate online checkout with your business details on bKash merchant panel, or configure test credentials to try the simulated payment flow.' 
                      : 'আপনার ব্যবসা প্রতিষ্ঠানের লাইসেন্স দিয়ে বিকাশ বিজনেস প্যানেলে মার্চেন্ট অ্যাকাউন্টের জন্য আবেদন করতে পারবেন। অথবা সিমুলেটেড পেমেন্ট টেস্ট করতে এই ফিল্ডগুলো ব্যবহার করুন।'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#ea7a10] hover:bg-[#d66e0b] disabled:opacity-50 px-8 py-3.5 text-sm font-black text-white transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                      <span>{lang === 'en' ? 'Saving Configurations...' : 'সংরক্ষণ করা হচ্ছে...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 shrink-0" />
                      <span>{lang === 'en' ? 'Save Configurations' : 'কনফিগারেশন সেভ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* DELIVERY SERVICE CONFIGURATION FORM */}
            <form onSubmit={handleSaveDeliverySettingsSubmit} className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* Select Delivery Service Header & Pills */}
              <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {lang === 'en' ? 'Select Delivery Service' : 'ডেলিভারি সার্ভিস নির্বাচন'}
                </h3>

                <div className="flex flex-wrap gap-3">
                  {/* Pathao Pill */}
                  <button
                    type="button"
                    onClick={() => setActiveDeliveryService(activeDeliveryService === 'pathao' ? 'none' : 'pathao')}
                    className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                      activeDeliveryService === 'pathao'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900'
                    }`}
                  >
                    {activeDeliveryService === 'pathao' && <Check className="h-3.5 w-3.5" />}
                    <span>Pathao</span>
                  </button>

                  {/* Steadfast Pill */}
                  <button
                    type="button"
                    onClick={() => setActiveDeliveryService(activeDeliveryService === 'steadfast' ? 'none' : 'steadfast')}
                    className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                      activeDeliveryService === 'steadfast'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900'
                    }`}
                  >
                    {activeDeliveryService === 'steadfast' && <Check className="h-3.5 w-3.5" />}
                    <span>Steadfast</span>
                  </button>
                </div>
              </div>

              {/* Configure Fields based on active service */}
              {activeDeliveryService === 'pathao' && (
                <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                      {lang === 'en' ? 'Configure Pathao' : 'পাঠাও কনফিগারেশন'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {lang === 'en' 
                        ? 'Configure your Pathao Courier Merchant credentials' 
                        : 'আপনার পাঠাও কুরিয়ার মার্চেন্ট এপিআই শংসাপত্রসমূহ প্রদান করুন'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Merchant Store Id */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'Merchant Store Id' : 'মার্চেন্ট স্টোর আইডি'}
                      </label>
                      <input
                        type="text"
                        value={pathaoStoreId}
                        onChange={(e) => setPathaoStoreId(e.target.value)}
                        placeholder="e.g. 10245"
                        className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                        required
                      />
                    </div>

                    {/* Merchant Client Id */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'Merchant Client Id' : 'মার্চেন্ট ক্লায়েন্ট আইডি'}
                      </label>
                      <input
                        type="text"
                        value={pathaoClientId}
                        onChange={(e) => setPathaoClientId(e.target.value)}
                        placeholder="e.g. client_abc123"
                        className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                        required
                      />
                    </div>

                    {/* Merchant Client Secret */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'Merchant Client Secret' : 'মার্চেন্ট ক্লায়েন্ট সিক্রেট'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPathaoClientSecret ? "text" : "password"}
                          value={pathaoClientSecret}
                          onChange={(e) => setPathaoClientSecret(e.target.value)}
                          placeholder="•••••••••••••••••"
                          className="w-full rounded-xl border border-slate-150 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPathaoClientSecret(!showPathaoClientSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                        >
                          {showPathaoClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Merchant Username */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'Merchant Username' : 'মার্চেন্ট ইউজারনেম'}
                      </label>
                      <input
                        type="text"
                        value={pathaoUsername}
                        onChange={(e) => setPathaoUsername(e.target.value)}
                        placeholder="e.g. store_owner@example.com"
                        className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                        required
                      />
                    </div>

                    {/* Merchant Password */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'Merchant Password' : 'মার্চেন্ট পাসওয়ার্ড'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPathaoPassword ? "text" : "password"}
                          value={pathaoPassword}
                          onChange={(e) => setPathaoPassword(e.target.value)}
                          placeholder="•••••••••••••••••"
                          className="w-full rounded-xl border border-slate-150 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPathaoPassword(!showPathaoPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                        >
                          {showPathaoPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDeliveryService === 'steadfast' && (
                <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                      {lang === 'en' ? 'Configure Steadfast' : 'স্টেডফাস্ট কনফিগারেশন'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {lang === 'en' 
                        ? 'Configure your Steadfast Courier API credentials' 
                        : 'আপনার স্টেডফাস্ট কুরিয়ার এপিআই শংসাপত্রসমূহ প্রদান করুন'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* API Key */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'API Key' : 'এপিআই কি (API Key)'}
                      </label>
                      <input
                        type="text"
                        value={steadfastApiKey}
                        onChange={(e) => setSteadfastApiKey(e.target.value)}
                        placeholder="e.g. sf_api_key_123456"
                        className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                        required
                      />
                    </div>

                    {/* Secret Key */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'Secret Key' : 'সিক্রেট কি (Secret Key)'}
                      </label>
                      <div className="relative">
                        <input
                          type={showSteadfastSecretKey ? "text" : "password"}
                          value={steadfastSecretKey}
                          onChange={(e) => setSteadfastSecretKey(e.target.value)}
                          placeholder="•••••••••••••••••"
                          className="w-full rounded-xl border border-slate-150 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSteadfastSecretKey(!showSteadfastSecretKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                        >
                          {showSteadfastSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Delivery service Action Button */}
              {activeDeliveryService !== 'none' && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingDeliverySettings}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-8 py-3.5 text-sm font-black text-white transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    {isSavingDeliverySettings ? (
                      <>
                        <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                        <span>{lang === 'en' ? 'Saving Delivery Configurations...' : 'সংরক্ষণ করা হচ্ছে...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 shrink-0" />
                        <span>{lang === 'en' ? 'Save Delivery Service' : 'ডেলিভারি সার্ভিস সংরক্ষণ করুন'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* CHAT SUPPORT CONFIGURATION FORM */}
            <form onSubmit={handleSaveChatSettingsSubmit} className="space-y-6 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {lang === 'en' ? 'Chat Support' : 'চ্যাট সাপোর্ট'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {lang === 'en' 
                      ? 'Configure customer support option shown on the website' 
                      : 'ওয়েবসাইটে প্রদর্শিত কাস্টমার সাপোর্ট অপশনটি কনফিগার করুন'}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    {lang === 'en' ? 'Select Chat Option' : 'চ্যাট অপশন নির্বাচন করুন'}
                  </label>
                  
                  <div className="flex flex-wrap gap-3">
                    {/* None Option */}
                    <button
                      type="button"
                      onClick={() => setActiveChatPlatform('none')}
                      className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                        activeChatPlatform === 'none'
                          ? 'bg-slate-800 border-slate-800 text-white shadow-md dark:bg-white dark:border-white dark:text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900'
                      }`}
                    >
                      {activeChatPlatform === 'none' && <Check className="h-3.5 w-3.5" />}
                      <span>{lang === 'en' ? 'Disabled' : 'বন্ধ'}</span>
                    </button>

                    {/* Facebook Pill */}
                    <button
                      type="button"
                      onClick={() => setActiveChatPlatform('facebook')}
                      className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                        activeChatPlatform === 'facebook'
                          ? 'bg-[#1877F2] border-[#1877F2] text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900'
                      }`}
                    >
                      {activeChatPlatform === 'facebook' && <Check className="h-3.5 w-3.5" />}
                      <span>Facebook</span>
                    </button>

                    {/* Whatsapp Pill */}
                    <button
                      type="button"
                      onClick={() => setActiveChatPlatform('whatsapp')}
                      className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                        activeChatPlatform === 'whatsapp'
                          ? 'bg-[#25D366] border-[#25D366] text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900'
                      }`}
                    >
                      {activeChatPlatform === 'whatsapp' && <Check className="h-3.5 w-3.5" />}
                      <span>Whatsapp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Configure Fields based on active chat platform */}
              {activeChatPlatform === 'facebook' && (
                <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shrink-0" />
                      {lang === 'en' ? 'Facebook Integration' : 'ফেসবুক ইন্টিগ্রেশন'}
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'Facebook Page or Messenger URL' : 'ফেসবুক পেজ অথবা মেসেঞ্জার লিংক'}
                    </label>
                    <input
                      type="text"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="e.g. https://m.me/your_page_name"
                      className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                      required
                    />
                  </div>
                </div>
              )}

              {activeChatPlatform === 'whatsapp' && (
                <div className="bg-white border border-slate-150 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] shrink-0" />
                      {lang === 'en' ? 'WhatsApp Integration' : 'হোয়াটসঅ্যাপ ইন্টিগ্রেশন'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* WhatsApp Number */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'WhatsApp Number (With country code)' : 'হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোড সহ)'}
                      </label>
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. 8801712345678"
                        className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                        required
                      />
                    </div>

                    {/* Pre-filled Message */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {lang === 'en' ? 'Pre-filled Welcome Message' : 'ডিফল্ট বার্তা (প্রি-ফিলড)'}
                      </label>
                      <input
                        type="text"
                        value={whatsappMessage}
                        onChange={(e) => setWhatsappMessage(e.target.value)}
                        placeholder="e.g. Hello, I have a question about my order."
                        className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Chat Settings Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingChatSettings}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-8 py-3.5 text-sm font-black text-white transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {isSavingChatSettings ? (
                    <>
                      <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                      <span>{lang === 'en' ? 'Saving Chat Support Option...' : 'সংরক্ষণ করা হচ্ছে...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 shrink-0" />
                      <span>{lang === 'en' ? 'Save' : 'সংরক্ষণ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* QUICK INLINE PRODUCT EDIT MODAL OVERLAY */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider">
                <Edit className="h-4 w-4 text-emerald-500" />
                <span>{lang === 'en' ? 'Quick Inventory Edit' : 'ইনভেন্টরি এডিট'}</span>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
              {lang === 'en' ? 'Editing product:' : 'সম্পাদনা পণ্য:'} <span className="text-emerald-500 dark:text-emerald-400">{lang === 'en' ? editingProduct.nameEn : editingProduct.nameBn}</span>
            </p>

            <form onSubmit={handleQuickUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                  {lang === 'en' ? 'Adjust Retail Price (TK)' : 'মূল্য সংশোধন (টাকা)'}
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  min="1"
                  className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold text-emerald-600 dark:text-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                  {lang === 'en' ? 'Adjust Discount Price (TK) - Optional' : 'ডিসকাউন্ট মূল্য সংশোধন (টাকা) - ঐচ্ছিক'}
                </label>
                <input
                  type="number"
                  value={editDiscountPrice}
                  onChange={(e) => setEditDiscountPrice(e.target.value)}
                  min="0"
                  placeholder={lang === 'en' ? 'No discount' : 'কোনো ডিসকাউন্ট নেই'}
                  className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold text-rose-600 dark:text-rose-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                  {lang === 'en' ? 'Adjust Warehouse Stock' : 'স্টক পরিমাণ সংশোধন'}
                </label>
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  min="0"
                  className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-extrabold text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSavingProduct}
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-150 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className={`rounded-xl text-white text-xs font-black px-5 py-2.5 transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 min-w-[125px] ${
                    saveProductSuccess
                      ? 'bg-emerald-500'
                      : isSavingProduct
                      ? 'bg-slate-400 dark:bg-slate-700 cursor-wait'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {saveProductSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>{lang === 'en' ? 'Saved!' : 'সংরক্ষিত!'}</span>
                    </>
                  ) : isSavingProduct ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
                      <span>{lang === 'en' ? 'Saving...' : 'সেভ হচ্ছে...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>{lang === 'en' ? 'Save Changes' : 'পরিবর্তন সেভ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* PACKET BILL & SHIPPING LABEL PRINT PREVIEW MODAL */}
      {isPrintModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden font-sans text-slate-800 dark:text-slate-100"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-indigo-600 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {lang === 'en' ? 'Packet Bill & Shipping Label' : 'প্যাকিং বিল ও শিপিং লেবেল'}
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Iframe Notice for AI Studio Preview */}
              {typeof window !== 'undefined' && window.self !== window.top && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg leading-none">⚠️</span>
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        {lang === 'en' ? 'Iframe Printing Warning' : 'প্রিভিউ মোড প্রিন্টিং সতর্কতা'}
                      </h4>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                        {lang === 'en'
                          ? "You are using the app inside AI Studio's sandbox preview iframe. Browsers block print dialogs here by default."
                          : "আপনি অ্যাপটি AI Studio প্রিভিউয়ের ভেতরে ব্যবহার করছেন। ব্রাউজার সিকিউরিটির কারণে প্রিভিউ ফ্রেমের ভেতর থেকে সরাসরি প্রিন্ট ডায়ালগ ওপেন করা সম্ভব নয়।"}
                      </p>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                        {lang === 'en'
                          ? "Please click the button below to open the app in a new full browser tab, then go to Admin Panel and click Print. It will work perfectly!"
                          : "নিচের বাটনে ক্লিক করে অ্যাপটি নতুন ট্যাবে ওপেন করুন এবং এডমিন প্যানেল থেকে প্রিন্ট করুন। তাহলে সাথে সাথে প্রিন্ট ডায়ালগ চলে আসবে এবং প্রিন্টার কাজ করবে!"}
                      </p>
                    </div>
                  </div>
                  <div className="pt-1 text-left pl-7">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'Open App in New Tab to Print' : 'নতুন ট্যাবে অ্যাপ ওপেন করুন'}</span>
                      <span className="text-xs">↗</span>
                    </a>
                  </div>
                </div>
              )}
              
              {/* Packaging Checklist helper */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  {lang === 'en' ? 'Product Packaging Checklist' : 'প্যাকিং ও আইটেম ভেরিফিকেশন'}
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  {lang === 'en' 
                    ? 'Verify items before packing. Mark them checked, then stick the printed label on the top of your package.' 
                    : 'প্যাকেট করার পূর্বে প্রতিটি পণ্য ঠিক আছে কিনা মিলিয়ে নিন এবং টিক দিন। এরপর বিলটি প্রিন্ট করে প্যাকেটের উপরে লাগিয়ে দিন।'}
                </p>
                
                <div className="space-y-2 pt-1">
                  {selectedOrder.items.map((item, i) => (
                    <label key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer">
                      <input type="checkbox" className="mt-0.5 rounded-sm accent-emerald-600 h-4 w-4 shrink-0" />
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                        <span>{lang === 'en' ? item.product.nameEn : item.product.nameBn}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {lang === 'en' ? 'Qty' : 'পরিমাণ'}: {item.quantity} x {item.product.discountPrice || item.product.price} TK
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview Container Label */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Print Label Preview (Fits A6/Dual Slips)' : 'প্রিন্ট লেবেল প্রিভিউ (A6/ডুয়াল স্লিপ)'}
                </p>

                {/* Styled Print Preview Box */}
                <div className="bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center space-y-6 max-h-[50vh] overflow-y-auto w-full">
                  
                  {/* SLIP RENDER HELPER */}
                  {['CUSTOMER / PACKAGE COPY', 'OFFICE / MERCHANT COPY'].map((copyLabel, slipIdx) => (
                    <React.Fragment key={slipIdx}>
                      {slipIdx > 0 && (
                        <div className="w-full border-t border-dashed border-slate-400 my-2 relative text-center pt-1.5">
                          <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-slate-50 dark:bg-slate-950 px-2 text-[8px] font-bold text-slate-500">
                            ✂️ {lang === 'en' ? 'TEAR ALONG LINE' : 'এখান থেকে কাটুন'} ✂️
                          </span>
                        </div>
                      )}

                      <div className="w-full max-w-[340px] bg-white text-slate-950 p-2.5 border border-slate-950 rounded-xs font-mono shadow-xs text-left" style={{ lineHeight: 1.15 }}>
                        {/* Inner Header */}
                        <div className="flex justify-between items-center border-b border-slate-950 pb-1 mb-1.5">
                          <div>
                            <h4 className="text-xs font-black uppercase text-slate-950 tracking-tight leading-none">
                              {lang === 'en' ? 'Master Mart' : 'মাস্টার মার্ট'}
                            </h4>
                            <div className="text-[7.5px] text-slate-500 mt-0.5 font-bold leading-none">
                              <b>Date:</b> {selectedOrder.timestamp.split(' ')[0]} | <b>ID:</b> {selectedOrder.id}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-block bg-slate-950 text-white text-[7.5px] font-black px-1.5 py-0.5 tracking-wider uppercase rounded-xs leading-none mb-0.5">
                              {lang === 'en' ? 'INVOICE' : 'চালান'}
                            </span>
                            <br />
                            <div className="text-[7px] font-bold border border-slate-950 px-1 py-0.5 inline-block bg-slate-100 rounded-xs leading-none">
                              {lang === 'en' ? copyLabel : (copyLabel.includes('CUSTOMER') ? 'গ্রাহক কপি' : 'মার্চেন্ট কপি')}
                            </div>
                          </div>
                        </div>

                        {/* Courier Partner & Payment Method */}
                        <div className="text-[7.5px] flex justify-between font-bold border-b border-dashed border-slate-200 pb-1 mb-1.5 text-slate-850">
                          <div>
                            <span>Courier: </span>
                            <span className="font-black text-indigo-700">
                              {deliverySettings?.activeService === 'none' || !deliverySettings?.activeService
                                ? (lang === 'en' ? 'General' : 'সাধারণ')
                                : deliverySettings?.activeService === 'pathao' 
                                  ? 'Pathao' 
                                  : 'Steadfast'}
                            </span>
                          </div>
                          <div>
                            <span>Payment: </span>
                            <span className="font-black text-slate-900">
                              {selectedOrder.paymentMethod === 'bkash' ? 'bKash (Paid)' : 'COD'}
                            </span>
                          </div>
                        </div>

                        {/* Recipient Details Block */}
                        <div className="border border-slate-950 p-1.5 bg-slate-50 rounded-xs text-slate-950 mb-1.5 text-[7.5px]">
                          <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1 mb-1">
                            <span className="font-black">👤 {selectedOrder.customerName || (lang === 'en' ? 'Guest' : 'অতিথি')}</span>
                            <span className="font-black border border-dashed border-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                              📞 {selectedOrder.customerPhone}
                            </span>
                          </div>
                          <p className="leading-tight font-bold">
                            📍 <b>Address:</b> {selectedOrder.customerAddress}
                          </p>
                        </div>

                        {/* Order Checklist / Items table */}
                        <div className="mb-1.5">
                          <table className="w-full text-[7.5px] border-collapse font-bold text-slate-950">
                            <thead>
                              <tr className="border-b border-slate-950 text-left uppercase">
                                <th className="pb-0.5">Item</th>
                                <th className="pb-0.5 text-center w-6">Qty</th>
                                <th className="pb-0.5 text-right w-12">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedOrder.items.map((item, index) => {
                                const itemPrice = item.product.discountPrice || item.product.price;
                                const lineTotal = itemPrice * item.quantity;
                                return (
                                  <tr key={index} className="border-b border-dashed border-slate-200">
                                    <td className="py-0.5">
                                      [ ] {lang === 'en' ? item.product.nameEn : item.product.nameBn}
                                      <span className="text-[6.5px] text-slate-500 font-bold ml-1 inline-block">({itemPrice} TK)</span>
                                    </td>
                                    <td className="py-0.5 text-center">{item.quantity}</td>
                                    <td className="py-0.5 text-right">{lineTotal} TK</td>
                                  </tr>
                                );
                              })}
                              <tr className="border-t border-slate-950 font-bold">
                                <td className="py-0.5 text-right" colSpan={2}>{lang === 'en' ? 'Subtotal:' : 'উপমোট:'}</td>
                                <td className="py-0.5 text-right">{selectedOrder.subtotal} TK</td>
                              </tr>
                              <tr className="font-bold">
                                <td className="py-0.5 text-right" colSpan={2}>{lang === 'en' ? 'Delivery:' : 'ডেলিভারি:'}</td>
                                <td className="py-0.5 text-right">+{selectedOrder.deliveryFee} TK</td>
                              </tr>
                              <tr className="border-t border-dashed border-slate-950 font-black text-[8px]">
                                <td className="py-0.5 text-right" colSpan={2}>{lang === 'en' ? 'Grand Total:' : 'সর্বমোট:'}</td>
                                <td className="py-0.5 text-right text-indigo-700">{selectedOrder.total} TK</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Cash to Collect Block */}
                        <div className="bg-slate-950 text-white p-1.5 text-center rounded-xs mb-1.5">
                          <div className="flex justify-center items-center gap-1.5">
                            <span className="text-[7.5px] font-bold uppercase tracking-wider">
                              {lang === 'en' ? 'CASH TO COLLECT (COD):' : 'কালেক্টেড ক্যাশ (COD):'}
                            </span>
                            <span className="text-xs font-black bg-white text-slate-950 px-1.5 py-0.5 rounded-xs leading-none">
                              {selectedOrder.total} TK
                            </span>
                          </div>
                          <p className="text-[6.5px] tracking-wide uppercase font-black opacity-90 mt-0.5">
                            {selectedOrder.paymentMethod === 'bkash' 
                              ? (lang === 'en' ? 'Paid via bKash Online' : 'বিকাশের মাধ্যমে পরিশোধিত') 
                              : (lang === 'en' ? 'Collect full amount' : 'সম্পূর্ণ টাকা কুরিয়ার কালেকশন করবে')}
                          </p>
                        </div>

                        {/* Barcode and thank you note */}
                        <div className="flex justify-between items-center border-t border-dashed border-slate-300 pt-1 mt-1">
                          <p className="text-[6.5px] font-bold text-slate-700 max-w-[55%] leading-tight text-left">
                            {lang === 'en' ? 'Thank you for shopping with Master Mart!' : 'মাস্টার মার্ট এর সাথে কেনাকাটার জন্য ধন্যবাদ!'}
                          </p>
                          <div className="text-right">
                            <div className="flex justify-end items-center gap-[0.5px] h-3 opacity-80">
                              <div className="w-[1.5px] h-3 bg-slate-950"></div>
                              <div className="w-[0.5px] h-3 bg-slate-950"></div>
                              <div className="w-[2px] h-3 bg-slate-950"></div>
                              <div className="w-[1px] h-3 bg-slate-950"></div>
                              <div className="w-[0.5px] h-3 bg-slate-950"></div>
                              <div className="w-[1.5px] h-3 bg-slate-950"></div>
                              <div className="w-[0.5px] h-3 bg-slate-950"></div>
                              <div className="w-[2px] h-3 bg-slate-950"></div>
                              <div className="w-[1px] h-3 bg-slate-950"></div>
                            </div>
                            <p className="text-[7px] font-bold tracking-wider text-slate-800 mt-0.5">*{selectedOrder.id}*</p>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
              </button>
              
              <button
                type="button"
                onClick={handlePrintLabel}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>{lang === 'en' ? 'Print Now' : 'এখনই প্রিন্ট করুন'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CUSTOM PRODUCTS DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                    {lang === 'en' ? 'Delete Product?' : 'পণ্যটি মুছে ফেলবেন?'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {lang === 'en' ? 'This action is permanent and cannot be undone.' : 'এই কাজটি স্থায়ী এবং পুনরুদ্ধার করা সম্ভব নয়।'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-850">
                <img
                  src={productToDelete.image}
                  alt={productToDelete.nameEn}
                  className="h-10 w-10 rounded-lg object-cover bg-slate-50 border border-slate-100 dark:border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate flex-1">
                  <span className="font-extrabold text-xs text-slate-950 dark:text-white block truncate leading-tight">
                    {lang === 'en' ? productToDelete.nameEn : productToDelete.nameBn}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">
                    ID: {productToDelete.id} | TK {productToDelete.discountPrice || productToDelete.price}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-150 hover:bg-slate-50 text-slate-600 font-bold text-xs dark:border-slate-800 dark:hover:bg-slate-950 dark:text-zinc-300 cursor-pointer text-center"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const prod = productToDelete;
                    setProductToDelete(null);
                    await onDeleteProduct(prod);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer text-center shadow-md active:scale-95 transition-all"
                >
                  {lang === 'en' ? 'Delete' : 'মুছে ফেলুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

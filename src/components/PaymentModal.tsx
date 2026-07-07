import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Shield, Lock, CreditCard, CheckCircle, Smartphone, MapPin, ExternalLink, ArrowLeft, Trash2, Truck, FileText, Check } from 'lucide-react';
import { CartItem, BkashSettings } from '../types';

interface PaymentModalProps {
  totalAmount: number;
  onClose: () => void;
  onPaymentSuccess: (
    method: string, 
    kfcOutlet?: string, 
    customerDetails?: { name: string; phone: string; address: string; email?: string }
  ) => void;
  lang: 'en' | 'bn';
  dict: any;
  cartItems?: CartItem[];
  subtotal?: number;
  bkashSettings: BkashSettings;
  onSaveBkashSettings: (settings: BkashSettings) => Promise<void>;
}

type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'cod';
type Step = 'choose' | 'details' | 'otp' | 'success';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalAmount,
  onClose,
  onPaymentSuccess,
  lang,
  dict,
  cartItems = [],
  subtotal: propSubtotal,
  bkashSettings,
  onSaveBkashSettings
}) => {
  const [method, setMethod] = useState<PaymentMethod>(() => {
    if (bkashSettings?.isEnabled && !bkashSettings?.isCoDEnabled) {
      return 'bkash';
    }
    return 'cod';
  }); // Default based on enabled methods
  const [step, setStep] = useState<Step>('choose');

  // Sync state dynamically with fetched settings
  useEffect(() => {
    if (bkashSettings) {
      if (bkashSettings.isEnabled && !bkashSettings.isCoDEnabled) {
        setMethod('bkash');
      } else if (!bkashSettings.isEnabled && bkashSettings.isCoDEnabled) {
        setMethod('cod');
      }
    }
  }, [bkashSettings]);
  
  // Direct form states matching the uploaded screenshot
  const [billingName, setBillingName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; address?: string; phone?: string }>({});

  // Payment simulator inputs
  const [phoneNumber, setPhoneNumber] = useState('01712345678');
  const [pin, setPin] = useState('1234');
  const [otp, setOtp] = useState('482910');
  const [cardNumber, setCardNumber] = useState('4321 8876 5432 1098');
  const [cardName, setCardName] = useState('Shakib Al Hasan');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('321');

  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  // Sync mobile billing input to wallet mobile input
  useEffect(() => {
    if (billingPhone && billingPhone.startsWith('01')) {
      setPhoneNumber(billingPhone);
    }
  }, [billingPhone]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Dictionary strings for the Landing Page Direct Checkout
  const localDict = {
    en: {
      orderNowHeader: 'Order Now - Cash on Delivery',
      billingTitle: 'Billing Details',
      nameLabel: 'Enter Your Name *',
      addressLabel: 'Your Address (including Area, Thana, District) *',
      phoneLabel: 'Your Mobile Number *',
      emailLabel: 'Enter Your Email (optional)',
      shippingTitle: 'Shipping',
      insideDhaka: 'Inside Dhaka City',
      outsideDhaka: 'Outside Dhaka City',
      yourOrder: 'Your order',
      productHeader: 'Product',
      subtotalHeader: 'Subtotal',
      totalHeader: 'Total',
      codLabel: 'Cash on Delivery',
      codDesc: 'You can pay the delivery person in cash after receiving the products safely.',
      placeOrderButton: 'Order Now',
      requiredError: 'Please fill out all required fields.',
      invalidPhoneError: 'Please enter a valid 11-digit mobile number.',
      selectOutlet: 'Verify Delivery Hub Location',
      openLocationMap: 'Open Location Map',
      activeProductChecklist: 'Confirm Products to Order',
      cartEmpty: 'Your Cart is empty.'
    },
    bn: {
      orderNowHeader: 'অর্ডার করুন - ক্যাশ অন ডেলিভারিতে',
      billingTitle: 'বিলিং বিবরণ',
      nameLabel: 'আপনার নাম লিখুন *',
      addressLabel: 'আপনার ঠিকানা (এলাকা, থানা, জেলাসহ লিখুন) *',
      phoneLabel: 'আপনার মোবাইল নাম্বার *',
      emailLabel: 'আপনার ইমেইল লিখুন (optional)',
      shippingTitle: 'শিপিং পদ্ধতি',
      insideDhaka: 'ঢাকা সিটির ভেতরে:',
      outsideDhaka: 'ঢাকা সিটির বাইরে:',
      yourOrder: 'আপনার অর্ডার',
      productHeader: 'পণ্য',
      subtotalHeader: 'সাবটোটাল',
      totalHeader: 'সর্বমোট',
      codLabel: 'ক্যাশ অন ডেলিভারি',
      codDesc: 'পণ্য হাতে পেয়ে ডেলিভারি ম্যানকে পেমেন্ট করতে পারবেন।',
      placeOrderButton: 'অর্ডার করুন',
      requiredError: 'দয়া করে সব আবশ্যক ক্ষেত্রগুলো পূরণ করুন।',
      invalidPhoneError: 'দয়া করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।',
      selectOutlet: 'ডেলিভারি হাবের লোকেশন যাচাই করুন',
      openLocationMap: 'লোকেশন ম্যাপ খুঁজুন',
      activeProductChecklist: 'অর্ডার করতে পণ্য নিশ্চিত করুন',
      cartEmpty: 'আপনার কার্ট খালি রয়েছে।'
    }
  };

  const currentDict = localDict[lang] || localDict.bn;

  // Calculators
  const checkoutSubtotal = propSubtotal || totalAmount;
  const shippingFee = checkoutSubtotal >= 500 ? 0 : 80;
  const checkoutTotal = checkoutSubtotal + shippingFee;

  // Validation function
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!billingName.trim()) {
      newErrors.name = lang === 'en' ? 'Name is required' : 'নাম লেখা আবশ্যক';
    }
    if (!billingAddress.trim()) {
      newErrors.address = lang === 'en' ? 'Detailed address is required' : 'বিস্তারিত ঠিকানা দেওয়া আবশ্যক';
    }
    if (!billingPhone.trim()) {
      newErrors.phone = lang === 'en' ? 'Phone number is required' : 'মোবাইল নাম্বার দেওয়া আবশ্যক';
    } else if (!/^01[3-9]\d{8}$/.test(billingPhone.trim())) {
      newErrors.phone = lang === 'en' ? 'Valid 11-digit phone number is required' : '১১ ডিজিটের সঠিক মোবাইল নম্বর দিন';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Direct checkout handler (When clicking "Order Now")
  const handleDirectCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (method === 'cod') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 1200);
    } else {
      // Transition to sub-gateway steps for bKash / Nagad / Cards
      setStep('details');
    }
  };

  // Sub-gateway detail configurations
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimer(60);
    }, 1500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1800);
  };

  const handleFinish = () => {
    let readableMethod = '';
    if (method === 'bkash') readableMethod = 'bKash';
    else if (method === 'nagad') readableMethod = 'Nagad';
    else if (method === 'card') readableMethod = 'Visa Card';
    else readableMethod = 'Cash on Delivery';

    onPaymentSuccess(
      readableMethod,
      lang === 'en' ? 'Inside Dhaka' : 'ঢাকা শহরের ভেতরে',
      {
        name: billingName.trim() || (lang === 'en' ? 'Guest Customer' : 'অতিথি কাস্টমার'),
        phone: billingPhone.trim() || '01XXXXXXXXX',
        address: billingAddress.trim() || (lang === 'en' ? 'Not specified' : 'ঠিকানা দেওয়া হয়নি'),
        email: billingEmail.trim() || ''
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={`w-full overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all ${
          step === 'choose' ? 'max-w-4xl' : 'max-w-md'
        }`}
        id="payment-modal-container"
      >
        {/* Color bar top indicator */}
        <div className={`h-2.5 w-full bg-linear-to-r ${
          method === 'bkash' ? 'from-pink-500 to-pink-600' :
          method === 'nagad' ? 'from-orange-500 to-red-500' :
          method === 'card' ? 'from-blue-600 to-indigo-600' : 'from-emerald-500 to-teal-600'
        }`} />

        <div className="p-5 md:p-7">
          {/* Top Header Row */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                {dict.paymentSimTitle}
              </span>
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mt-0.5">
                {step === 'choose' && (lang === 'en' ? 'Direct Checkout' : 'অর্ডার ক্যাশ অন ডেলিভারি / বিকাশ')}
                {step === 'details' && (method === 'bkash' ? dict.bKashWallet : method === 'nagad' ? dict.nagadWallet : dict.creditCard)}
                {step === 'otp' && dict.enterOTP}
                {step === 'success' && dict.paymentSuccess}
              </h3>
            </div>
            {step !== 'success' && (
              <button
                onClick={onClose}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-705"
                id="close-payment-modal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Loading status screen */}
          {loading ? (
            <div className="flex py-24 flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-600" />
                <Lock className="absolute h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-black text-slate-600 dark:text-zinc-300 animate-pulse text-center">
                {lang === 'en' ? 'Processing secure order request...' : 'অর্ডার গেটওয়ে প্রসেস করা হচ্ছে...'}
              </p>
            </div>
          ) : (
            <div className="py-2.5">
              
              {/* STEP 1: DOUBLE COLUMN DOCKED landing-page checkout */}
              {step === 'choose' && (
                <form onSubmit={handleDirectCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3">
                  
                  {/* LEFT COLUMN: Checkout form, checklist, hub map */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* ORDER ITEM SELECT CHECKBOX & LOGO PREVIEW HEADER */}
                    <div className="bg-emerald-50/15 dark:bg-slate-950/20 border border-emerald-500/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                        <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest leading-none">
                          {currentDict.activeProductChecklist}
                        </h4>
                      </div>

                      {/* Map dynamic rendering card list with checkbox/radio styling matching screenshot */}
                      <div className="space-y-2.5">
                        {cartItems.map((item) => (
                          <div 
                            key={item.product.id}
                            className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs"
                          >
                            <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                              <div className="w-4 h-4 rounded-full bg-emerald-650 border-2 border-emerald-600 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                            </div>
                            <img 
                              src={item.product.image} 
                              alt="product checkout"
                              referrerPolicy="no-referrer"
                              className="w-11 h-11 object-cover rounded-lg bg-slate-50 shrink-0 border border-slate-100/50"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                                {lang === 'en' ? item.product.nameEn : item.product.nameBn}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-slate-400">
                                  {lang === 'en' ? item.product.unitEn : item.product.unitBn} × {item.quantity}
                                </span>
                                {item.product.discountPrice ? (
                                  <span className="text-[10px] font-bold text-slate-400 line-through">
                                    {dict.tk} {item.product.price}
                                  </span>
                                ) : null}
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                  {dict.tk} {item.product.discountPrice || item.product.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {cartItems.length === 0 && (
                          <p className="text-xs italic text-slate-400 p-2 text-center">{currentDict.cartEmpty}</p>
                        )}
                      </div>
                    </div>

                    {/* BILLING DETAILS SECTION */}
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white text-xs dark:bg-slate-800">
                          1
                        </span>
                        {currentDict.billingTitle}
                      </h3>

                      <div className="space-y-4">
                        {/* Name Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-350 mb-1">
                            {currentDict.nameLabel}
                          </label>
                          <input
                            type="text"
                            value={billingName}
                            onChange={(e) => setBillingName(e.target.value)}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-hidden focus:border-emerald-600 dark:bg-slate-950 transition-colors ${
                              errors.name ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-800'
                            }`}
                            placeholder={lang === 'en' ? 'e.g. Shakib Al Hasan' : 'যেমন: সাকিব আল হাসান'}
                          />
                          {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name}</p>}
                        </div>

                        {/* Address Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-350 mb-1">
                            {currentDict.addressLabel}
                          </label>
                          <input
                            type="text"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-hidden focus:border-emerald-600 dark:bg-slate-950 transition-colors ${
                              errors.address ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-800'
                            }`}
                            placeholder={lang === 'en' ? 'e.g. Road 12, Thana Banani, Dhaka' : 'যেমন: রোড ১২, বনানী, ঢাকা'}
                          />
                          {errors.address && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.address}</p>}
                        </div>

                        {/* Mobile Phone Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-350 mb-1">
                            {currentDict.phoneLabel}
                          </label>
                          <input
                            type="tel"
                            maxLength={11}
                            value={billingPhone}
                            onChange={(e) => setBillingPhone(e.target.value)}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-black tracking-wide text-slate-850 dark:text-white outline-hidden focus:border-emerald-600 dark:bg-slate-950 transition-colors ${
                              errors.phone ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-800'
                            }`}
                            placeholder="01XXXXXXXXX"
                          />
                          {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>}
                        </div>

                        {/* Optional Email Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-350 mb-1">
                            {currentDict.emailLabel}
                          </label>
                          <input
                            type="email"
                            value={billingEmail}
                            onChange={(e) => setBillingEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-hidden focus:border-emerald-600 dark:bg-slate-950 dark:border-slate-800"
                            placeholder={lang === 'en' ? 'name@example.com' : 'ইমেইল এড্রেস লিখুন'}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SHIPPING CONFIGURATION */}
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white text-xs dark:bg-slate-800">
                          2
                        </span>
                        {currentDict.shippingTitle}
                      </h3>

                      <div>
                        {/* Inside Dhaka */}
                        <div 
                          className="rounded-2xl p-3.5 border-2 border-emerald-600 bg-emerald-50/10 dark:bg-emerald-950/10 flex items-center justify-between shadow-xs cursor-default"
                        >
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="block text-xs font-black text-slate-800 dark:text-white">
                                {lang === 'en' ? 'Inside Dhaka City' : 'ঢাকা সিটির ভেতরে'}
                              </span>
                              {checkoutSubtotal >= 500 && (
                                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Free</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">{lang === 'en' ? 'Dhaka City Proper Home Delivery' : 'ঢাকা শহরের ভেতরে হোম ডেলিভারি'}</span>
                          </div>
                          <span className={`text-xs font-black font-sans ${checkoutSubtotal >= 500 ? 'line-through text-slate-400' : 'text-emerald-600'}`}>
                            {checkoutSubtotal >= 500 ? (lang === 'en' ? 'Free' : 'ফ্রি') : '80.00 ৳'}
                          </span>
                        </div>
                      </div>

                      {/* Promo banners indicating Free Shipping above 500 */}
                      <div className="mt-2.5 p-2.5 rounded-xl border border-emerald-500/10 bg-emerald-50/5 dark:bg-emerald-950/5 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-[10.5px] font-bold text-slate-500 dark:text-zinc-400">
                          {lang === 'en' 
                            ? 'Get FREE delivery on orders totaling ৳500 or more!'
                            : '৳৫০০ বা তার বেশি অর্ডারে ফ্রী ডেলিভারি সুবিধা উপভোগ করুন!'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: Your Order panel summary cards */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs sticky top-4">
                      
                      {/* Your Order title block */}
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-base font-black text-slate-850 dark:text-white tracking-tight uppercase tracking-wider">
                          {currentDict.yourOrder}
                        </h3>
                      </div>

                      {/* Header indicators row */}
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-400">
                        <span>{currentDict.productHeader}</span>
                        <span>{currentDict.subtotalHeader}</span>
                      </div>

                      {/* Product display loop */}
                      <div className="divide-y divide-slate-100/60 dark:divide-slate-800/60 max-h-56 overflow-y-auto pr-1 space-y-2">
                        {cartItems.map((item) => {
                          const itemPrice = item.product.discountPrice || item.product.price;
                          return (
                            <div key={item.product.id} className="flex justify-between items-start gap-4 pt-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                              <span className="flex-1 min-w-0 font-bold leading-normal truncate">
                                {lang === 'en' ? item.product.nameEn : item.product.nameBn} <span className="text-[10px] text-slate-400 font-extrabold underline decoration-slate-200">×{item.quantity}</span>
                              </span>
                              <span className="font-sans font-black text-slate-900 dark:text-white shrink-0">
                                {(itemPrice * item.quantity).toFixed(2)} ৳
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Subtotal line */}
                      <div className="flex justify-between items-center text-xs font-bold pt-3.5 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-zinc-400">
                        <span>{currentDict.subtotalHeader}</span>
                        <span className="font-sans font-black text-slate-850 dark:text-white">
                          {checkoutSubtotal.toFixed(2)} ৳
                        </span>
                      </div>

                      {/* Shipping line */}
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-zinc-400">
                        <span>{currentDict.shippingTitle}</span>
                        <span className={`font-sans font-black ${shippingFee === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-850 dark:text-white'}`}>
                          {shippingFee === 0 ? (lang === 'en' ? 'Free Shipping' : 'ফ্রি ডেলিভারি') : `${shippingFee.toFixed(2)} ৳`}
                        </span>
                      </div>

                      {/* Grand Total line */}
                      <div className="flex justify-between items-center text-sm font-black pt-3 border-t border-dashed border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white">
                        <span>{currentDict.totalHeader}</span>
                        <span className="font-sans font-black text-emerald-650 text-emerald-600 dark:text-emerald-400 text-base">
                          {checkoutTotal.toFixed(2)} ৳
                        </span>
                      </div>

                      {/* Direct payment method switcher container */}
                      {(bkashSettings?.isCoDEnabled !== false || bkashSettings?.isEnabled) && (
                        <div className="space-y-2 pt-2">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                            {lang === 'en' ? 'Select Payment Method' : 'পেমেন্ট মাধ্যম বেছে নিন'}
                          </label>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {/* Cash On Delivery method (the highlighted one in screenshot) */}
                            {bkashSettings?.isCoDEnabled !== false && (
                              <div 
                                onClick={() => setMethod('cod')}
                                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer text-center transition-all ${
                                  method === 'cod' 
                                    ? 'bg-emerald-600 border-emerald-600 text-white font-black' 
                                    : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-white'
                                } ${!bkashSettings?.isEnabled ? 'col-span-2' : ''}`}
                              >
                                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-[10px] font-bold shrink-0">{lang === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}</span>
                              </div>
                            )}

                            {/* bkash method (fallback verification option) */}
                            {bkashSettings?.isEnabled && (
                              <div 
                                onClick={() => setMethod('bkash')}
                                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer text-center transition-all ${
                                  method === 'bkash' 
                                    ? 'bg-pink-600 border-pink-600 text-white font-black' 
                                    : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-white'
                                } ${bkashSettings?.isCoDEnabled === false ? 'col-span-2' : ''}`}
                              >
                                <div className="font-bold text-[10px] shrink-0">bk</div>
                                <span className="text-[10px] font-bold shrink-0">bKash (বিকাশ)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* COD Confirmation Alert box matching the screenshot */}
                      {method === 'cod' && (
                        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-850 bg-white/40 dark:bg-slate-900/40 p-4 space-y-1.5">
                          <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {currentDict.codLabel}
                          </h4>
                          <p className="text-[11px] leading-relaxed font-bold text-slate-500 dark:text-zinc-400">
                            {currentDict.codDesc}
                          </p>
                        </div>
                      )}

                      {/* bKash validation statement */}
                      {method === 'bkash' && (
                        <div className="rounded-xl bg-pink-50/20 border border-pink-100 p-3.5 space-y-2 dark:bg-pink-950/20 dark:border-pink-900/30">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-extrabold text-pink-700 dark:text-pink-400">
                              {bkashSettings?.isEnabled ? 'bKash Merchant Checkout' : 'bKash Secure Sandbox Checkout'}
                            </h4>
                            {bkashSettings?.isEnabled && bkashSettings?.username && (
                              <span className="text-[9px] bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 px-2 py-0.5 rounded-full font-black uppercase">
                                MID: {bkashSettings.username}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-slate-500 font-bold dark:text-zinc-400">
                            {lang === 'en' 
                              ? bkashSettings?.isEnabled 
                                ? `Your payment will be processed securely using the merchant gateway account: ${bkashSettings.username || 'Active bKash Merchant'}.`
                                : 'After pressing the button, you can simulate bKash mobile verification and complete your payment safe.' 
                              : bkashSettings?.isEnabled
                                ? `আপনার পেমেন্টটি মার্চেন্ট গেটওয়ে অ্যাকাউন্ট (${bkashSettings.username || 'সক্রিয় বিকাশ মার্চেন্ট'}) এর মাধ্যমে সুরক্ষিতভাবে সম্পন্ন হবে।`
                                : 'বোতাম চাপার পর আপনি আপনার বিকাশ অ্যাকাউন্ট ভেরিফাই এবং ওটিপি কোড সিমুলেশন স্ক্রিনে প্রবেশ করবেন।'}
                          </p>
                        </div>
                      )}

                      {/* Large Final Action Order Submission Button matching the custom orange style in screenshot */}
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ea7a10] hover:bg-[#d66e0b] active:scale-98 py-3.5 text-sm font-black text-white transition-all shadow-md mt-4 cursor-pointer"
                        id="submit-order-checkout-button"
                      >
                        <Lock className="h-4.5 w-4.5 shrink-0" />
                        <span>{currentDict.placeOrderButton} {checkoutTotal.toFixed(2)}৳</span>
                      </button>

                      {/* Privacy dynamic statement disclaimer text from screenshot */}
                      <p className="text-[10px] leading-relaxed text-slate-400 dark:text-zinc-550 font-semibold text-center mt-3">
                        Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                      </p>

                    </div>
                  </div>

                </form>
              )}

              {/* STEP 2: METRIC INLINE DETAILS GATEWAY FOR MOBILE WALLET VERIFICATION */}
              {step === 'details' && (
                <form onSubmit={handleDetailsSubmit} className="space-y-4" id="payment-details-form">
                  <div className="mb-4 flex items-center justify-between rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 font-semibold">{dict.bKashPrompt}</span>
                    <div className={`h-8 px-3 rounded-lg text-white font-extrabold flex items-center ${method === 'bkash' ? 'bg-pink-600' : 'bg-orange-500'}`}>
                      {method === 'bkash' ? 'bKash' : 'Nagad'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        {lang === 'en' ? 'Wallet Account Number' : 'বিকাশ/নগদ অ্যাকাউন্ট নম্বর'}
                      </label>
                      <input
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        pattern="01[3-9][0-9]{8}"
                        placeholder="017XXXXXXXX"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-800 outline-hidden focus:border-emerald-500 dark:border-slate-750 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        {lang === 'en' ? 'PIN Code' : 'অ্যাকাউন্ট পিন'}
                      </label>
                      <input
                        type="password"
                        required
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-hidden focus:border-emerald-500 dark:border-slate-750 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('choose')}
                      className="px-4 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      {lang === 'en' ? 'Back' : 'পেছনে'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md"
                      id="authorize-payment-btn"
                    >
                      {lang === 'en' ? 'Send OTP verification' : 'ওটিপি কোড পাঠান'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: OTP ENTER VERIFICATION */}
              {step === 'otp' && (
                <form onSubmit={handleOtpSubmit} className="space-y-4" id="otp-submission-form">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center dark:bg-emerald-950/10 dark:border-emerald-900">
                    <p className="text-xs text-slate-500">
                      {lang === 'en'
                        ? 'We have sent a simulated one-time password to your account'
                        : 'আমরা আপনার দেওয়া মোবাইল নম্বরে একটি ওটিপি কোড পাঠিয়েছি।'}
                    </p>
                    <p className="text-sm font-bold text-slate-850 dark:text-white mt-1">
                      OTP Sent to: <span className="font-mono text-emerald-600">{phoneNumber || 'Protected Account'}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 text-center">
                      {dict.enterOTP}
                    </label>
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      placeholder="XXXXXX"
                      className="w-full text-center tracking-widest rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg font-black text-slate-850 outline-hidden focus:border-emerald-500 dark:border-slate-750 dark:bg-slate-900 dark:text-white"
                      id="otp-input"
                    />
                    <span className="block text-center text-xs text-slate-400 mt-2 font-semibold">
                      Resend OTP in {timer} seconds
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600 shadow-md"
                    id="confirm-transaction-btn"
                  >
                    {dict.submitOTP}
                  </button>
                </form>
              )}

              {/* STEP 4: SUCCESS PAGE */}
              {step === 'success' && (
                <div className="text-center py-6 space-y-4" id="payment-success-card">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-650 text-emerald-600 dark:bg-emerald-950/50">
                    <CheckCircle className="h-10 w-10 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {dict.paymentSuccess}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === 'en'
                        ? 'Your order has been filed successfully, preparing delivery runner.'
                        : 'আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে। রান্না শুরু হচ্ছে।'}
                    </p>
                  </div>

                  {/* Mock Billing Invoice detail */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-800 text-left space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Charged</span>
                      <span className="font-extrabold text-slate-800 dark:text-white">{checkoutTotal.toFixed(2)} ৳</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{lang === 'en' ? 'Delivery Area' : 'ডেলিভারি এলাকা'}</span>
                      <span className="font-extrabold text-slate-800 dark:text-white">
                        {lang === 'en' ? 'Inside Dhaka City' : 'ঢাকা সিটির ভেতরে'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Status</span>
                      <span className="font-bold text-emerald-600 uppercase">
                        {method === 'cod' ? 'COD - Pending / হাতে পেয়ে পরিশোধ' : 'Paid / পরিশোধিত'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinish}
                    className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    id="finish-payment-btn"
                  >
                    {lang === 'en' ? 'Start Delivery tracking' : 'ডেলিভারি ট্র্যাকিং শুরু করুন'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Security Badges */}
          {step !== 'success' && (
            <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>SSL SECURE CHECKOUT</span>
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

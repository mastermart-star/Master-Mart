import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bike, Phone, Clock, Navigation, CheckCircle2, ShieldAlert, Award, X } from 'lucide-react';
import { Order } from '../types';

interface DeliveryTrackingProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: string, stepProgress: number) => void;
  onDismiss?: (orderId: string) => void;
  lang: 'en' | 'bn';
  dict: any;
}

export const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  order,
  onUpdateStatus,
  onDismiss,
  lang,
  dict
}) => {
  const [etaSeconds, setEtaSeconds] = useState(300); // 5 minutes mock
  const [driverStage, setDriverStage] = useState(0); // index 0-3
  const [simSpeed, setSimSpeed] = useState(1); // multiplier
  const [callRiderMsg, setCallRiderMsg] = useState('');

  // Start animated ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - simSpeed;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [simSpeed]);

  // Handle active steps sync representing driver status
  useEffect(() => {
    if (etaSeconds <= 0) {
      if (order.status !== 'delivered') {
        onUpdateStatus(order.id, 'delivered', 100);
      }
      return;
    }

    if (etaSeconds > 220) {
      if (order.status !== 'preparing') {
        onUpdateStatus(order.id, 'preparing', 25);
      }
    } else if (etaSeconds > 40) {
      if (order.status !== 'on_the_way') {
        onUpdateStatus(order.id, 'on_the_way', 65);
      }
    } else {
      if (order.status !== 'delivered' && etaSeconds <= 5) {
        onUpdateStatus(order.id, 'delivered', 100);
      }
    }
  }, [etaSeconds, order.id, order.status, onUpdateStatus]);

  // Convert seconds to clean form
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    const formattedS = s < 10 ? `0${s}` : s;
    return lang === 'en' ? `${mins}:${formattedS} mins` : `${mins}:${formattedS} মিনিট`;
  };

  const handleCallRider = () => {
    setCallRiderMsg(lang === 'en' ? '📞 Dialing Rakib (+880-1823-990...) Dialing confirmed!' : '📞 রাকিবের নম্বরে কল হচ্ছে (+৮৮০-১৮২৩-৯৯০...)');
    setTimeout(() => {
      setCallRiderMsg('');
    }, 3500);
  };

  // Determine bike coordinate along SVG line
  const bikeProgress = 100 - (etaSeconds / 300) * 100;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900" id={`live-tracker-${order.id}`}>
      {/* Tracker Title Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
            <Bike className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 dark:text-white">
              {dict.orderTracking}
            </h3>
            <p className="text-xs text-slate-400">Order ID: #{order.id}</p>
          </div>
        </div>

        {/* ETA Widget */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl dark:bg-slate-950/60">
            <Clock className="h-4 w-4 text-emerald-500" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block">{dict.eta}</span>
              <span className="text-sm font-black text-slate-800 dark:text-white">
                {order.status === 'delivered' ? (lang === 'en' ? 'Arrived!' : 'পৌঁছেছে!') : formatTime(etaSeconds)}
              </span>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(order.id)}
              className="p-2 hover:bg-slate-150 text-slate-400 hover:text-slate-600 dark:hover:bg-slate-850 rounded-xl transition-all"
              title={lang === 'en' ? 'Dismiss Tracking' : 'ট্র্যাকিং বন্ধ করুন'}
              id={`dismiss-tracking-btn-${order.id}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* STAGE TIMELINE STEPS */}
      <div className="mt-6 grid grid-cols-4 gap-2 relative">
        {/* Connector bar background */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800 -z-0 rounded-full" />
        
        {/* Animated active path connector */}
        <div 
          className="absolute top-4 left-4 h-1 bg-emerald-500 transition-all duration-500 -z-0 rounded-full"
          style={{ width: `${Math.min(96, order.stepProgress)}%` }}
        />

        {/* Placed */}
        <div className="text-center z-10 flex flex-col items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
            order.stepProgress >= 10 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
          }`}>
            <span className="text-xs font-bold">1</span>
          </div>
          <span className="mt-2 block text-xs font-bold text-slate-700 dark:text-slate-350">{dict.orderPlaced}</span>
        </div>

        {/* Packing */}
        <div className="text-center z-10 flex flex-col items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
            order.stepProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
          }`}>
            <span className="text-xs font-bold">2</span>
          </div>
          <span className="mt-2 block text-xs font-bold text-slate-700 dark:text-slate-350">{dict.orderPrepared}</span>
        </div>

        {/* On The Way */}
        <div className="text-center z-10 flex flex-col items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
            order.stepProgress >= 65 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
          }`}>
            <span className="text-xs font-bold">3</span>
          </div>
          <span className="mt-2 block text-xs font-bold text-slate-700 dark:text-slate-350">{dict.onTheWay}</span>
        </div>

        {/* Arrived */}
        <div className="text-center z-10 flex flex-col items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
            order.status === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
          }`}>
            <span className="text-xs font-bold">4</span>
          </div>
          <span className="mt-2 block text-xs font-bold text-slate-700 dark:text-slate-350">{dict.delivered}</span>
        </div>
      </div>

      {/* MAP CANVAS ANIMATIONS / SVG */}
      <div className="mt-6 relative h-40 w-full overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900" />
        
        {/* Simulated Streets Grid background */}
        <svg className="absolute inset-0 h-full w-full opacity-35 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <path d="M-10,30 L500,30 M-10,90 L500,90 M-40,130 L500,130 M120,-10 L120,200 M280,-10 L280,200 M410,-10 L410,200" stroke="#888" strokeWidth="2" strokeDasharray="3,5" fill="none" />
          <polyline points="30,130 120,130 120,30 280,30 280,90 410,90" stroke="#bbb" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Active Rider Path Indicator */}
          <polyline points="30,130 120,130 120,30 280,30 280,90 410,90" stroke="#10b981" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="400" strokeDashoffset={`${350 - (bikeProgress / 100) * 350}`} />
        </svg>

        {/* Landmarks */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-850 dark:bg-red-955 dark:text-red-400 border border-red-100/30 dark:border-red-900/30 shadow-xs">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <Navigation className="h-2.5 w-2.5 text-red-500" />
          <span>{order.kfcOutlet ? `Outlet: ${order.kfcOutlet}` : (lang === 'en' ? 'Dhanmondi Hub' : 'ধানমন্ডি হাব')}</span>
        </div>
        <div className="absolute top-16 right-16 flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <Navigation className="h-2.5 w-2.5 text-blue-500" />
          <span>{lang === 'en' ? 'Rayer Bazar Intersection' : 'রায়ের বাজার মোড়'}</span>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
          <Navigation className="h-2.5 w-2.5" />
          <span>{lang === 'en' ? 'Your House' : 'আপনার বাসা'}</span>
        </div>

        {/* Moving Delivery Rider node on the map */}
        {order.status !== 'delivered' && (
          <div
            className="absolute h-8 w-8 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center transition-all duration-1000 border-2 border-emerald-500"
            style={{
              left: `${Math.max(8, Math.min(88, 10 + (bikeProgress / 100) * 80))}%`,
              top: `${Math.max(15, Math.min(75, 70 - Math.sin((bikeProgress / 100) * Math.PI) * 45))}%`,
            }}
          >
            <Bike className="h-4.5 w-4.5 text-emerald-400 animate-bounce" />
          </div>
        )}

        {/* Active tracking radar if Delivered */}
        {order.status === 'delivered' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white backdrop-blur-xs p-4 text-center z-30">
            <CheckCircle2 className="h-10 w-10 text-emerald-450 animate-pulse" />
            <span className="font-extrabold text-sm mt-3">{lang === 'en' ? 'Package Delivered!' : 'পণ্য পৌঁছে গিয়েছে!'}</span>
            <span className="text-[10px] text-slate-400 mb-3">{lang === 'en' ? 'Thanks for ordering with Master Mart' : 'মাস্টার মার্টের সাথে থাকার জন্য ধন্যবাদ'}</span>
            {onDismiss && (
              <button
                onClick={() => onDismiss(order.id)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all shadow-md transform hover:scale-105"
                id={`dismiss-delivered-${order.id}`}
              >
                {lang === 'en' ? 'Dismiss Tracking' : 'ট্র্যাকার বন্ধ করে মূল পেজে ফিরুন'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIDER & SPEED ACCELERATOR CONTROLLERS */}
      <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt="Delivery Rider Rakib"
                className="h-12 w-12 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">Your Delivery Hero</span>
              <span className="text-sm font-extrabold text-slate-950 dark:text-white">Rakib Uddin (রাকিব)</span>
              <div className="flex items-center gap-1.5 text-xs text-yellow-600 mt-0.5">
                <Award className="h-3 w-3 fill-current text-yellow-500" />
                <span>Rating: 4.9 (420 deliveries)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCallRider}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xs transition-transform hover:scale-105"
            id="call-rider-btn"
          >
            <Phone className="h-4.5 w-4.5" />
          </button>
        </div>

        {callRiderMsg && (
          <div className="mt-3 text-xs text-center font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 animate-pulse">
            {callRiderMsg}
          </div>
        )}

        {/* Speed accelerator simulator */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase">{lang === 'en' ? 'Simulator options:' : 'সিমুলেটর অপশন:'}</span>
          <div className="flex gap-1.5">
            {[1, 5, 20].map((s) => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                className={`px-3 py-1 text-[10px] font-extrabold rounded-lg border transition-all ${
                  simSpeed === s
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-500 dark:border-emerald-500'
                    : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                }`}
                id={`sim-speed-btn-${s}`}
              >
                {s}x {lang === 'en' ? 'Speed' : 'গতি'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

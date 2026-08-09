import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, Image, Check, ShoppingBag, Layers, Percent, Heart, Upload } from 'lucide-react';
import { Product, Category } from '../types';

interface AddProductModalProps {
  onClose: () => void;
  onAddProduct: (newProduct: Product) => Promise<void>;
  categories: Category[];
  lang: 'en' | 'bn';
  dict: any;
}

// Preset high quality Unsplash quick commerce images to make addition super easy
const IMAGE_PRESETS = [
  {
    labelEn: 'Apples / Fruits',
    labelBn: 'আপেল / ফলমূল',
    url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400',
    category: 'vegetables-fruits'
  },
  {
    labelEn: 'Veggies',
    labelBn: 'শাকসবজি',
    url: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=400',
    category: 'vegetables-fruits'
  },
  {
    labelEn: 'Fish',
    labelBn: 'রুই মাছ',
    url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=400',
    category: 'fish-meat'
  },
  {
    labelEn: 'Beef Meat',
    labelBn: 'গরুর মাংস',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
    category: 'fish-meat'
  },
  {
    labelEn: 'Chicken',
    labelBn: 'মুরগির মাংস',
    url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400',
    category: 'fish-meat'
  },
  {
    labelEn: 'Eggs',
    labelBn: 'ডিম',
    url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400',
    category: 'dairy-bakery-eggs'
  },
  {
    labelEn: 'Organic Milk',
    labelBn: 'দুধ ও ডেইরি',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
    category: 'dairy-bakery-eggs'
  },
  {
    labelEn: 'Spices / Masala',
    labelBn: 'মশলা ও হলুদ গুঁড়ো',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
    category: 'masala-oil-more'
  },
  {
    labelEn: 'Mustard Oil',
    labelBn: 'সরিষার তেল',
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
    category: 'masala-oil-more'
  },
  {
    labelEn: 'Organic Honey',
    labelBn: 'অর্গানিক মধু',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    category: 'organic-health'
  },
  {
    labelEn: 'Soft Drinks',
    labelBn: 'কোমল পানীয়',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
    category: 'beverages'
  },
  {
    labelEn: 'Potato Chips',
    labelBn: 'চিপস ও স্ন্যাক্স',
    url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&q=80&w=400',
    category: 'snacks-sweets'
  }
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  onClose,
  onAddProduct,
  categories,
  lang,
  dict
}) => {
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [category, setCategory] = useState(categories[1]?.id || 'vegetables-fruits');
  const [price, setPrice] = useState<number>(100);
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [unitEn, setUnitEn] = useState('1 kg');
  const [unitBn, setUnitBn] = useState('১ কেজি');
  const [image, setImage] = useState(IMAGE_PRESETS[0].url);
  const [stock, setStock] = useState<number>(10);
  const [dietaryType, setDietaryType] = useState<'veg' | 'non-veg' | 'none'>('veg');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(lang === 'en' ? 'Please upload an image file (PNG/JPG/WEBP/GIF)!' : 'দয়া করে একটি ইমেজ ফাইল (PNG/JPG/WEBP/GIF) আপলোড করুন!');
      return;
    }
    if (file.size > 1500000) {
      setErrorMsg(lang === 'en' ? 'Image size must be less than 1.5MB! Or paste a direct image URL.' : 'ছবির সাইজ ১.৫ মেগাবাইটের কম হতে হবে! অথবা সরাসরি ছবির লিংক পেস্ট করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setImage(uploadEvent.target.result as string);
        setSuccessMsg(lang === 'en' ? 'Image uploaded and processed successfully!' : 'ছবিটি সফলভাবে আপলোড এবং প্রসেস করা হয়েছে!');
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    };
    reader.onerror = () => {
      setErrorMsg(lang === 'en' ? 'Failed to read image file.' : 'ইমেজ ফাইল পড়তে ব্যর্থ হয়েছে।');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Auto-detect a close preset image match and set appropriate dietary defaults when category changes
  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    const preset = IMAGE_PRESETS.find(p => p.category === catId);
    if (preset) {
      setImage(preset.url);
    }
    
    // Auto-detect dietary type based on category
    if (catId === 'vegetables-fruits') {
      setDietaryType('veg');
    } else if (catId === 'fish-meat') {
      setDietaryType('non-veg');
    } else if (['personal-care', 'pet-care', 'household'].includes(catId)) {
      setDietaryType('none');
    } else {
      // Default other categories to none (N/A) to avoid unnecessary badge clutter
      setDietaryType('none');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameBn.trim()) {
      setErrorMsg(lang === 'en' ? 'Please fill out both English and Bengali names!' : 'দয়া করে ইংরেজি এবং বাংলা উভয় নামই পূরণ করুন!');
      return;
    }
    if (!image.trim()) {
      setErrorMsg(lang === 'en' ? 'Product image is required!' : 'প্রোডাক্টের ছবি দেওয়া আবশ্যক!');
      return;
    }
    if (price <= 0) {
      setErrorMsg(lang === 'en' ? 'Price must be greater than 0!' : 'মূল্য অবশ্যই ০ এর বেশি হতে হবে!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    let finalImageUrl = image.trim();
    if (image.startsWith('data:image')) {
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: image.trim() })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            finalImageUrl = uploadData.url;
            console.log('[Cloudinary Success] Image URL:', finalImageUrl);
          }
        }
      } catch (uploadErr) {
        console.warn('Cloudinary upload failed, using direct string:', uploadErr);
      }
    }

    const newProd: Product = {
      id: `p_db_${Date.now()}`,
      nameEn: nameEn.trim(),
      nameBn: nameBn.trim(),
      category,
      price: Number(price),
      discountPrice: discountPrice !== '' ? Number(discountPrice) : undefined,
      unitEn: unitEn.trim() || '1 kg',
      unitBn: unitBn.trim() || '১ কেজি',
      rating: 5.0, // New products start with perfect 5.0 rating
      image: finalImageUrl,
      stock: Number(stock) || 10,
      isVeg: dietaryType === 'none' ? undefined : (dietaryType === 'veg'),
      descriptionEn: descriptionEn.trim() || undefined,
      descriptionBn: descriptionBn.trim() || undefined
    };

    try {
      await onAddProduct(newProd);
      setSuccessMsg(lang === 'en' ? 'Product successfully saved to Database!' : 'পণ্যটি সফলভাবে ডাটাবেসে যোগ হয়েছে!');
      
      // Clear fields
      setNameEn('');
      setNameBn('');
      setDescriptionEn('');
      setDescriptionBn('');
      setDiscountPrice('');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error adding product:', err);
      let errMsgStr = '';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) {
            errMsgStr = parsed.error;
          } else {
            errMsgStr = err.message;
          }
        } catch (e) {
          errMsgStr = err.message;
        }
      } else {
        errMsgStr = String(err);
      }
      
      setErrorMsg(
        lang === 'en' 
          ? `Could not save to Database: ${errMsgStr}` 
          : `ডাটাবেসে সেভ করা সম্ভব হয়নি: ${errMsgStr}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[90vh]"
        id="add-product-modal-container"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 px-6 py-4 bg-linear-to-r from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-md font-black text-slate-800 dark:text-white leading-tight">
                {lang === 'en' ? 'Add New Product to Database' : 'ডাটাবেসে নতুন পণ্য যোগ করুন'}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                {lang === 'en' ? 'Full-Stack SQL Database Integration' : 'ফুল-স্ট্যাক SQL ডাটাবেস ইন্টিগ্রেশন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white transition-all cursor-pointer"
            id="close-add-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body Scroll Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5" id="add-product-form">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600 font-bold dark:bg-rose-950/20 dark:border-rose-900/30">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-600 font-bold dark:bg-emerald-950/20 dark:border-emerald-900/30 flex items-center gap-2">
              <Check className="h-4 w-4 animate-bounce" />
              {successMsg}
            </div>
          )}

          {/* Product Name Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                Product Name (English) *
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Organic Strawberries"
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                পণ্যের নাম (বাংলা) *
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: তাজা লাল স্ট্রবেরি"
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-bold"
                required
              />
            </div>
          </div>

          {/* Product Description Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                Product Description (English) - Optional
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Describe your product details..."
                rows={3}
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-medium resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                পণ্যের বিবরণ (বাংলা) - ঐচ্ছিক
              </label>
              <textarea
                value={descriptionBn}
                onChange={(e) => setDescriptionBn(e.target.value)}
                placeholder="পণ্য সম্পর্কে বিস্তারিত লিখুন..."
                rows={3}
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-medium resize-none"
              />
            </div>
          </div>

          {/* Category Select & Veg Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                {lang === 'en' ? 'Category *' : 'ক্যাটাগরি *'}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-semibold appearance-none"
                >
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'en' ? cat.nameEn : cat.nameBn}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Layers className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                {lang === 'en' ? 'Dietary Tag / Product Tag' : 'খাদ্য বিবরণ / প্রোডাক্ট ট্যাগ'}
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDietaryType('veg')}
                  className={`flex-1 rounded-xl border py-2 px-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                    dietaryType === 'veg'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-150 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  🥬 Veg / নিরামিষ
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryType('non-veg')}
                  className={`flex-1 rounded-xl border py-2 px-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                    dietaryType === 'non-veg'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                      : 'border-slate-150 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  🥩 Non-Veg / আমিষ
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryType('none')}
                  className={`flex-1 rounded-xl border py-2 px-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                    dietaryType === 'none'
                      ? 'bg-slate-500/10 border-slate-500 text-slate-600 dark:text-slate-400'
                      : 'border-slate-150 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  🚫 N/A / প্রযোজ্য নয়
                </button>
              </div>
            </div>
          </div>

          {/* Pricing, Units & Stock */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                {lang === 'en' ? 'Price (TK) *' : 'মূল্য (টাকা) *'}
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min="1"
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-extrabold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider flex items-center gap-1">
                {lang === 'en' ? 'Discount Price' : 'ডিসকাউন্ট মূল্য'}
                <Percent className="h-3 w-3 text-emerald-500" />
              </label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={lang === 'en' ? 'Optional' : 'ঐচ্ছিক'}
                min="0"
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-extrabold text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                {lang === 'en' ? 'Unit En *' : 'ইউনিট En *'}
              </label>
              <input
                type="text"
                value={unitEn}
                onChange={(e) => setUnitEn(e.target.value)}
                placeholder="e.g. 1 kg / 500 g / 1 pc"
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                {lang === 'en' ? 'ইউনিট Bn *' : 'ইউনিট Bn *'}
              </label>
              <input
                type="text"
                value={unitBn}
                onChange={(e) => setUnitBn(e.target.value)}
                placeholder="যেমন: ১ কেজি / ৫০০ গ্রাম"
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                {lang === 'en' ? 'Stock Level *' : 'স্টক পরিমাণ *'}
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                min="1"
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-extrabold"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                {lang === 'en' ? 'Custom Image URL' : 'কাস্টম ইমেজ লিংক'}
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-150 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 font-mono text-[10px]"
              />
            </div>
          </div>

          {/* Product Image Manager */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4.5 bg-slate-50/30 dark:bg-slate-950/20 space-y-3">
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
              {lang === 'en' ? 'Product Image Manager' : 'পণ্যের ছবি ম্যানেজার'}
            </label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Live Image Preview Frame */}
              <div className="relative h-28 w-28 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 shrink-0 shadow-inner flex items-center justify-center group">
                {image ? (
                  <>
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594782078968-2b07656d7bb2?auto=format&fit=crop&q=80&w=200';
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-md">
                        {lang === 'en' ? 'Active' : 'সক্রিয়'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-center p-2">
                    <Image className="h-7 w-7 mx-auto mb-1 opacity-50" />
                    <span className="text-[9px] font-semibold uppercase block leading-tight">No Image</span>
                  </div>
                )}
              </div>

              {/* Drag and Drop File Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-200 text-center cursor-pointer select-none relative ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/10'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900 dark:hover:border-slate-700'
                }`}
                onClick={() => document.getElementById('product-file-upload')?.click()}
              >
                <input
                  type="file"
                  id="product-file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className={`h-6 w-6 mb-1.5 transition-transform duration-200 ${isDragging ? 'text-emerald-500 scale-110' : 'text-slate-400 dark:text-slate-500'}`} />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Drag & Drop your image file here' : 'এখানে আপনার ছবি ড্র্যাগ করে ছেড়ে দিন'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">
                  {lang === 'en' ? 'Or click to browse from device (Max 1.5MB)' : 'অথবা ডিভাইস থেকে ফাইল সিলেক্ট করতে ক্লিক করুন (সর্বোচ্চ ১.৫ MB)'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Commerce Image Presets Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-2 tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              {lang === 'en' ? 'Or Choose a Premium Preset Image' : 'অথবা নিচের কোনো প্রিমিয়াম ছবি সিলেক্ট করুন'}
            </label>
            <div className="flex overflow-x-auto gap-2 pb-2 snap-x scrollbar-thin" id="image-preset-selector-grid">
              {IMAGE_PRESETS.map((preset, idx) => {
                const isSelected = image === preset.url;
                return (
                  <button
                    key={`preset-${idx}`}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square shrink-0 w-20 sm:w-24 border-2 transition-all cursor-pointer group snap-start ${
                      isSelected ? 'border-emerald-500 shadow-md scale-102 ring-2 ring-emerald-500/20' : 'border-slate-100 hover:border-slate-200 dark:border-slate-800'
                    }`}
                    title={lang === 'en' ? preset.labelEn : preset.labelBn}
                  >
                    <img
                      src={preset.url}
                      alt={preset.labelEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 px-1 text-[8px] font-black text-white text-center truncate">
                      {lang === 'en' ? preset.labelEn : preset.labelBn}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex items-center justify-end gap-3.5 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-150 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-all cursor-pointer"
            >
              {lang === 'en' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
              id="save-new-product-btn"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{isLoading ? (lang === 'en' ? 'Saving...' : 'সেভ হচ্ছে...') : (lang === 'en' ? 'Save Product' : 'পণ্য সেভ করুন')}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

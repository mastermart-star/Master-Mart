import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MessageSquarePlus, User, CornerDownRight } from 'lucide-react';
import { Product, ProductReview } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  lang: 'en' | 'bn';
  dict: any;
  reviews: ProductReview[];
  onAddReview: (comment: string, rating: number, userName: string) => void;
  quantityInCart: number;
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  lang,
  dict,
  reviews,
  onAddReview,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart
}) => {
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Calculate stats
  const remainingStock = Math.max(0, product.stock - quantityInCart);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const totalReviews = productReviews.length;
  const avgRating = totalReviews > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : product.rating;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      setErrorMsg(dict.enterReviewError);
      return;
    }
    onAddReview(comment, userRating, userName);
    setUserName('');
    setComment('');
    setUserRating(5);
    setErrorMsg('');
    setSuccessMsg(lang === 'en' ? 'Review posted successfully!' : 'মতামত সফলভাবে যোগ হয়েছে!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getProductDescription = (prod: Product, l: 'en' | 'bn', d: any) => {
    if (l === 'en' && prod.descriptionEn) {
      return prod.descriptionEn;
    }
    if (l === 'bn' && prod.descriptionBn) {
      return prod.descriptionBn;
    }

    const category = prod.category || 'all';
    const nameLower = (prod.nameEn || '').toLowerCase();

    // Specific product matches
    if (nameLower.includes('rui fish') || nameLower.includes('রুই')) {
      return l === 'en'
        ? `Freshwater Rui Fish, sourced from local premium rivers and clean fisheries. Expertly cleaned, cut into neat slices, and delivered fresh under strict temperature control within ${d.deliveryTime}.`
        : `তাজা নদীর রুই মাছ, যা স্থানীয় বিশ্বস্ত জলাশয় থেকে সংগৃহীত। অত্যন্ত চমৎকার ও স্বাস্থ্যকর উপায়ে কাটা ও আঁশ পরিষ্কার করা হয়েছে। পুষ্টিমান ও ফ্রেশ সতেজতা বজায় রাখতে ${d.deliveryTime}-এর মধ্যে ডেলিভারি দেওয়া হবে।`;
    }
    if (nameLower.includes('beef') || nameLower.includes('গরু')) {
      return l === 'en'
        ? `Premium quality, tender beef. Processed under 100% halal and hygienic conditions. Sourced responsibly and delivered chilled within ${d.deliveryTime} to ensure absolute freshness.`
        : `১০০% হালাল ও অত্যন্ত স্বাস্থ্যসম্মত উপায়ে প্রক্রিয়াজাতকৃত প্রিমিয়াম কোয়ালিটির গরুর মাংস। সতেজতা ও সেরা স্বাদ অক্ষুণ্ণ রাখতে সম্পূর্ণ কোল্ড চেইন বজায় রেখে ${d.deliveryTime}-এর মধ্যে দ্রুত ডেলিভারি করা হয়।`;
    }
    if (nameLower.includes('chicken') || nameLower.includes('মুরগি')) {
      return l === 'en'
        ? `Fresh broiler chicken (clean cut). Processed under 100% halal and hygienic conditions. Sourced responsibly and delivered chilled within ${d.deliveryTime} to ensure absolute freshness.`
        : `১০০% হালাল ও অত্যন্ত স্বাস্থ্যসম্মত উপায়ে প্রক্রিয়াজাতকৃত প্রিমিয়াম কোয়ালিটির তাজা ব্রয়লার মুরগির মাংস। সতেজতা ও সেরা স্বাদ অক্ষুণ্ণ রাখতে সম্পূর্ণ কোল্ড চেইন বজায় রেখে ${d.deliveryTime}-এর মধ্যে দ্রুত ডেলিভারি করা হয়।`;
    }
    if (nameLower.includes('mustard oil') || nameLower.includes('সরিষা')) {
      return l === 'en'
        ? `Pure, cold-pressed Ghani Mustard Oil made from selected premium grade mustard seeds. Free from chemicals and full of natural aroma to elevate your traditional cooking.`
        : `সেরা মানের বাছাইকৃত সরিষার বীজ থেকে ঘানিতে ভাঙানো খাঁটি সরিষার তেল। রাসায়নিকমুক্ত, ঝাঁঝালো ও প্রাকৃতিক সুবাসে ভরপুর যা আপনার রান্নায় যোগ করবে দারুণ স্বাদ ও তৃপ্তি।`;
    }
    if (nameLower.includes('honey') || nameLower.includes('মধু')) {
      return l === 'en'
        ? `100% natural, pure organic Honey gathered from the pristine forests of Sundarban. High in antioxidant properties, absolutely raw and unprocessed for maximum health benefits.`
        : `সুন্দরবনের প্রাকৃতিক মৌচাক থেকে সংগৃহীত ১০০% খাঁটি ও প্রাকৃতিক মধু। কোনো প্রকার কৃত্রিম মিষ্টি বা ভেজাল মুক্ত, উচ্চ অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ ও সম্পূর্ণ র এবং প্রাকৃতিক গুণাবলী সম্পন্ন।`;
    }
    if (nameLower.includes('chia') || nameLower.includes('চিয়া')) {
      return l === 'en'
        ? `Super premium, organic Chia Seeds rich in Omega-3 fatty acids, fiber, and essential minerals. Excellent for weight management, detoxification, and boosting daily energy levels.`
        : `সর্বোচ্চ পুষ্টিগুণ সম্পন্ন অর্গানিক চিয়া সীড প্রিমিয়াম। এটি ওমেগা-৩ ফ্যাটি অ্যাসিড, ডায়েটারি ফাইবার এবং অ্যান্টিঅক্সিডেন্টে ভরপুর। ওজন নিয়ন্ত্রণ এবং দৈনন্দিন এনার্জি বুস্ট করতে অত্যন্ত কার্যকরী।`;
    }
    if (nameLower.includes('dog food') || nameLower.includes('pet') || nameLower.includes('cat') || nameLower.includes('বিড়াল')) {
      return l === 'en'
        ? `Nutritious, high-quality formulated pet food designed to keep your beloved pet healthy, active, and full of energy. Packed with vitamins and essential proteins.`
        : `আপনার আদরের পোষা প্রাণীর জন্য অত্যন্ত সুস্বাদু এবং সুষম পুষ্টিসমৃদ্ধ খাবার। ভিটামিন, ক্যালসিয়াম এবং প্রয়োজনীয় প্রোটিন সমৃদ্ধ যা তাদের সুস্থ, চনমনে এবং রোগমুক্ত রাখতে সাহায্য করে।`;
    }

    // Category fallbacks
    switch (category) {
      case 'vegetables-fruits':
        return l === 'en'
          ? `Freshly harvested, premium grade vegetables and fruits. Sourced directly from local organic farms and delivered fresh within ${d.deliveryTime} to preserve nutrients and crispness.`
          : `সদ্য তোলা, প্রিমিয়াম কোয়ালিটির তাজা শাকসবজি ও ফলমূল। সরাসরি স্থানীয় অর্গানিক খামার থেকে সংগৃহীত এবং পুষ্টি ও সতেজতা বজায় রাখতে ${d.deliveryTime}-এর মধ্যে দ্রুত ডেলিভারি করা হয়।`;

      case 'fish-meat':
        return l === 'en'
          ? `Premium quality meat and fish, sourced responsibly under strict hygiene standards. Processed carefully and delivered chilled within ${d.deliveryTime} to guarantee fresh, delicious materials right at your doorstep.`
          : `সেরা মানের মাংস এবং মাছ, যা কঠোর স্বাস্থ্যবিধি মেনে নির্ভরযোগ্য উৎস থেকে সংগৃহীত। যত্নসহকারে প্রক্রিয়াজাত করে ঠান্ডা অবস্থায় ${d.deliveryTime}-এর মধ্যে ফ্রেশ অবস্থায় আপনার দোরগোড়ায় পৌঁছে যাওয়া নিশ্চিত করা হয়।`;

      case 'dairy-bread-eggs':
        return l === 'en'
          ? `Daily essentials like fresh dairy products, organic eggs, and freshly baked bread. Carefully handled and delivered within ${d.deliveryTime} to ensure peak freshness for your daily breakfast.`
          : `দৈনন্দিন প্রয়োজনীয় তাজা দুগ্ধজাত পণ্য, ডিম এবং সদ্য প্রস্তুতকৃত নরম রুটি। আপনার সকালের নাস্তায় সর্বোচ্চ সতেজতা নিশ্চিত করতে যত্নসহকারে ${d.deliveryTime}-এর মধ্যে ডেলিভারি করা হয়।`;

      case 'snacks-munchies':
        return l === 'en'
          ? `Crispy, delicious snacks and munchies for your perfect break time. Packaged professionally to retain crispiness and delivered within ${d.deliveryTime} for your instant cravings.`
          : `আপনার অবসরের আড্ডাকে আরও জমিয়ে তুলতে মুচমুচে ও সুস্বাদু স্ন্যাক্স। ক্রিস্পিনেস বজায় রাখতে প্রফেশনাল প্যাকেজিংয়ে আপনার তাৎক্ষণিক ক্ষুধা মেটাতে ${d.deliveryTime}-এর মধ্যে দ্রুত ডেলিভারি করা হয়।`;

      case 'cold-drinks':
        return l === 'en'
          ? `Refreshing cold drinks and premium juices to quench your thirst. Handled with care and delivered chilled within ${d.deliveryTime} to keep you instantly energized.`
          : `আপনার তৃষ্ণা মেটাতে রিফ্রেশিং শীতল কোমল পানীয় এবং প্রিমিয়াম জুস। আপনাকে তাৎক্ষণিকভাবে সতেজ ও চনমনে রাখতে অত্যন্ত যত্নসহকারে ঠান্ডা অবস্থায় ${d.deliveryTime}-এর মধ্যে ডেলিভারি করা হয়।`;

      case 'staples':
        return l === 'en'
          ? `High-grade pantry essentials including premium quality flour, aromatic rice, and nutritious lentils. Double-cleaned, securely packaged, and delivered within ${d.deliveryTime} for your family's health.`
          : `উচ্চ মানের নিত্যপ্রয়োজনীয় খাদ্যসামগ্রী যেমন প্রিমিয়াম আটা, সুগন্ধি চাল এবং পুষ্টিকর ডাল। ডাবল-ক্লিনড এবং সুরক্ষিত প্যাকেজিংয়ে ${d.deliveryTime}-এর মধ্যে আপনার ঘরে পৌঁছে দেওয়া হয়।`;

      case 'personal-care':
        return l === 'en'
          ? `Premium personal care, skincare, and hygiene products from trusted global brands. Handled safely and delivered directly to your doorstep within ${d.deliveryTime}.`
          : `বিশ্বস্ত ব্র্যান্ডের প্রিমিয়াম পার্সোনাল কেয়ার, স্কিনকেয়ার এবং হাইজিন পণ্য। সম্পূর্ণ সুরক্ষিতভাবে সরাসরি আপনার দোরগোড়ায় ${d.deliveryTime}-এর মধ্যে পৌঁছে দেওয়া হয়।`;

      case 'masala-oil-more':
        return l === 'en'
          ? `Pure, aromatic spices and premium oils to elevate your everyday cooking. Carefully selected from premium grade crops and delivered within ${d.deliveryTime} with maximum quality check.`
          : `আপনার রান্নায় খাঁটি স্বাদ ও সুগন্ধ যোগ করতে বিশুদ্ধ মসলা এবং প্রিমিয়াম তেল। প্রিমিয়াম গ্রেডের শস্য থেকে প্রস্তুতকৃত এবং ${d.deliveryTime}-এর মধ্যে সর্বোচ্চ যত্নসহকারে ডেলিভারি করা হয়।`;

      case 'organic-health':
        return l === 'en'
          ? `100% organic, nutrient-rich, and healthy superfoods sourced from natural environments. Certified safe and delivered within ${d.deliveryTime} for your healthy lifestyle.`
          : `১০০% অর্গানিক, পুষ্টিসমৃদ্ধ এবং স্বাস্থ্যকর সুপারফুড যা সম্পূর্ণ প্রাকৃতিক পরিবেশ থেকে সংগৃহীত। আপনার সুস্থ জীবনযাত্রার জন্য সম্পূর্ণ নিরাপদ এবং ${d.deliveryTime}-এর মধ্যে ডেলিভারি করা হয়।`;

      case 'pet-care':
        return l === 'en'
          ? `Premium nutritious food and essential supplies for your beloved pets. Sourced from authentic global brands and delivered safely within ${d.deliveryTime}.`
          : `আপনার আদরের পোষা প্রাণীর জন্য প্রিমিয়াম পুষ্টিকর খাবার এবং প্রয়োজনীয় সামগ্রী। বিশ্বস্ত গ্লোবাল ব্র্যান্ড থেকে আমদানিকৃত এবং ${d.deliveryTime}-এর মধ্যে নিরাপদে ডেলিভারি করা হয়।`;

      case 'household':
        return l === 'en'
          ? `Essential household cleaning supplies and home utility products. Sourced for peak effectiveness and delivered within ${d.deliveryTime} under hygienic packaging.`
          : `প্রয়োজনীয় গৃহস্থালী পরিচ্ছন্নতা সামগ্রী এবং হোম ইউটিলিটি পণ্য। সর্বোচ্চ কার্যকারিতার জন্য বিশ্বস্ত উৎস থেকে সংগৃহীত এবং ${d.deliveryTime}-এর মধ্যে সুরক্ষিত প্যাকেজিংয়ে ডেলিভারি করা হয়।`;

      default:
        return l === 'en'
          ? `Premium quality product, sourced responsibly and delivered fresh within ${d.deliveryTime} to guarantee fresh, high-quality materials right at your doorstep with quick-commerce priority.`
          : `তাজা এবং প্রিমিয়াম কোয়ালিটির পণ্য। সরাসরি নির্ভরযোগ্য উৎস থেকে সংগৃহীত এবং ${d.deliveryTime} এর মধ্যে ফ্রেশ ও সুরক্ষিত অবস্থায় আপনার দোরগোড়ায় পৌঁছে যাওয়া নিশ্চিত করে মাস্টার মার্ট।`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
        id="product-details-modal"
      >
        {/* Header - Sticky Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-800 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          id="close-details-modal-btn"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Product Column Image */}
            <div className="flex flex-col items-center">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-850">
                <img
                  src={product.image}
                  alt={lang === 'en' ? product.nameEn : product.nameBn}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Status & Highlights */}
              <div className="mt-4 w-full rounded-xl bg-emerald-500/5 p-4 border border-emerald-500/10 dark:bg-emerald-950/10">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500 p-2 text-white">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dict.reviewsTab}</h4>
                    <p className="text-base font-black text-slate-800 dark:text-slate-100">
                      {avgRating} / 5.0 <span className="text-xs text-slate-500 font-medium">({totalReviews} Reviews)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Specs & Buy Column */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  {dict.deliveryTime}
                </span>
                {product.isVeg !== undefined && product.isVeg !== null && (
                  <span className="text-xs text-slate-500 font-semibold">
                    {product.isVeg ? `🟢 ${dict.vegTag}` : `🔴 ${dict.nonVegTag}`}
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {lang === 'en' ? product.nameEn : product.nameBn}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {lang === 'en' ? 'Category' : 'ক্যাটাগরি'}: {product.category} | {lang === 'en' ? 'Unit' : 'পরিমাপ'}: {lang === 'en' ? product.unitEn : product.unitBn}
              </p>

              {/* Stock Status Badge */}
              <div className="mt-2.5">
                {remainingStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {lang === 'en' ? `In Stock: ${remainingStock} units available` : `স্টকে আছে: ${remainingStock} পিস পাওয়া যাবে`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    {lang === 'en' ? 'Out of Stock / Sold Out' : 'স্টক শেষ / স্টক আউট'}
                  </span>
                )}
              </div>

              {/* Price display */}
              <div className="mt-4 flex items-baseline gap-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {dict.tk} {product.discountPrice}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {dict.tk} {product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {dict.tk} {product.price}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h4 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                  {lang === 'en' ? 'Product Description' : 'পণ্যের বর্ণনা'}
                </h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {getProductDescription(product, lang, dict)}
                </p>
              </div>

              {/* ADD to Cart inside Modal */}
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                <div>
                  <span className="text-xs font-semibold text-slate-400">{lang === 'en' ? 'Quick Purchase' : 'দ্রুত ক্রয়ের সুবিধা'}</span>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">
                    {dict.tk} {product.discountPrice || product.price}
                  </p>
                </div>
                
                <div className="w-28">
                  {quantityInCart > 0 ? (
                    <div className="flex h-10 items-center justify-between rounded-xl border border-emerald-600 bg-emerald-50 px-2 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <button
                        onClick={() => onRemoveFromCart(product)}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-emerald-200/55 dark:hover:bg-emerald-950"
                        id="modal-cart-decrease"
                      >
                        -
                      </button>
                      <span className="text-sm font-black">{quantityInCart}</span>
                      <button
                        onClick={() => {
                          if (quantityInCart < product.stock) {
                            onAddToCart(product);
                          }
                        }}
                        disabled={quantityInCart >= product.stock}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-emerald-200/55 dark:hover:bg-emerald-950 disabled:opacity-30 disabled:cursor-not-allowed"
                        id="modal-cart-increase"
                      >
                        +
                      </button>
                    </div>
                  ) : remainingStock === 0 ? (
                    <span className="text-xs font-bold text-rose-500">{dict.outOfStock}</span>
                  ) : (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-full flex h-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:bg-emerald-600"
                      id="modal-cart-add-btn"
                    >
                      {dict.addToCart}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-8 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
              {dict.reviewsHeader} ({totalReviews})
            </h3>

            {/* List Reviews */}
            <div className="space-y-4">
              {productReviews.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  {lang === 'en' ? 'No reviews yet. Be the first to leave a feedback!' : 'এখনও কোনো রিভিউ দেওয়া হয়নি। প্রথম মন্তব্যকারী হোন!'}
                </p>
              ) : (
                productReviews.map((rev) => (
                  <div key={rev.id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/30">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-350">{rev.userName}</h4>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 dark:bg-amber-950/10 dark:text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-2.5 w-2.5 fill-current text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <div className="mt-8 rounded-2xl border border-slate-100 p-6 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquarePlus className="h-5 w-5 text-emerald-500" />
                <h4 className="text-sm font-black text-slate-800 dark:text-white">
                  {dict.addReview}
                </h4>
              </div>

              {errorMsg && (
                <p className="mb-3 text-xs text-red-500 font-semibold">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="mb-3 text-xs text-emerald-500 font-semibold">{successMsg}</p>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      {dict.yourName}
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-hidden focus:border-emerald-500 dark:border-slate-750 dark:bg-slate-900 dark:text-white"
                      placeholder={lang === 'en' ? 'e.g. Shakib Al Hasan' : 'উদাঃ সাকিব আল হাসান'}
                      id="review-username-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      {dict.ratingLabel}
                    </label>
                    <div className="flex h-9 items-center gap-1.5 px-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-750">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-1 focus:outline-hidden"
                          id={`star-btn-${star}`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= userRating
                                ? 'fill-current text-amber-500'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    {dict.commentLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-hidden focus:border-emerald-500 dark:border-slate-750 dark:bg-slate-900 dark:text-white"
                    placeholder={lang === 'en' ? 'Write your experience...' : 'আপনার অভিজ্ঞতা লিখুন...'}
                    id="review-comment-input"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 focus:outline-hidden transition-all"
                    id="review-submit-btn"
                  >
                    {dict.submitReview}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

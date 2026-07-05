import React from 'react';
import { motion } from 'motion/react';
import { Star, Plus, Minus, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onOpenDetails: (p: Product) => void;
  onDeleteProduct?: (p: Product) => void;
  lang: 'en' | 'bn';
  tkLabel: string;
  offLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  onOpenDetails,
  onDeleteProduct,
  lang,
  tkLabel,
  offLabel
}) => {
  const hasDiscount = !!product.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-xs transition-shadow duration-300 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900"
    >
      {/* Discount Tag */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase shadow-xs">
          {discountPercent}% {offLabel}
        </div>
      )}

      {/* Delete button (only if onDeleteProduct is provided) */}
      {onDeleteProduct && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(lang === 'en' ? `Are you sure you want to delete ${product.nameEn}?` : `${product.nameBn} কি সত্যিই মুছে ফেলতে চান?`)) {
              onDeleteProduct(product);
            }
          }}
          className="absolute top-2 right-2 z-20 h-7 w-7 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white dark:bg-slate-950/80 dark:hover:bg-rose-600 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-xs cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={lang === 'en' ? 'Delete from Database' : 'ডাটাবেস থেকে মুছুন'}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Product Image */}
      <div
        className="relative cursor-pointer overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800"
        onClick={() => onOpenDetails(product)}
        id={`product-image-container-${product.id}`}
      >
        <img
          src={product.image}
          alt={lang === 'en' ? product.nameEn : product.nameBn}
          referrerPolicy="no-referrer"
          className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Quick details view indicator on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:bg-slate-950 dark:text-slate-150">
            {lang === 'en' ? 'Quick View' : 'বিস্তারিত দেখুন'}
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-3 flex flex-col flex-grow">
        {/* Veg/Non-Veg Tag & Rating */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {product.isVeg !== undefined && product.isVeg !== null && (
            <span
              className={`inline-block h-3.5 w-3.5 rounded-sm border p-[1px] ${
                product.isVeg
                  ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                  : 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
              }`}
            >
              <span className={`block h-1.5 w-1.5 rounded-full mx-auto my-[1.5px] ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
            </span>
          )}
          <span className="font-semibold text-slate-400">
            {lang === 'en' ? product.category.toUpperCase().replace('-', ' ') : 'স্পেশাল'}
          </span>
          <div className="ml-auto flex items-center gap-0.5 rounded-sm bg-amber-50 px-1 py-0.5 text-amber-700 dark:bg-amber-950/10 dark:text-amber-400">
            <Star className="h-2.5 w-2.5 fill-current text-amber-500" />
            <span className="font-bold text-[10px]">{product.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="mt-1.5 line-clamp-2 cursor-pointer text-sm font-semibold text-slate-800 hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400"
          onClick={() => onOpenDetails(product)}
          id={`product-title-${product.id}`}
        >
          {lang === 'en' ? product.nameEn : product.nameBn}
        </h3>

        {/* Weight / Unit & Stock Badge */}
        <div className="mt-1 flex items-center justify-between gap-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'en' ? product.unitEn : product.unitBn}
          </span>
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {lang === 'en' ? `${product.stock} In Stock` : `${product.stock} স্টকে আছে`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {lang === 'en' ? 'Out of Stock' : 'স্টক শেষ'}
            </span>
          )}
        </div>
      </div>

      {/* Action footer: Price & ADD Button */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          {hasDiscount ? (
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 line-through">
                {tkLabel} {product.price}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {tkLabel} {product.discountPrice}
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {tkLabel} {product.price}
            </span>
          )}
        </div>

        {/* Quantity Controls conforming exactly to Blinkit aesthetics: yellow-green interactive actions */}
        <div className="w-20" id={`cart-controls-${product.id}`}>
          {quantityInCart > 0 ? (
            <div className="flex h-8 items-center justify-between rounded-lg border border-emerald-600 bg-emerald-50 px-1.5 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              <button
                onClick={() => onRemoveFromCart(product)}
                className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-emerald-200/55 dark:hover:bg-emerald-900/50"
                id={`cart-decrease-${product.id}`}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs font-bold">{quantityInCart}</span>
              <button
                onClick={() => onAddToCart(product)}
                className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-emerald-200/55 dark:hover:bg-emerald-900/50"
                id={`cart-increase-${product.id}`}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : product.stock === 0 ? (
            <span className="block text-center text-xs font-semibold text-rose-500 dark:text-rose-400">
              {lang === 'en' ? 'Sold Out' : 'স্টক আউট'}
            </span>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="flex h-8 w-full items-center justify-center rounded-lg border border-emerald-500 bg-emerald-50 px-4 text-xs font-bold text-emerald-600 uppercase transition-all hover:bg-emerald-500 hover:text-white dark:border-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
              id={`cart-add-btn-${product.id}`}
            >
              {lang === 'en' ? 'ADD' : 'কিনুন'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

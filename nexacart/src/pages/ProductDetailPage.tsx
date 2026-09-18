import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types/commerce';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Check, ArrowLeft } from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (view: string, param?: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
  onAddToCart,
}) => {
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <button
        onClick={() => onNavigate('products')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Image Showcase */}
        <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Model: <strong className="font-mono text-slate-700">{product.modelNumber}</strong></span>
            <span className="text-emerald-600 font-medium">Verified Authentic Hardware</span>
          </div>
        </div>

        {/* Right: Product Spec & Buy Box */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              {product.badge && (
                <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="text-sm font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-400">· {product.reviewCount} customer reviews</span>
              <span className="text-xs text-emerald-600 font-medium ml-2">99.4% recommended</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            {product.originalPrice && (
              <span className="text-base text-slate-400 line-through">
                ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-600 ml-auto bg-emerald-50 px-2 py-0.5 rounded">
              In Stock ({product.stock} units available)
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Key Specifications */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Enterprise Features</h3>
            <ul className="space-y-2">
              {product.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart ({quantity})</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                onAddToCart(product, quantity);
                onNavigate('cart');
              }}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Buy Now with 1-Click Checkout
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Free Next-Day Air</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>3-Year Enterprise Care</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>30-Day Hassle Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

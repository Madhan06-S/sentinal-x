import React from 'react';
import { CartItem } from '../types/commerce';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

interface CartPageProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  subtotal,
  tax,
  shippingFee,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
}) => {
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your shopping cart is empty</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Explore our collection of laptops, audio, and studio workstations to start your order.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <span>Browse Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={() => onNavigate('products')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Review Your Cart</h1>
        <p className="text-xs text-slate-500 mt-1">
          {items.reduce((sum, i) => sum + i.quantity, 0)} item(s) ready for secure checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle divide-y divide-slate-100">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <h3
                    onClick={() => onNavigate('product-detail', product.id)}
                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer truncate"
                  >
                    {product.name}
                  </h3>
                  <span className="text-sm font-bold font-mono text-slate-900 ml-4">
                    ${(product.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-mono mt-0.5">{product.modelNumber}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                    <button
                      onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-semibold text-slate-800">{quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Box */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200/80 pb-3">
            Order Calculation
          </h2>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-mono font-semibold text-slate-900">
                ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Sales Tax (8.25%)</span>
              <span className="font-mono font-semibold text-slate-900">
                ${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Expedited Delivery</span>
              <span className="font-mono font-semibold text-emerald-600">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Due</span>
              <span className="font-mono text-base text-indigo-700">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted End-to-End Payment Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

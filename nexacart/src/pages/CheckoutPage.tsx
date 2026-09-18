import React, { useState } from 'react';
import { CartItem, CustomerInfo, ShippingAddress } from '../types/commerce';
import { ArrowLeft, ArrowRight, ShieldCheck, CreditCard, Building2, Truck } from 'lucide-react';

interface CheckoutPageProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  onNavigate: (view: string, param?: string) => void;
  onProceedToPayment: (customer: CustomerInfo, shipping: ShippingAddress) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  subtotal,
  tax,
  shippingFee,
  total,
  onNavigate,
  onProceedToPayment,
}) => {
  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@enterprise.io',
    phone: '+1 (555) 234-8901',
  });

  const [shipping, setShipping] = useState<ShippingAddress>({
    street: '500 Technology Square',
    apt: 'Suite 400',
    city: 'Cambridge',
    state: 'MA',
    postalCode: '02139',
    country: 'United States',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceedToPayment(customer, shipping);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('cart')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Cart</span>
      </button>

      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Express Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Customer Contact */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={customer.firstName}
                  onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={customer.lastName}
                  onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Destination */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Shipping Destination</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={shipping.street}
                  onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Review & Proceed */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200/80 pb-3">
            Summary Review
          </h2>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-200/60 pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-800">{product.name}</span>
                  <span className="text-slate-400 block">Qty: {quantity}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 shrink-0">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8.25%)</span>
              <span className="font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-mono text-emerald-600">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="font-mono text-indigo-700">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>Continue to Secure Payment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Channel</span>
          </div>
        </div>
      </form>
    </div>
  );
};

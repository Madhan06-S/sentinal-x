import React from 'react';
import { OrderConfirmation } from '../types/commerce';
import { CheckCircle2, Package, ArrowRight, Printer, ShieldCheck } from 'lucide-react';

interface OrderConfirmationPageProps {
  order: OrderConfirmation;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigate,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
          Payment Verified & Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs text-slate-500">
          Confirmation email sent to <span className="font-semibold text-slate-800">{order.customer.email}</span>
        </p>
      </div>

      {/* Order Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle divide-y divide-slate-100">
        {/* Order Meta Bar */}
        <div className="p-6 bg-slate-50/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Order Number</span>
            <span className="font-mono font-bold text-slate-900">{order.orderId}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Date</span>
            <span className="font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Total Charged</span>
            <span className="font-mono font-bold text-indigo-700">${order.total.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Status</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" /> Paid
            </span>
          </div>
        </div>

        {/* Shipping & Delivery Details */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Shipping Information</span>
            </h4>
            <p className="text-slate-700 font-medium">{order.customer.firstName} {order.customer.lastName}</p>
            <p className="text-slate-500">{order.shipping.street} {order.shipping.apt || ''}</p>
            <p className="text-slate-500">{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}</p>
            <p className="text-slate-500">{order.shipping.country}</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Estimated Delivery</h4>
            <p className="text-emerald-700 font-semibold">{order.estimatedDelivery}</p>
            <p className="text-slate-400 mt-1">Carrier: FedEx Priority Air (Tracking assigned upon dispatch)</p>
            <p className="text-slate-400 font-mono text-[11px] mt-2">TxID: {order.transactionId}</p>
          </div>
        </div>

        {/* Items list */}
        <div className="p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Items in Shipment</h4>
          {order.items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-3 min-w-0">
                <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-slate-900 block truncate">{product.name}</span>
                  <span className="text-slate-400">Qty: {quantity} · ${product.price.toFixed(2)} each</span>
                </div>
              </div>
              <span className="font-mono font-semibold text-slate-900 ml-4 shrink-0">
                ${(product.price * quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

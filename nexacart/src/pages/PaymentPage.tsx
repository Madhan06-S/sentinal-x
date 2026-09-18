import React, { useState } from 'react';
import { CustomerInfo, ShippingAddress, CartItem, OrderConfirmation } from '../types/commerce';
import { useIncidentSimulation } from '../hooks/useIncidentSimulation';
import { incidentSimulator } from '../services/incidentSimulator';
import { CreditCard, Lock, AlertOctagon, CheckCircle2, Loader2, ArrowLeft, RefreshCw, Terminal } from 'lucide-react';

interface PaymentPageProps {
  customer: CustomerInfo;
  shipping: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  onPaymentSuccess: (order: OrderConfirmation) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  customer,
  shipping,
  items,
  subtotal,
  tax,
  shippingFee,
  total,
  onPaymentSuccess,
  onNavigate,
}) => {
  const { status, metrics } = useIncidentSimulation();

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [cardholder, setCardholder] = useState(`${customer.firstName} ${customer.lastName}`);

  const [paymentState, setPaymentState] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProcessPayment = () => {
    setPaymentState('PROCESSING');
    setErrorMessage(null);

    // Business symptom simulation logic:
    // If system is CRITICAL or DEGRADED with payment failure rate >= 15%, simulate realistic failure
    const isDegradedOrCritical = status === 'CRITICAL' || metrics.payment_failure_rate > 15;

    if (isDegradedOrCritical) {
      // Simulate slow API latency (3.5s) followed by connection timeout
      setTimeout(() => {
        setPaymentState('FAILED');
        const errMsg = 'PAY-301: Payment Gateway Timeout (503 Service Unavailable). Unable to acquire database transaction lock from pool [HikariCP-PaymentDB: 100/100 active connections]. Card authorization aborted.';
        setErrorMessage(errMsg);

        // Automatically dispatch operational telemetry event to SentinelX engine
        incidentSimulator.logEvent({
          timestamp: new Date().toISOString(),
          service: 'payment-service',
          event_type: 'payment_failure',
          severity: 'CRITICAL',
          error_code: 'PAY-301',
          message: errMsg,
          environment: 'development',
          metadata: {
            app: 'NexaCart',
            environment: 'development',
            root_error: 'ConnectionTimeoutException: Unable to acquire connection from pool within 30000ms',
          },
        });
      }, 3500);
    } else {
      // Normal healthy flow (850ms)
      setTimeout(() => {
        setPaymentState('SUCCESS');
        const order: OrderConfirmation = {
          orderId: `NXC-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          customer,
          shipping,
          items,
          subtotal,
          tax,
          shippingFee,
          total,
          paymentStatus: 'PAID',
          transactionId: `tx_live_${Math.random().toString(36).substring(2, 12)}`,
          estimatedDelivery: '2 business days via FedEx Priority',
        };

        setTimeout(() => {
          onPaymentSuccess(order);
        }, 600);
      }, 850);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <button
        onClick={() => onNavigate('checkout')}
        disabled={paymentState === 'PROCESSING'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Checkout</span>
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Payment Verification</h1>
        <p className="text-xs text-slate-500 mt-1">
          Finalize transaction with NexaCart 256-bit secure gateway tokenization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Card Input Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Credit or Corporate Card</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <span>Visa / MC / Amex</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardholder}
                disabled={paymentState === 'PROCESSING'}
                onChange={(e) => setCardholder(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Card Number</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={cardNumber}
                  disabled={paymentState === 'PROCESSING'}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Expiration (MM/YY)</label>
                <input
                  type="text"
                  value={expiry}
                  disabled={paymentState === 'PROCESSING'}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Security Code (CVV)</label>
                <input
                  type="password"
                  value={cvv}
                  maxLength={4}
                  disabled={paymentState === 'PROCESSING'}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Status Notifications */}
          {paymentState === 'PROCESSING' && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-900">Processing payment through gateway...</p>
                <p className="text-[11px] text-indigo-700">Communicating with payment-service and issuing bank</p>
              </div>
            </div>
          )}

          {paymentState === 'SUCCESS' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Payment Authorized Successfully</p>
                <p className="text-[11px] text-emerald-700">Redirecting to order confirmation...</p>
              </div>
            </div>
          )}

          {paymentState === 'FAILED' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-900">Payment Failed: Gateway Degradation</h4>
                  <p className="text-[11px] text-rose-700 font-mono leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-xs">
                <button
                  onClick={handleProcessPayment}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Payment</span>
                </button>

                <button
                  onClick={() => onNavigate('demo')}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 hover:underline"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Inspect Incident in /demo</span>
                </button>
              </div>
            </div>
          )}

          {/* Pay Button */}
          {paymentState !== 'SUCCESS' && (
            <button
              onClick={handleProcessPayment}
              disabled={paymentState === 'PROCESSING'}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              {paymentState === 'PROCESSING' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing ${total.toFixed(2)}...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Pay ${total.toFixed(2)}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Quick Order Specs */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200/80 pb-2">
            Payment Breakdown
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Customer</span>
              <span className="font-semibold text-slate-900">{customer.firstName} {customer.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span>Billing Address</span>
              <span className="text-slate-900 text-right">{shipping.city}, {shipping.state}</span>
            </div>
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
              <span className="font-mono text-emerald-600">{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Charge</span>
              <span className="font-mono text-indigo-700">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Operational Notice for Reviewers:</div>
            <p className="leading-relaxed">
              When an incident is simulated via <code className="font-mono text-indigo-600">/demo</code>, this payment transaction will fail with error code <code className="font-mono text-rose-600">PAY-301</code>, representing the business impact symptom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

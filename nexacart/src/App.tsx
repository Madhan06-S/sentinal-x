import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { DemoControlPage } from './pages/DemoControlPage';
import { useCart } from './hooks/useCart';
import { CustomerInfo, ShippingAddress, OrderConfirmation } from './types/commerce';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-01');

  const {
    items,
    totalItemCount,
    subtotal,
    tax,
    shippingFee,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Temporary checkout state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@enterprise.io',
    phone: '+1 (555) 234-8901',
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '500 Technology Square',
    apt: 'Suite 400',
    city: 'Cambridge',
    state: 'MA',
    postalCode: '02139',
    country: 'United States',
  });

  const [completedOrder, setCompletedOrder] = useState<OrderConfirmation | null>(null);

  // Synchronize hash in URL for easy navigation e.g. #/demo or #/dev
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase();
      if (hash === 'demo' || hash === 'dev') {
        setCurrentView('demo');
      } else if (hash === 'products') {
        setCurrentView('products');
      } else if (hash === 'cart') {
        setCurrentView('cart');
      } else if (hash === 'checkout') {
        setCurrentView('checkout');
      } else if (hash === 'payment') {
        setCurrentView('payment');
      } else if (hash.startsWith('product/')) {
        const id = hash.replace('product/', '');
        setSelectedProductId(id);
        setCurrentView('product-detail');
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string, param?: string) => {
    setCurrentView(view);
    if (view === 'home') {
      window.location.hash = '';
    } else if (view === 'demo' || view === 'dev') {
      window.location.hash = '#/demo';
    } else if (view === 'product-detail' && param) {
      setSelectedProductId(param);
      window.location.hash = `#/product/${param}`;
    } else {
      window.location.hash = `#/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = (customer: CustomerInfo, shipping: ShippingAddress) => {
    setCustomerInfo(customer);
    setShippingAddress(shipping);
    navigateTo('payment');
  };

  const handlePaymentSuccess = (order: OrderConfirmation) => {
    setCompletedOrder(order);
    clearCart();
    navigateTo('confirmation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        cartCount={totalItemCount}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onAddToCart={addToCart}
          />
        )}

        {currentView === 'products' && (
          <ProductsPage
            onNavigate={navigateTo}
            onAddToCart={addToCart}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage
            productId={selectedProductId}
            onNavigate={navigateTo}
            onAddToCart={addToCart}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            items={items}
            subtotal={subtotal}
            tax={tax}
            shippingFee={shippingFee}
            total={total}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            items={items}
            subtotal={subtotal}
            tax={tax}
            shippingFee={shippingFee}
            total={total}
            onNavigate={navigateTo}
            onProceedToPayment={handleProceedToPayment}
          />
        )}

        {currentView === 'payment' && (
          <PaymentPage
            customer={customerInfo}
            shipping={shippingAddress}
            items={items}
            subtotal={subtotal}
            tax={tax}
            shippingFee={shippingFee}
            total={total}
            onPaymentSuccess={handlePaymentSuccess}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'confirmation' && completedOrder && (
          <OrderConfirmationPage
            order={completedOrder}
            onNavigate={navigateTo}
          />
        )}

        {(currentView === 'demo' || currentView === 'dev') && (
          <DemoControlPage onNavigate={navigateTo} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default App;

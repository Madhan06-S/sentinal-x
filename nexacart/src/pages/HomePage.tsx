import React from 'react';
import { ArrowRight, Shield, Truck, Clock, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/commerce/ProductCard';
import { PRODUCTS } from '../data/products';
import { Product } from '../types/commerce';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  onAddToCart: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onAddToCart }) => {
  const featured = PRODUCTS.slice(0, 3);
  const popular = PRODUCTS.slice(3, 6);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-200/60 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next-Gen Enterprise Tech & Workstations</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Simple shopping.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
                  Secure payments.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Experience high-performance computing hardware and studio peripherals backed by redundant cloud payments and enterprise-grade reliability.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('products')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm active:scale-95"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('demo')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs transition-colors border border-slate-300/80"
                >
                  <span>Simulate Operations (/demo)</span>
                </button>
              </div>

              {/* Guarantees Row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Free 2-Day Air</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>256-Bit TLS Gateways</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>99.99% Availability</span>
                </div>
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl p-4 shadow-card-hover border border-slate-200">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                    alt="Featured Laptop"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600">Flagship Hardware</span>
                    <h4 className="text-base font-bold text-slate-900">ApexBook Pro 16&quot; M3</h4>
                    <p className="text-xs text-slate-500">32GB RAM · 1TB SSD · Space Gray</p>
                  </div>
                  <button
                    onClick={() => onNavigate('product-detail', 'prod-01')}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
                  >
                    View Specs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Curated For Professionals
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Featured Flagships
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View All ({PRODUCTS.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onAddToCart={onAddToCart}
              onViewDetails={(id) => onNavigate('product-detail', id)}
            />
          ))}
        </div>
      </section>

      {/* Popular Hardware Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              High Concurrency Workspaces
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Popular Peripherals & Displays
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>Browse Category</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popular.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onAddToCart={onAddToCart}
              onViewDetails={(id) => onNavigate('product-detail', id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

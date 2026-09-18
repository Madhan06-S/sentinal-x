import React from 'react';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../../types/commerce';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  const [addedRecently, setAddedRecently] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1200);
  };

  return (
    <div
      onClick={() => onViewDetails(product.id)}
      className="group bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // High-grade inline SVG fallback if external image is blocked
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f8fafc"><rect width="400" height="300" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b">' +
              encodeURIComponent(product.name) +
              '</text></svg>';
          }}
        />

        {/* Badge (e.g. Enterprise Choice, Best Seller) */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Stock status tag */}
        <span
          className={`absolute top-3 right-3 text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm ${
            product.stock <= 15
              ? 'bg-amber-100/95 text-amber-800 border border-amber-200'
              : 'bg-white/95 text-slate-700 border border-slate-200'
          }`}
        >
          {product.stock <= 15 ? `Only ${product.stock} left` : 'In Stock'}
        </span>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Model Number */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-indigo-600">{product.category}</span>
            <span className="font-mono text-[11px] text-slate-400">{product.modelNumber}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="text-xs font-semibold text-slate-800">{product.rating}</span>
            <span className="text-xs text-slate-400">({product.reviewCount})</span>
          </div>

          {/* Description */}
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">
                ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Free Expedited Shipping</span>
          </div>

          <button
            onClick={handleAdd}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${
              addedRecently
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            }`}
          >
            {addedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

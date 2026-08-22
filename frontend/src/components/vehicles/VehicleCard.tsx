import React, { useState } from 'react';
import type { Vehicle } from '../../types/vehicle.types';
import { useAuth } from '../../context/AuthContext';
import { useCart, getDiscount } from '../../context/CartContext';
import { vehicleApi, ApiError } from '../../services/apiClient';
import Spinner from '../ui/Spinner';

interface VehicleCardProps {
  vehicle: Vehicle;
  /** Called with the updated vehicle (qty decremented) after successful add-to-cart purchase */
  onPurchased: (updated: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onRestock: (vehicle: Vehicle) => void;
}

const categoryConfig: Record<string, { bg: string; badge: string; icon: string }> = {
  Sedan:       { bg: 'from-blue-900 to-blue-700',     badge: 'bg-blue-100 text-blue-700',     icon: '🚗' },
  SUV:         { bg: 'from-green-900 to-green-700',   badge: 'bg-green-100 text-green-700',   icon: '🚙' },
  Truck:       { bg: 'from-orange-900 to-orange-700', badge: 'bg-orange-100 text-orange-700', icon: '🛻' },
  Coupe:       { bg: 'from-purple-900 to-purple-700', badge: 'bg-purple-100 text-purple-700', icon: '🏎️' },
  Electric:    { bg: 'from-teal-900 to-teal-700',     badge: 'bg-teal-100 text-teal-700',     icon: '⚡' },
  Van:         { bg: 'from-yellow-900 to-yellow-700', badge: 'bg-yellow-100 text-yellow-700', icon: '🚐' },
  Convertible: { bg: 'from-pink-900 to-pink-700',     badge: 'bg-pink-100 text-pink-700',     icon: '🏎️' },
  default:     { bg: 'from-blue-900 to-blue-700',     badge: 'bg-gray-100 text-gray-700',     icon: '🚗' },
};

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle, onPurchased, onEdit, onDelete, onRestock,
}) => {
  const { user } = useAuth();
  const { addToCart, openCart, items } = useCart();
  const isAdmin = user?.role === 'ADMIN';

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inCart = items.some(i => i.vehicle.id === vehicle.id);
  const inStock = vehicle.quantity > 0;
  const price = typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : Number(vehicle.price);
  const cat = categoryConfig[vehicle.category] ?? categoryConfig.default;
  const discount = getDiscount(vehicle);
  const finalPrice = price * (1 - discount.pct / 100);

  const handleAddToCart = async (): Promise<void> => {
    // If already in cart, just open the drawer
    if (inCart) { openCart(); return; }

    setLoading(true);
    setErrorMsg('');
    try {
      // Call the real purchase API immediately — this decrements the DB quantity
      const res = await vehicleApi.purchase(vehicle.id);
      const updatedVehicle = res.data.vehicle;

      // Tell the dashboard to update this card's quantity
      onPurchased(updatedVehicle);

      // Add to cart for display/receipt in the drawer
      addToCart(vehicle);
      openCart();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Could not add to cart.');
      setTimeout(() => setErrorMsg(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className={`relative bg-gradient-to-br ${cat.bg} p-5`}>

        {/* Discount ribbon */}
        {discount.pct > 0 && (
          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-xl rounded-tl-2xl">
            {discount.pct}% OFF
          </div>
        )}

        {/* Stock badge — top right */}
        <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
          inStock ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-300'
        }`}>
          {inStock ? `${vehicle.quantity} in stock` : 'Out of stock'}
        </span>

        <div className="flex items-end gap-3 mt-4 pr-20">
          <span className="text-4xl leading-none">{cat.icon}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-base leading-snug truncate">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5 ${cat.badge}`}>
              {vehicle.category}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex-1 flex flex-col gap-3">

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {discount.pct > 0 ? (
              <>
                <p className="text-gray-400 text-xs line-through">
                  ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xl font-extrabold text-green-600">
                  ${finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </>
            ) : (
              <p className="text-xl font-extrabold text-gray-900">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
          {/* Low stock warning */}
          {vehicle.quantity > 0 && vehicle.quantity <= 3 && (
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              ⚠ Only {vehicle.quantity} left
            </span>
          )}
        </div>

        {/* Discount label */}
        {discount.pct > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-green-700 flex items-center gap-1.5">
            🏷 {discount.label} — Save ${(price - finalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-semibold text-red-600">
            {errorMsg}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="mt-auto flex flex-col gap-2">

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || loading}
            className={`w-full font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
              !inStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : inCart
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm'
            }`}
          >
            {loading ? (
              <><Spinner size="sm" className="text-white" />Adding…</>
            ) : !inStock ? (
              <>🚫 Out of Stock</>
            ) : inCart ? (
              <>✓ In Cart — View Cart</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>

          {/* Admin controls */}
          {isAdmin && (
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => onEdit(vehicle)}
                className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1">
                ✏️ Edit
              </button>
              <button onClick={() => onRestock(vehicle)}
                className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1">
                🔄 Restock
              </button>
              <button onClick={() => onDelete(vehicle)}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1">
                🗑 Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VehicleCard;

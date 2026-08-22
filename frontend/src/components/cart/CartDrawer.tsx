import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import type { CartItem } from '../../types/vehicle.types';

/**
 * CartDrawer — slides in from the right.
 *
 * NOTE: Purchase already happened when the user clicked "Add to Cart"
 * (VehicleCard calls the API immediately and decrements stock).
 * The cart is a receipt/summary. "Confirm" just shows the order summary.
 */
const CartDrawer: React.FC = () => {
  const {
    items, isOpen, closeCart, removeFromCart, clearCart,
    totalItems, subtotal, totalSavings, finalTotal,
  } = useCart();

  const [confirmed, setConfirmed] = useState(false);
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);

  const handleConfirm = (): void => {
    setConfirmedItems([...items]);
    clearCart();
    setConfirmed(true);
  };

  const handleDone = (): void => {
    setConfirmed(false);
    setConfirmedItems([]);
    closeCart();
  };

  const categoryIcon = (cat: string): string => {
    const icons: Record<string, string> = {
      Electric: '⚡', SUV: '🚙', Truck: '🛻', Coupe: '🏎️',
      Van: '🚐', Convertible: '🏎️',
    };
    return icons[cat] ?? '🚗';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-800 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2 text-xl">🛒</div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Your Cart</h2>
              <p className="text-blue-300 text-xs">
                {confirmed ? 'Order confirmed' : `${totalItems} vehicle${totalItems !== 1 ? 's' : ''} — already purchased`}
              </p>
            </div>
          </div>
          <button onClick={closeCart} className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Order confirmed screen ── */}
        {confirmed ? (
          <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
            <div className="text-center py-6">
              <div className="text-6xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Purchase Complete!</h3>
              <p className="text-gray-500 text-sm">
                {confirmedItems.length} vehicle{confirmedItems.length !== 1 ? 's' : ''} successfully purchased.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
              <p className="text-green-700 font-semibold text-sm flex items-center gap-2">
                ✅ Order Summary
              </p>
              {confirmedItems.map(item => (
                <div key={item.vehicle.id} className="flex items-center justify-between text-sm border-b border-green-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-gray-800">{item.vehicle.make} {item.vehicle.model}</p>
                    <p className="text-gray-400 text-xs">{item.vehicle.category}</p>
                    {item.discountPct > 0 && (
                      <span className="text-xs text-green-600 font-medium">🏷 {item.discountPct}% discount applied</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900">
                      ${item.finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    {item.discountPct > 0 && (
                      <p className="text-gray-400 text-xs line-through">
                        ${item.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between font-extrabold text-gray-900 pt-2 border-t border-green-200">
                <span>Total Paid</span>
                <span>${confirmedItems.reduce((s, i) => s + i.finalPrice, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {confirmedItems.reduce((s, i) => s + (i.originalPrice - i.finalPrice), 0) > 0 && (
                <div className="flex justify-between text-green-600 font-bold text-sm">
                  <span>Total Saved</span>
                  <span>− ${confirmedItems.reduce((s, i) => s + (i.originalPrice - i.finalPrice), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            <button onClick={handleDone}
              className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-colors">
              Done — Continue Shopping
            </button>
          </div>

        ) : items.length === 0 ? (
          /* ── Empty cart ── */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center text-4xl">🛒</div>
            <div>
              <p className="font-bold text-gray-800 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add to Cart" on any vehicle to purchase it</p>
            </div>
            <button onClick={closeCart} className="text-blue-600 text-sm font-semibold underline">
              Continue browsing
            </button>
          </div>

        ) : (
          /* ── Cart items ── */
          <>
            {/* Info banner */}
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2 text-xs text-blue-700 font-medium shrink-0">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Stock already reserved — click Confirm to view your receipt
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 px-4 py-2">
              {items.map(item => {
                const { vehicle, discountPct, originalPrice, finalPrice } = item;
                return (
                  <div key={vehicle.id} className="py-4 flex gap-3">
                    <div className="bg-blue-50 rounded-xl w-14 h-14 flex items-center justify-center text-2xl shrink-0 border border-blue-100">
                      {categoryIcon(vehicle.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{vehicle.make} {vehicle.model}</p>
                      <p className="text-gray-400 text-xs">{vehicle.category}</p>
                      {discountPct > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">
                          🏷 {discountPct}% off
                        </span>
                      )}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-extrabold text-gray-900 text-sm">
                          ${finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {discountPct > 0 && (
                          <span className="text-gray-400 text-xs line-through">
                            ${originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(vehicle.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1 self-start rounded-lg hover:bg-red-50"
                      aria-label="Remove from cart">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary + Confirm */}
            <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-3 shrink-0">
              {totalSavings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-green-700 text-sm font-semibold">🏷 You save</span>
                  <span className="text-green-700 font-extrabold">
                    ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                  <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discounts</span>
                    <span>− ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>Total</span>
                  <span>${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button onClick={handleConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Order Receipt
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

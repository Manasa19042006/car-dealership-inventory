import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { CartItem, Vehicle } from '../types/vehicle.types';

/**
 * Discount logic — applied automatically when adding to cart.
 *
 * Rules (frontend display only — actual price charged is the listed price):
 *  - Electric vehicles  → 8% green savings discount
 *  - Low stock (≤ 3)   → 5% clearance discount
 *  - Price > $45 000   → 3% premium loyalty discount
 *  - Default           → 0%
 *
 * These are promotional labels only. The backend always charges full price.
 */
export const getDiscount = (vehicle: Vehicle): { pct: number; label: string } => {
  const price =
    typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : Number(vehicle.price);

  if (vehicle.category === 'Electric') return { pct: 8, label: '🌿 Green Savings' };
  if (vehicle.quantity <= 3 && vehicle.quantity > 0)
    return { pct: 5, label: '🔥 Clearance Deal' };
  if (price > 45000) return { pct: 3, label: '⭐ Loyalty Discount' };
  return { pct: 0, label: '' };
};

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (vehicle: Vehicle) => void;
  removeFromCart: (vehicleId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  totalSavings: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((vehicle: Vehicle): void => {
    // Only allow one of each vehicle in the cart (since purchase = qty -1)
    setItems(prev => {
      if (prev.find(i => i.vehicle.id === vehicle.id)) return prev;
      const { pct } = getDiscount(vehicle);
      const originalPrice =
        typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : Number(vehicle.price);
      const finalPrice = originalPrice * (1 - pct / 100);
      return [...prev, { vehicle, discountPct: pct, originalPrice, finalPrice }];
    });
  }, []);

  const removeFromCart = useCallback((vehicleId: string): void => {
    setItems(prev => prev.filter(i => i.vehicle.id !== vehicleId));
  }, []);

  const clearCart = useCallback((): void => setItems([]), []);
  const openCart = useCallback((): void => setIsOpen(true), []);
  const closeCart = useCallback((): void => setIsOpen(false), []);

  const totalItems = items.length;
  const subtotal = items.reduce((s, i) => s + i.originalPrice, 0);
  const finalTotal = items.reduce((s, i) => s + i.finalPrice, 0);
  const totalSavings = subtotal - finalTotal;

  return (
    <CartContext.Provider value={{
      items, isOpen, addToCart, removeFromCart, clearCart,
      openCart, closeCart, totalItems, subtotal, totalSavings, finalTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};

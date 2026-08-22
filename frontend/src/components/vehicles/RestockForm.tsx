import React, { useState } from 'react';
import type { Vehicle } from '../../types/vehicle.types';
import { vehicleApi, ApiError } from '../../services/apiClient';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';

interface RestockFormProps {
  vehicle: Vehicle;
  onRestocked: (updated: Vehicle) => void;
  onCancel: () => void;
}

const RestockForm: React.FC<RestockFormProps> = ({ vehicle, onRestocked, onCancel }) => {
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(''); setApiError('');
    const n = Number(qty);
    if (!qty || isNaN(n) || !Number.isInteger(n) || n <= 0) { setError('Enter a positive whole number.'); return; }
    setLoading(true);
    try {
      const res = await vehicleApi.restock(vehicle.id, n);
      onRestocked(res.data.vehicle);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Restock failed.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        Current stock for <span className="font-semibold">{vehicle.make} {vehicle.model}</span>: <span className="font-bold text-blue-600">{vehicle.quantity}</span>
      </p>
      {apiError && <Alert type="error" message={apiError} />}
      <div className="flex flex-col gap-1">
        <label htmlFor="restock-qty" className="text-sm font-medium text-gray-700">Quantity to Add</label>
        <input id="restock-qty" type="number" min="1" step="1" placeholder="e.g. 10" value={qty} onChange={e => { setQty(e.target.value); setError(''); }} disabled={loading}
          className={`rounded-lg border px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`} />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} disabled={loading} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <><Spinner size="sm" className="text-white" />Restocking…</> : 'Restock'}
        </button>
      </div>
    </form>
  );
};
export default RestockForm;

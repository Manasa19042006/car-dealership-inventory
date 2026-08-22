import React, { useState, useEffect } from 'react';
import type { Vehicle, CreateVehiclePayload } from '../../types/vehicle.types';
import InputField from '../ui/InputField';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onSubmit: (data: CreateVehiclePayload) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

interface FormValues { make: string; model: string; category: string; price: string; quantity: string; }
interface FormErrors { make?: string; model?: string; category?: string; price?: string; quantity?: string; }

const validate = (v: FormValues): FormErrors => {
  const e: FormErrors = {};
  if (!v.make.trim()) e.make = 'Make is required.';
  if (!v.model.trim()) e.model = 'Model is required.';
  if (!v.category.trim()) e.category = 'Category is required.';
  if (!v.price) e.price = 'Price is required.';
  else if (isNaN(Number(v.price)) || Number(v.price) <= 0) e.price = 'Price must be a positive number.';
  if (v.quantity === '') e.quantity = 'Quantity is required.';
  else if (isNaN(Number(v.quantity)) || !Number.isInteger(Number(v.quantity)) || Number(v.quantity) < 0) e.quantity = 'Quantity must be a non-negative integer.';
  return e;
};

const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onSubmit, onCancel, submitLabel = 'Save' }) => {
  const [values, setValues] = useState<FormValues>({
    make: initialData?.make ?? '',
    model: initialData?.model ?? '',
    category: initialData?.category ?? '',
    price: initialData ? String(typeof initialData.price === 'string' ? parseFloat(initialData.price) : initialData.price) : '',
    quantity: initialData ? String(initialData.quantity) : '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (initialData) {
      setValues({
        make: initialData.make,
        model: initialData.model,
        category: initialData.category,
        price: String(typeof initialData.price === 'string' ? parseFloat(initialData.price) : initialData.price),
        quantity: String(initialData.quantity),
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setValues(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSubmit({ make: values.make.trim(), model: values.model.trim(), category: values.category.trim(), price: Number(values.price), quantity: Number(values.quantity) });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'An error occurred.');
    } finally { setLoading(false); }
  };

  const CATEGORIES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Electric', 'Van', 'Convertible', 'Other'];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {apiError && <Alert type="error" message={apiError} />}
      <InputField id="make" name="make" label="Make" type="text" placeholder="e.g. Toyota" value={values.make} onChange={handleChange} error={errors.make} disabled={loading} />
      <InputField id="model" name="model" label="Model" type="text" placeholder="e.g. Camry" value={values.model} onChange={handleChange} error={errors.model} disabled={loading} />

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
        <input list="category-options" id="category" name="category" placeholder="e.g. Sedan" value={values.category} onChange={handleChange} disabled={loading}
          className={`rounded-lg border px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 ${errors.category ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`} />
        <datalist id="category-options">{CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
        {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
      </div>

      <InputField id="price" name="price" label="Price ($)" type="number" min="0.01" step="0.01" placeholder="e.g. 25000" value={values.price} onChange={handleChange} error={errors.price} disabled={loading} />
      <InputField id="quantity" name="quantity" label="Quantity" type="number" min="0" step="1" placeholder="e.g. 10" value={values.quantity} onChange={handleChange} error={errors.quantity} disabled={loading} />

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <><Spinner size="sm" className="text-white" />Saving…</> : submitLabel}
        </button>
      </div>
    </form>
  );
};
export default VehicleForm;

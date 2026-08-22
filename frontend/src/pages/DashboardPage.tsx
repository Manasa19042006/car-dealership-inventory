import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleApi, ApiError } from '../services/apiClient';
import type { Vehicle, VehicleSearchParams, CreateVehiclePayload, UpdateVehiclePayload } from '../types/vehicle.types';
import VehicleCard from '../components/vehicles/VehicleCard';
import VehicleForm from '../components/vehicles/VehicleForm';
import RestockForm from '../components/vehicles/RestockForm';
import SearchBar from '../components/vehicles/SearchBar';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeSearch, setActiveSearch] = useState<VehicleSearchParams>({});
  const isFiltered = Object.keys(activeSearch).length > 0;

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [restockVehicle, setRestockVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showSuccess = (msg: string): void => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const initialLoad = useCallback(async (): Promise<void> => {
    setInitialLoading(true);
    setError('');
    try {
      const res = await vehicleApi.list();
      setVehicles(res.data.vehicles);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load vehicles.');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => { void initialLoad(); }, [initialLoad]);

  const handleSearch = async (params: VehicleSearchParams): Promise<void> => {
    setActiveSearch(params);
    setSearchLoading(true);
    setError('');
    try {
      const hasParams = Object.keys(params).length > 0;
      const res = hasParams ? await vehicleApi.search(params) : await vehicleApi.list();
      setVehicles(res.data.vehicles);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Search failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddSubmit = async (data: CreateVehiclePayload): Promise<void> => {
    const res = await vehicleApi.create(data);
    setVehicles(prev => [res.data.vehicle, ...prev]);
    setTotal(p => p + 1);
    setAddOpen(false);
    showSuccess(`✓ ${res.data.vehicle.make} ${res.data.vehicle.model} added.`);
  };

  const handleEditSubmit = async (data: CreateVehiclePayload): Promise<void> => {
    if (!editVehicle) return;
    const payload: UpdateVehiclePayload = data;
    const res = await vehicleApi.update(editVehicle.id, payload);
    setVehicles(prev => prev.map(v => v.id === editVehicle.id ? res.data.vehicle : v));
    setEditVehicle(null);
    showSuccess(`✓ ${res.data.vehicle.make} ${res.data.vehicle.model} updated.`);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteVehicle) return;
    setDeleting(true);
    try {
      await vehicleApi.delete(deleteVehicle.id);
      setVehicles(prev => prev.filter(v => v.id !== deleteVehicle.id));
      setTotal(p => p - 1);
      setDeleteVehicle(null);
      showSuccess('✓ Vehicle deleted.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed.');
      setDeleteVehicle(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleRestocked = (updated: Vehicle): void => {
    setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
    setRestockVehicle(null);
    showSuccess(`✓ ${updated.make} ${updated.model} restocked — ${updated.quantity} units.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Vehicle Inventory</h1>
            <p className="text-blue-300 text-sm mt-1">
              {initialLoading ? 'Loading…' : isFiltered
                ? `${total} result${total !== 1 ? 's' : ''} found`
                : `${total} vehicle${total !== 1 ? 's' : ''} available`}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setAddOpen(true)}
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vehicle
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {successMsg && <Alert type="success" message={successMsg} className="mb-4" />}
        {error && <Alert type="error" message={error} className="mb-4" />}

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} loading={searchLoading} />
        </div>

        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="bg-gray-100 h-28" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-10 bg-gray-100 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">{isFiltered ? '🔍' : '🚗'}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {isFiltered ? 'No vehicles match your search' : 'No vehicles yet'}
            </h3>
            <p className="text-gray-400 text-sm">
              {isFiltered ? 'Try adjusting your filters.' : isAdmin ? 'Click "Add Vehicle" to start.' : 'Check back soon.'}
            </p>
            {isFiltered && (
              <button onClick={() => handleSearch({})} className="mt-4 text-blue-600 text-sm font-semibold underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {searchLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100">
                  <Spinner size="sm" className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Searching…</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vehicles.map(v => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onPurchased={(updated) => setVehicles(prev => prev.map(x => x.id === updated.id ? updated : x))}
                  onEdit={setEditVehicle}
                  onDelete={setDeleteVehicle}
                  onRestock={setRestockVehicle}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Vehicle">
        <VehicleForm onSubmit={handleAddSubmit} onCancel={() => setAddOpen(false)} submitLabel="Add Vehicle" />
      </Modal>

      <Modal isOpen={!!editVehicle} onClose={() => setEditVehicle(null)} title="Edit Vehicle">
        <VehicleForm initialData={editVehicle} onSubmit={handleEditSubmit} onCancel={() => setEditVehicle(null)} submitLabel="Save Changes" />
      </Modal>

      <Modal isOpen={!!restockVehicle} onClose={() => setRestockVehicle(null)} title="Restock Vehicle">
        {restockVehicle && (
          <RestockForm vehicle={restockVehicle} onRestocked={handleRestocked} onCancel={() => setRestockVehicle(null)} />
        )}
      </Modal>

      <Modal isOpen={!!deleteVehicle} onClose={() => setDeleteVehicle(null)} title="Confirm Deletion" maxWidth="max-w-sm">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-full shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Delete vehicle?</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">{deleteVehicle?.make} {deleteVehicle?.model}</span> will be permanently removed. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteVehicle(null)} disabled={deleting}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleDeleteConfirm} disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {deleting ? <><Spinner size="sm" className="text-white" />Deleting…</> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DashboardPage;

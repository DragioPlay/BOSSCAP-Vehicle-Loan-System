"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, JSX } from "react";

{/*Allows the vehicles to be deleted*/}
function DeleteConfirmModal({ 
  vehicle, 
  onConfirm, 
  onCancel 
}: { 
  vehicle: any; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
        <p className="mb-4">
          Are you sure you want to delete this vehicle?<br/>
          <span className="font-semibold">{vehicle.model}</span> - {vehicle.trim}<br/>
          <span className="text-sm text-gray-600">VIN: {vehicle.vin}</span>
        </p>
        <p className="text-sm text-red-600 mb-4">
          Warning: This will delete all bookings associated with this vehicle!
        </p>
        <div className="flex justify-end gap-2">
          <button 
            className="bg-gray-300 text-gray px-4 py-2 rounded-lg hover:bg-gray-400 transition font-semibold" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold" 
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

{/*Allows the vehicles to be created or edited*/}
function VehicleFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: { nickname?: string; vehicle_id?: number; model?: string; trim?: string; vin?: string;};
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    vehicle_id: initial?.vehicle_id ?? undefined,
    model: initial?.model ?? "",
    trim: initial?.trim ?? "",
    vin: initial?.vin ?? "",
    nickname: initial?.nickname ?? "",
  });
  const [errors, setErrors] = useState<{
    model?: boolean;
    trim?: boolean;
    vin?: boolean;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const isEdit = !!initial?.vehicle_id;

  useEffect(() => {
    setForm({
      vehicle_id: initial?.vehicle_id ?? undefined,
      model: initial?.model ?? "",
      trim: initial?.trim ?? "",
      vin: initial?.vin ?? "",
      nickname: initial?.nickname ?? "",
    });
    setErrors({});
    setShowErrors(false);
  }, [initial]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.value) {
      setErrors(prev => ({ ...prev, [e.target.name]: false }));
    }
  }

  async function handleSubmit() {
    const newErrors = {
      model: !form.model,
      trim: !form.trim,
      vin: !form.vin
    };

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      setShowErrors(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Request failed");
      }
      onSave();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  {/*Create Vehicle Form UI*/}
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <button className="float-right text-xl" onClick={onClose}>
          &times;
        </button>
        <h3 className="text-lg font-bold mb-4">{isEdit ? "Edit Vehicle" : "Add Vehicle"}</h3>
        <div className="flex flex-col gap-2">
          {showErrors && Object.values(errors).some(Boolean) && (
            <p className="text-red-500 text-sm mb-2">Fill out following fields:</p>
          )}
          <div className="flex flex-col gap-1">
            <input 
              name="model" 
              value={form.model} 
              onChange={handleChange} 
              className={`border px-2 py-1 rounded ${errors.model ? 'border-red-500' : ''}`} 
              placeholder="Model" 
            />
            {showErrors && errors.model && (
              <span className="text-red-500 text-xs">Model is required</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <input 
              name="trim" 
              value={form.trim} 
              onChange={handleChange} 
              className={`border px-2 py-1 rounded ${errors.trim ? 'border-red-500' : ''}`} 
              placeholder="Trim (e.g. XLT / PRO)" 
            />
            {showErrors && errors.trim && (
              <span className="text-red-500 text-xs">Trim is required</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <input 
              name="vin" 
              value={form.vin} 
              onChange={handleChange} 
              className={`border px-2 py-1 rounded ${errors.vin ? 'border-red-500' : ''}`} 
              placeholder="VIN" 
            />
            {showErrors && errors.vin && (
              <span className="text-red-500 text-xs">VIN is required</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <input 
              name="nickname" 
              value={form.nickname} 
              onChange={handleChange} 
              className="border px-2 py-1 rounded" 
              placeholder="Nickname (optional)" 
            />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}   

{/*Function List*/}
export default function SettingsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);

  async function loadVehicles() {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(vehicle: any) {
    setDeletingId(vehicle.vehicle_id);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.vehicle_id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Delete failed" }));
        throw new Error(err?.error || "Delete failed");
      }
      await loadVehicles();
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  {/*Main UI components*/}
  return (
    <div className="font-sans flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <main className="w-full max-w-4xl mt-16 p-8 rounded-3xl shadow-xl bg-white/80 flex flex-col gap-6">
          <div className="flex flex-row items-center justify-center gap-4">
            <Image src="/bosscap.png" alt="Logo" width={140} height={36} className="object-contain" priority />
            <Image src="/amq.png" alt="Logo2" width={200} height={48} className="object-contain" priority />
          </div>

        <h1 className="text-3xl font-bold text-center">Vehicle Settings</h1>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">Edit, Delete or Create Vehicles for Bookings</div>
          <div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold" onClick={() => { setEditVehicle(null); setShowForm(true); }}>
              + Add Vehicle
            </button>
          </div>
        </div>

        {/*Navigation Buttons*/}
        <div className="fixed top-5 left-3">
        <Link
            href="/"
            className="px-6 py-3 rounded-lg bg-black text-white font-semibold text-lg shadow hover:bg-gray-800 transition-colors"
          >
           🏠︎
          </Link>
        </div>
        <div className="fixed top-5 right-3">
          <Link
            href="/edit-view_booking"
            className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold text-lg shadow hover:bg-purple-700 transition-colors"
          >
           View/Edit
          </Link>
        </div>
        <div className="fixed top-20 right-3">
          <Link
            href="/make_booking"
            className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold text-lg shadow hover:bg-purple-700 transition-colors"
          >
           Make Booking
          </Link>
        </div>
        
        {/*Loading Vehicles - Since it takes a little bit*/}
        {loading ? (
          <div>Loading vehicles...</div>
        ) : (
          <ul className="divide-y">
            {vehicles.map(v => (
              <li key={v.vehicle_id} className="flex justify-between items-center py-3">
                <div>
                  {v.nickname && <span className="font-semibold italic">{v.nickname} </span>}
                  <span className="ml-2 font-semibold">{v.model}</span>
                  <span className="ml-2 text-gray-600">{v.trim}</span>
                  <span className="ml-4 text-xs text-gray-400">{v.vin}</span>
                  <span className="ml-4 text-xs text-gray-500">ID: {v.vehicle_id}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    onClick={() => { setEditVehicle(v); setShowForm(true); }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    onClick={() => setDeleteConfirm(v)}
                    disabled={deletingId === v.vehicle_id}
                  >
                    {deletingId === v.vehicle_id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
            {vehicles.length === 0 && <li className="py-6 text-center text-gray-500">No vehicles found</li>}
          </ul>
        )}
      </main>

      {showForm && (
        <VehicleFormModal
          initial={editVehicle ?? undefined}
          onClose={() => setShowForm(false)}
          onSave={() => loadVehicles()}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          vehicle={deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

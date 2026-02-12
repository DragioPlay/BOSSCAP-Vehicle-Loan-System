"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

{/*Get all booked dates for a specific vehicle*/}
function getBookedDatesForVehicle(vehicle_id: number, bookings: any[]) {
  const bookedDates = new Set<string>();
  bookings.forEach(b => {
    if (b.vehicle_id === vehicle_id) {
      let current = new Date(b.start_date);
      const end = new Date(b.end_date);
      while (current <= end) {
        bookedDates.add(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
      }
    }
  });
  return bookedDates;
}

{/*Calendar Component*/}
function Calendar({
  year,
  vehicles,
  bookings,
  selectedVehicle,
  selectedDates,
  setSelectedDates,
  vehicleCategory,
}: {
  year: number;
  vehicles: any[];
  bookings: any[];
  selectedVehicle: any | null;
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;
  vehicleCategory: "ALL" | "XLT" | "PRO";
}) {
  function isDayFullyBooked(dateStr: string) {
    if (vehicles.length === 0) return false;

    const vehiclesToCheck =
      vehicleCategory === "ALL"
        ? vehicles
        : vehicles.filter(v => v.trim.includes(vehicleCategory));

    const allBookedDates = new Set<string>();
    bookings.forEach(b => {
      let current = new Date(b.start_date);
      const end = new Date(b.end_date);
      while (current <= end) {
        allBookedDates.add(`${b.vehicle_id}-${current.toISOString().slice(0, 10)}`);
        current.setDate(current.getDate() + 1);
      }
    });

    return vehiclesToCheck.every(v =>
      allBookedDates.has(`${v.vehicle_id}-${dateStr}`)
    );
  }

  {/*Selects a Date when it is clicked*/}
  function handleDateClick(dateStr: string) {
    if (isDayFullyBooked(dateStr)) return;

    if (selectedDates.length === 0 || selectedDates.length === 2) {
      setSelectedDates([dateStr]);
    } else if (selectedDates.length === 1) {
      const start = selectedDates[0];
      const end = dateStr;
      const [rangeStart, rangeEnd] = start < end ? [start, end] : [end, start];  
      setSelectedDates([rangeStart, rangeEnd]);
    }
  }

  function renderMonth(month: number) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" });

    const sortedSelectedDates = selectedDates.filter(Boolean).sort();
    const rangeStart = sortedSelectedDates[0];
    const rangeEnd = sortedSelectedDates[1];

    const bookedDatesForVehicle = selectedVehicle
      ? getBookedDatesForVehicle(selectedVehicle.vehicle_id, bookings)
      : new Set<string>();

    return (
      <div key={month} className="mb-8">
        <div className="font-bold text-center mb-1">{monthName}</div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="font-semibold text-center">{d}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={"empty-" + i}></div>
          ))}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;

            const isFullyBooked = isDayFullyBooked(dateStr);
            const isVehicleBooked = selectedVehicle ? bookedDatesForVehicle.has(dateStr) : false;
            const isSelected = selectedDates.includes(dateStr);
            let isInRange = false;
            if (rangeStart && rangeEnd) {
              isInRange = dateStr > rangeStart && dateStr < rangeEnd;
            }

            let className = `py-2 rounded text-center cursor-pointer select-none transition-colors`;
            if (isVehicleBooked || isFullyBooked) {
              className += ` line-through bg-red-200 text-gray-500 cursor-not-allowed`;
            } else if (isSelected) {
              className += ` bg-blue-400 text-white font-bold`;
            } else if (isInRange) {
              className += ` bg-blue-200 text-blue-900`;
            } else {
              className += ` bg-green-100 hover:bg-blue-100`;
            }

            return (
              <div
                key={i}
                id={`calendar-day-${dateStr}`}
                className={className}
                onClick={() => handleDateClick(dateStr)}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>
    )
  }

  {/*Vehicle List*/}
  return (
    <div className="flex-1 w-full p-4 overflow-y-auto">
      <h3 className="text-xl font-bold mb-6 text-center">
        {selectedVehicle
          ? `Calendar for ${selectedVehicle.model} ${selectedVehicle.trim}`
          : `Select a date range - ${year}`}
      </h3>
      <div className="grid grid-cols-3 gap-6">
        {Array(12).fill(null).map((_, month) => renderMonth(month))}
      </div>
    </div>
  );
}

{/*Booking Form Modal*/}
function BookingFormModal({ onClose, onBookingCreated, vehicle, selectedDates }: { onClose: () => void; onBookingCreated: () => void; vehicle: any; selectedDates: string[] }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleBooking() {
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in all fields.");
      setTimeout(() => setError(null), 2000);
      return;
    }

    const newBooking = {
      vehicle_id: vehicle.vehicle_id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      start_date: selectedDates[0],
      end_date: selectedDates[1],
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      await res.json();

      setSuccess("Booking created!");
      setTimeout(() => {
        setSuccess(null);
        onBookingCreated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create booking in database.");
      setTimeout(() => setError(null), 2000);
    }
  }
  
  {/*Enter User Details pop-up*/}
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl min-w-[340px] max-w-sm relative">
        <button className="absolute top-2 right-4 text-2xl" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-4 text-center">Confirm Booking</h3>
        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-500 text-center mb-2">
            Vehicle: {vehicle.model}
            <br />
            Dates: {selectedDates[0].split("-").reverse().join("/")} to {selectedDates[1].split("-").reverse().join("/")}
          </div>
          <input className="border rounded px-2 py-1" name="name" placeholder="Name*" value={form.name} onChange={handleInput} />
          <input className="border rounded px-2 py-1" name="email" placeholder="Email*" type="email" value={form.email} onChange={handleInput} />
          <input className="border rounded px-2 py-1" name="phone" placeholder="Phone*" value={form.phone} onChange={handleInput} />
          <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handleBooking}>
            Confirm Booking
          </button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </div>
      </div>
    </div>
  );
}

{/*Vehicle Unavailable Modal*/}
function VehicleUnavailableModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl min-w-[300px] max-w-sm relative">
        <button className="absolute top-2 right-4 text-2xl" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-4 text-center text-red-600">Vehicle Unavailable</h3>
        <p className="text-center mb-4 text-gray-700 dark:text-gray-300">
          The selected vehicle is unavailable for the chosen dates. Please select another vehicle or date range.
        </p>
        <div className="flex justify-center">
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

{/*Main Components*/}
export default function Home() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [closestAvailableDate, setClosestAvailableDate] = useState<string | null>(null);
  const [vehicleCategory, setVehicleCategory] = useState<"ALL" | "XLT" | "PRO">("ALL");
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());

  {/*Imports all the vehicles and bookings from the database*/}
  async function loadData() {
    try {
      setLoading(true);
      const [vRes, bRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/bookings"),
      ]);
      const [vehiclesData, bookingsData] = await Promise.all([vRes.json(), bRes.json()]);

      const normalizedBookings = bookingsData.map((b: any) => ({
        ...b,
        start_date: new Date(b.start_date).toISOString().slice(0, 10),
        end_date: new Date(b.end_date).toISOString().slice(0, 10),
      }));

      setVehicles(vehiclesData);
      setBookings(normalizedBookings);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  const filteredVehicles =
    vehicleCategory === "ALL"
      ? vehicles
      : vehicles.filter(v => v.trim.includes(vehicleCategory));

  function handleVehicleSelect(vehicle: any) {
    if (selectedVehicle?.vehicle_id === vehicle.vehicle_id) setSelectedVehicle(null);
    else setSelectedVehicle(vehicle);
  }

  {/*Accounts for timezone offset and sets the date*/}
  function handleGetAnyVehicleASAP() {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
    const aestNow = new Date(utcMs + 10 * 60 * 60 * 1000);
    const startYear = aestNow.getFullYear();
    const startMonth = aestNow.getMonth();
    const startDay = aestNow.getDate();

    const vehiclesToCheck =
      vehicleCategory === "ALL"
        ? vehicles
        : vehicles.filter((v) => v.trim.includes(vehicleCategory));

    const maxDays = 365;
    for (let offset = 0; offset <= maxDays; offset++) {
      const candidateUtcMidnight = Date.UTC(startYear, startMonth, startDay + offset);
      const dateStr = new Date(candidateUtcMidnight).toISOString().slice(0, 10);

      for (const vehicle of vehiclesToCheck) {
        const bookedDates = getBookedDatesForVehicle(vehicle.vehicle_id, bookings);
        if (!bookedDates.has(dateStr)) {
          setSelectedVehicle(vehicle);
          setSelectedDates([dateStr]);
          setClosestAvailableDate(dateStr);

          {/*Auto-scroll to the date in the calendar*/}
          setTimeout(() => {
            const el = document.getElementById(`calendar-day-${dateStr}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 200);

          return;
        }
      }
    }
    alert(`No vehicles available in the next ${maxDays} days.`);
  }


  {/*Book Now Button Function*/}
  function handleBookNow() {
    if (!selectedVehicle || selectedDates.length !== 2) return;

    const vehicleBookedDates = getBookedDatesForVehicle(selectedVehicle.vehicle_id, bookings);
    const [start, end] = selectedDates.sort();
    let current = new Date(start);
    const endDate = new Date(end);
    let isUnavailable = false;

    while (current <= endDate) {
      if (vehicleBookedDates.has(current.toISOString().slice(0, 10))) {
        isUnavailable = true;
        break;
      }
      current.setDate(current.getDate() + 1);
    }

    if (isUnavailable) {
      setShowUnavailableModal(true);
      return;
    }

    setShowBookingModal(true);
  }

  const isBookButtonDisabled = !selectedVehicle || selectedDates.length !== 2;

  const availableVehicles = filteredVehicles.map(vehicle => {
    let isUnavailable = false;
    let overlapStart = "";
    let overlapEnd = "";

    if (selectedDates.length === 2) {
      const vehicleBookedDates = getBookedDatesForVehicle(vehicle.vehicle_id, bookings);
      const [start, end] = selectedDates.sort();
      let current = new Date(start);
      const endDate = new Date(end);

      while (current <= endDate) {
        const dateStr = current.toISOString().slice(0, 10);
        if (vehicleBookedDates.has(dateStr)) {
          isUnavailable = true;
          if (!overlapStart) overlapStart = dateStr;
          overlapEnd = dateStr;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return { ...vehicle, isUnavailable, overlapStart, overlapEnd };
  });

  if (
    selectedDates.length === 2 &&
    selectedVehicle &&
    availableVehicles.find(v => v.vehicle_id === selectedVehicle.vehicle_id)?.isUnavailable
  ) {
    setSelectedVehicle(null);
  }

  function handleClearDates() {
    setSelectedDates([]);
  }

  {/*Filter bookings to the selected year*/}
  const filteredBookings = bookings.filter(b => {
    const yearOfBooking = new Date(b.start_date).getFullYear();
    return yearOfBooking === calendarYear;
  });

  return (
    <div className="font-sans flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:bg-gray-800">
      <main className="w-full max-w-7xl mt-16 p-8 rounded-3xl shadow-xl bg-white/80 dark:bg-gray-900/80 flex flex-col items-center gap-8">
        {/*Logos and Titles*/}
        <div className="flex flex-row items-center justify-center gap-8 w-full">
          <Image src="/bosscap.png" alt="Bosscap Logo" width={160} height={40} className="object-contain" priority />
          <Image src="/amq.png" alt="AMQ Logo" width={220} height={60} className="object-contain" priority />
        </div>
        <div className="fixed top-5 right-3">
          <Link
            href="/edit-view_booking"
            className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold text-lg shadow hover:bg-purple-700 transition-colors"
          >
           View/Edit
          </Link>
        </div>
        <div className="fixed top-5 left-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg bg-black text-white font-semibold text-lg shadow hover:bg-gray-800 transition-colors"
          >
           🏠︎
          </Link>
        </div>
        <div className="flex flex-col items-center w-full">
          <h1 className="text-4xl font-extrabold mb-1 tracking-tight text-gray-900 dark:text-white drop-shadow">
            Vehicle Loan System
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
            Make a Booking
          </h2>
          <h3 className="text-l font-italic text-gray-700 dark:text-gray-300 tracking-wide">
            To Book Click a Vehicle and click on the Calendar
          </h3>
          <div className="mt-6 text-sm text-gra  y-500 text-center">
          <span className="inline-block w-5 h-5 bg-red-200 mr-2 align-middle" /> Booked &nbsp;
          <span className="inline-block w-5 h-5 bg-green-100 mr-2 align-middle" /> Available   &nbsp;
          <span className="inline-block w-5 h-5 bg-blue-400 mr-2 align-middle" /> Selected
          </div>
        </div>

        {/*Category Filter + ASAP Button + Year Toggle*/}
        <div className="flex justify-center items-center gap-4 mb-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
            onClick={handleGetAnyVehicleASAP}
          >
            {closestAvailableDate
              ? `A Vehicle is Available: ${closestAvailableDate.split("-").reverse().join("/")}`
              : "Get Any Vehicle ASAP"}
          </button>

          {["ALL", "XLT", "PRO"].map(cat => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                vehicleCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-400 hover:text-white"
              }`}
              onClick={() => setVehicleCategory(cat as "ALL" | "XLT" | "PRO")}
            >
              {cat}
            </button>
          ))}

          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${"bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition font-semibold"}`}
            onClick={() => setCalendarYear(prev => (prev === new Date().getFullYear() + 1 ? new Date().getFullYear() : new Date().getFullYear() + 1))}
          >
            {calendarYear === new Date().getFullYear() + 1 ? `← Back to ${new Date().getFullYear()} Calendar` : `Go to ${new Date().getFullYear() + 1} Calendar →`}
          </button>
        </div>

        {/*Vehicle List + Calendar*/}
        <div className="flex flex-col lg:flex-row w-full gap-8">
          {/*Vehicle List*/}
          <div className="flex-1 w-full lg:w-1/2">
            <h3 className="font-bold mb-4 text-center">
              {selectedDates.length === 2
              ? `Available from ${selectedDates[0].split("-").reverse().join("/")} to ${selectedDates[1].split("-").reverse().join("/")}`
              : selectedDates.length === 1
              ? `Available from ${selectedDates[0].split("-").reverse().join("/")} to ?`
              : 'Vehicles Available'}
            </h3>

            {availableVehicles.length > 0 ? (
              <ul className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
                {availableVehicles.map(vehicle => {
                  const highlightBlue = selectedVehicle?.vehicle_id === vehicle.vehicle_id;
                  const highlightGreen = selectedDates.length === 2 && !vehicle.isUnavailable && !highlightBlue;
                  return (
                    <li
                      key={vehicle.vehicle_id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 transition cursor-pointer
                        ${highlightGreen ? 'bg-green-200 dark:bg-green-700' : ''}
                        ${highlightBlue ? 'bg-blue-200 dark:bg-blue-800' : ''}
                        ${vehicle.isUnavailable ? 'bg-red-200 dark:bg-red-700' : ''}
                      `}
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">{vehicle.vehicle_id} - </span>
                        <span className="font-semibold italic text-gray-900 dark:text-white">{vehicle.nickname }</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">{vehicle.model}</span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400">{vehicle.trim}</span>
                        <span className="ml-4 text-xs text-gray-400">{vehicle.vin}</span>
                        {vehicle.isUnavailable && (
                          <div className="text-red-700 text-xs mt-1">
                            Conflicting booking: {vehicle.overlapStart.split("-").reverse().join("/")} to {vehicle.overlapEnd.split("-").reverse().join("/")}
                          </div>
                        )}
                      </div>
                      <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-medium
                        ${vehicle.isUnavailable ? "bg-red-500 text-white" : highlightBlue ? "bg-blue-500 text-white" : "bg-green-100 text-green-800"}
                      `}>
                        {vehicle.isUnavailable ? "Booked" : highlightBlue ? "Selected" : "Available"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              selectedDates.length === 2 && <div className="text-center text-gray-500 mt-10">No vehicles available for the selected dates.</div>
            )}

            <button
              className={`mt-4 w-full px-4 py-2 rounded font-semibold transition ${isBookButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              onClick={handleBookNow}
              disabled={isBookButtonDisabled}
            >
              Book Now
            </button>

            <button
              className="mt-2 w-full px-4 py-2 rounded font-semibold bg-gray-500 text-white hover:bg-gray-600 transition"
              onClick={handleClearDates}
            >
              Clear Dates
            </button>
          </div>

          {/*Calendar*/}
          <div className="flex-1 w-full lg:w-1/2 max-h-[50vh] overflow-y-auto">
            <Calendar
              year={calendarYear}
              vehicles={vehicles}
              bookings={filteredBookings}
              selectedVehicle={selectedVehicle}
              selectedDates={selectedDates}
              setSelectedDates={setSelectedDates}
              vehicleCategory={vehicleCategory}
            />
          </div>
        </div>

        {showBookingModal && selectedVehicle && selectedDates.length === 2 && (
          <BookingFormModal
            onClose={() => setShowBookingModal(false)}
            onBookingCreated={() => {
              loadData();
              setShowBookingModal(false);
              setSelectedDates([]);
              setSelectedVehicle(null);
            }}
            vehicle={selectedVehicle}
            selectedDates={selectedDates}
          />
        )}

        {showUnavailableModal && (
          <VehicleUnavailableModal onClose={() => setShowUnavailableModal(false)} />
        )}
      </main>
    </div>
  );
}



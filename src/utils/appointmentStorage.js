import { DEFAULT_SALON_SERVICES } from '../data/salonServices';

const APPOINTMENT_KEY = 'storewise_appointments';
const SERVICES_KEY = 'storewise_salon_services';

export const APPOINTMENT_STATUSES = ['Booked', 'Completed', 'Cancelled', 'No-show'];

export const getStoredAppointments = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(APPOINTMENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load appointments:', error);
    return [];
  }
};

export const saveStoredAppointments = (appointments) => {
  if (typeof window === 'undefined') return appointments;
  localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(appointments));
  window.dispatchEvent(new Event('appointments-updated'));
  return appointments;
};

export const addAppointment = (data) => {
  const appointments = getStoredAppointments();
  const newAppt = {
    id: `appt-${Date.now()}`,
    status: 'Booked',
    createdAt: new Date().toISOString(),
    ...data,
  };
  saveStoredAppointments([newAppt, ...appointments]);
  return newAppt;
};

export const updateAppointment = (id, updates) => {
  const appointments = getStoredAppointments();
  const next = appointments.map((a) => (a.id === id ? { ...a, ...updates } : a));
  saveStoredAppointments(next);
  return next;
};

export const deleteAppointment = (id) => {
  const appointments = getStoredAppointments();
  const next = appointments.filter((a) => a.id !== id);
  saveStoredAppointments(next);
  return next;
};

export const getStoredSalonServices = () => {
  if (typeof window === 'undefined') return DEFAULT_SALON_SERVICES;
  try {
    const stored = localStorage.getItem(SERVICES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.error('Failed to load salon services:', error);
  }
  localStorage.setItem(SERVICES_KEY, JSON.stringify(DEFAULT_SALON_SERVICES));
  return DEFAULT_SALON_SERVICES;
};

export const saveStoredSalonServices = (services) => {
  if (typeof window === 'undefined') return services;
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  window.dispatchEvent(new Event('salon-services-updated'));
  return services;
};
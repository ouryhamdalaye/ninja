import type { Booking } from "../types.js";

const bookings = new Map<string, Booking>();

export function saveBooking(booking: Booking): void {
  bookings.set(booking.id, booking);
}

export function getBooking(id: string): Booking | undefined {
  return bookings.get(id.toUpperCase());
}

export function cancelBooking(id: string): Booking | undefined {
  const booking = bookings.get(id.toUpperCase());
  if (!booking || booking.status === "cancelled") {
    return undefined;
  }

  const cancelled: Booking = { ...booking, status: "cancelled" };
  bookings.set(cancelled.id, cancelled);
  return cancelled;
}

export function createBookingId(): string {
  return `BK${Date.now().toString(36).toUpperCase()}`;
}

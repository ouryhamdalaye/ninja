export interface Airport {
  code: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  pricePerPassenger: number;
  currency: string;
  seatsAvailable: number;
}

export interface Booking {
  id: string;
  flightId: string;
  passengerName: string;
  passengerEmail: string;
  passengers: number;
  totalPrice: number;
  currency: string;
  status: "confirmed" | "cancelled";
  bookedAt: string;
  baggageCount?: number;
  baggageFee?: number;
  checkedIn?: boolean;
  boardingPassCode?: string;
  seat?: string;
}

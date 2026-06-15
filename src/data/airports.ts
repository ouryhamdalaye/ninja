import type { Airport } from "../types.js";

export const AIRPORTS: Airport[] = [
  { code: "CDG", city: "Paris", country: "France" },
  { code: "JFK", city: "New York", country: "USA" },
  { code: "LHR", city: "London", country: "UK" },
  { code: "LAX", city: "Los Angeles", country: "USA" },
  { code: "NRT", city: "Tokyo", country: "Japan" },
  { code: "DXB", city: "Dubai", country: "UAE" },
];

export function findAirport(code: string): Airport | undefined {
  return AIRPORTS.find((airport) => airport.code === code.toUpperCase());
}

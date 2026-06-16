import { getBooking, saveBooking } from "./bookings.js";
import { BAGGAGE_POLICY } from "./baggage-policy.js";

type AddBaggageSuccess = {
    ok: true;
    bookingId: string;
    baggageCount: number;
    baggageFee: number;
  };
  type AddBaggageFailure = {
    ok: false;
    message: string;
  };

export function addBaggage(bookingId: string, baggage: number): AddBaggageSuccess | AddBaggageFailure {
    const booking = getBooking(bookingId);
    if (!booking) {
        return {
            ok: false,
            message: "Booking not found",
        };
    }
     
    // Step 1 : get baggage policy
    const includedBags = BAGGAGE_POLICY.includedBags;
    const extraBagPrice = BAGGAGE_POLICY.extraBagPrice;
    const maxExtraBags = BAGGAGE_POLICY.maxExtraBags;

    // Step 2 : get how many bags are already booked
    const currentBaggageCount = booking.baggageCount ?? 0;

    // Step 3 : calculate the total number of bags
    const maxTotal = BAGGAGE_POLICY.includedBags + BAGGAGE_POLICY.maxExtraBags;
    const totalBaggageCount = currentBaggageCount + baggage;
    if (totalBaggageCount > maxTotal) {
        return {
            ok: false,
            message: `Cannot add ${baggage} bag(s). Maximum is ${maxTotal} total (${BAGGAGE_POLICY.maxExtraBags} extra).`,
        };
    }

    // Step 4 : calculate the total price of extra bags. extra bags are the bags that exceed the included bags
    const extraBagCount = totalBaggageCount - includedBags;
    const extraBagFee = extraBagCount * extraBagPrice;

    // Step 5 : update the booking with the new baggage count and fee
    booking.baggageCount = totalBaggageCount;
    booking.baggageFee = extraBagFee;

    // Step 6 : save the booking
    saveBooking(booking);

    // return booking id, baggage count, baggage fee
    return {
        ok: true,
        bookingId: booking.id,
        baggageCount: totalBaggageCount,
        baggageFee: extraBagFee,
    };
}
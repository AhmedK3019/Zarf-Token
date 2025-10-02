import { Court } from "../models/Court.js";

export function generateDailySlots(date) {
  const slots = [];
  const startHour = 10;
  const intervalMinutes = 90;
  const numSlots = 4;

  for (let i = 0; i < numSlots; i++) {
    const slotDate = new Date(date);
    slotDate.setHours(startHour + Math.floor((i * intervalMinutes) / 60));
    slotDate.setMinutes((i * intervalMinutes) % 60);
    slotDate.setSeconds(0);
    slotDate.setMilliseconds(0);

    slots.push({
      dateTime: slotDate,
      isReserved: false,
      reservationId: null,
    });
  }

  return slots;
}

export function generateMonthlySlots() {
  const slots = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + i);
    currentDay.setHours(0, 0, 0, 0);

    slots.push(...generateDailySlots(currentDay));
  }

  return slots;
}

export async function updateCourtSlots() {
  const courts = await Court.find();

  for (const court of courts) {
    // Remove slots that are in the past
    court.freeSlots = court.freeSlots.filter(
      (slot) => slot.dateTime >= new Date()
    );

    // Find the latest date in current slots
    let lastDate = new Date();
    if (court.freeSlots.length > 0) {
      lastDate = court.freeSlots[court.freeSlots.length - 1].dateTime;
    }

    // Add new slots until we have 30 days ahead
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 30);

    while (lastDate < targetDate) {
      const nextDay = new Date(lastDate);
      nextDay.setDate(lastDate.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      court.freeSlots.push(...generateDailySlots(nextDay));

      lastDate = nextDay;
    }

    await court.save();
  }
}

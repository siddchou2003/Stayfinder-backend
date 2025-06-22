import cron from 'node-cron';
import Booking from '../models/booking.model.js';

/**
 * Cron Job: Runs every hour at minute 0
 * - Expires unpaid bookings older than 30 minutes
 * - Marks confirmed bookings as 'completed' if their end date + checkout time has passed
 */
cron.schedule('0 * * * *', async () => {
  const now = new Date();

  // Expire unpaid bookings older than 30 minutes
  const unpaid = await Booking.updateMany(
    {
      isPaid: false,
      createdAt: { $lte: new Date(Date.now() - 30 * 60 * 1000) },
      status: 'pending',
    },
    { $set: { status: 'expired' } }
  );

  // Mark confirmed, paid bookings as completed if past end date + check-out time
  const confirmedBookings = await Booking.find({ status: 'confirmed', isPaid: true });

  for (const booking of confirmedBookings) {
    const end = new Date(booking.endDate);

    // Add checkout time (HH:mm) to endDate
    const [hours, minutes] = booking.checkOutTime.split(':');
    end.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If current time is past the end time, mark as completed
    if (now > end) {
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { status: 'completed' } }
      );
    }
  }

  // Log summary of job actions
  console.log(
    `⏱️ Booking cleanup job ran. ${unpaid.modifiedCount} unpaid bookings expired.`
  );
});
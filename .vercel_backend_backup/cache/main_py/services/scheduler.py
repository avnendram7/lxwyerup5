"""
scheduler.py — background job that auto-cancels bookings whose reschedule
deadline has passed without either party accepting the new time.

Runs as an asyncio task every 60 seconds.
"""

import asyncio
from datetime import datetime
from services.database import db
from routes.notifications import create_notification


async def auto_cancel_expired_reschedules():
    """Find bookings in a reschedule-pending state whose deadline has passed and cancel them."""
    pending_statuses = ['rescheduled_by_lawyer', 'rescheduled_by_user']
    now_iso = datetime.utcnow().isoformat()

    expired = await db.bookings.find({
        'status': {'$in': pending_statuses},
        'reschedule_deadline': {'$lt': now_iso, '$ne': None},
    }).to_list(100)

    for booking in expired:
        booking_id = booking.get('id')
        if not booking_id:
            continue

        await db.bookings.update_one(
            {'id': booking_id},
            {'$set': {
                'status': 'cancelled',
                'cancel_reason': 'Reschedule deadline expired — appointment auto-cancelled',
                'proposed_date': None,
                'proposed_time': None,
                'reschedule_by': None,
                'reschedule_deadline': None,
            }}
        )

        # Notify both parties
        who_initiated = booking.get('reschedule_by', 'lawyer')
        client_id = booking.get('client_id')
        lawyer_id = booking.get('lawyer_id')

        if client_id:
            await create_notification(
                user_id=client_id,
                title="❌ Appointment Auto-Cancelled",
                message="The reschedule window expired without agreement. Your appointment has been automatically cancelled.",
                n_type="booking_cancelled",
                related_id=booking_id
            )
        if lawyer_id:
            await create_notification(
                user_id=lawyer_id,
                title="❌ Appointment Auto-Cancelled",
                message="The reschedule window expired without agreement. The appointment has been automatically cancelled.",
                n_type="booking_cancelled",
                related_id=booking_id
            )

        print(f"[Scheduler] Auto-cancelled booking {booking_id} (deadline expired, initiated by {who_initiated})")


async def run_scheduler():
    """Infinite loop — checks every 60 seconds for expired reschedule deadlines."""
    print("[Scheduler] Auto-cancel scheduler started.")
    while True:
        try:
            await auto_cancel_expired_reschedules()
        except Exception as e:
            print(f"[Scheduler] Error during auto-cancel check: {e}")
        await asyncio.sleep(60)

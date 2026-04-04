from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from services.database import db
from routes.auth import get_current_user

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get("/history")
async def get_billing_history(current_user: dict = Depends(get_current_user)):
    """Get billing/payment history for current user"""
    user_id = current_user.get('id', '')
    mongo_id = str(current_user.get('_id', ''))

    # Lawyers see payments from their bookings
    if current_user.get('user_type') == 'lawyer':
        id_vals = list({v for v in [user_id, mongo_id] if v})
        bookings = await db.bookings.find(
            {'lawyer_id': {'$in': id_vals}, 'status': {'$in': ['confirmed', 'completed']}},
            {'_id': 0}
        ).sort('created_at', -1).limit(50).to_list(50)

        history = []
        for b in bookings:
            history.append({
                'id': b.get('id'),
                'type': 'income',
                'amount': b.get('price', 0) or b.get('amount', 0),
                'currency': 'INR',
                'description': f"Consultation with {b.get('client_name', 'Client')}",
                'date': b.get('date') or b.get('created_at', ''),
                'status': b.get('payment_status', 'paid'),
                'consultation_type': b.get('consultation_type', 'video'),
            })
        return history

    # Clients see their own payments
    id_vals = list({v for v in [user_id, mongo_id] if v})
    bookings = await db.bookings.find(
        {'client_id': {'$in': id_vals}},
        {'_id': 0}
    ).sort('created_at', -1).limit(50).to_list(50)

    history = []
    for b in bookings:
        history.append({
            'id': b.get('id'),
            'type': 'payment',
            'amount': b.get('price', 0) or b.get('amount', 0),
            'currency': 'INR',
            'description': f"Legal Consultation",
            'date': b.get('date') or b.get('created_at', ''),
            'status': b.get('payment_status', 'paid'),
            'consultation_type': b.get('consultation_type', 'video'),
        })
    return history


@router.get("/stats")
async def get_billing_stats(current_user: dict = Depends(get_current_user)):
    """Get billing statistics"""
    user_id = current_user.get('id', '')
    mongo_id = str(current_user.get('_id', ''))
    id_vals = list({v for v in [user_id, mongo_id] if v})

    if current_user.get('user_type') == 'lawyer':
        bookings = await db.bookings.find(
            {'lawyer_id': {'$in': id_vals}, 'status': {'$in': ['confirmed', 'completed']}},
            {'_id': 0}
        ).to_list(1000)
        total_earned = sum(b.get('price', 0) or b.get('amount', 0) for b in bookings)
        return {
            'total_earned': total_earned,
            'total_transactions': len(bookings),
            'pending_payments': 0,
            'currency': 'INR'
        }

    bookings = await db.bookings.find(
        {'client_id': {'$in': id_vals}},
        {'_id': 0}
    ).to_list(1000)
    total_spent = sum(b.get('price', 0) or b.get('amount', 0) for b in bookings)
    return {
        'total_spent': total_spent,
        'total_transactions': len(bookings),
        'currency': 'INR'
    }

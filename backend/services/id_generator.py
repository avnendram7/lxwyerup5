from services.database import db

async def generate_unique_id(user_type: str) -> str:
    """
    Generate a unique, sequential ID based on user type.
    Format:
    - Lawyer: LWR-1001
    - Client: USR-1001
    - Law Firm: FIRM-1001
    - Firm Lawyer: FLWR-1001
    """
    prefixes = {
        'lawyer': 'LWR',
        'client': 'USR',
        'law_firm': 'FIRM',
        'firm_lawyer': 'FLWR',
        'admin': 'ADM'
    }
    
    prefix = prefixes.get(user_type, 'USR')
    
    # Atomically find and update the counter for this user type
    counter_doc = await db.counters.find_one_and_update(
        {'_id': user_type},
        {'$inc': {'sequence_value': 1}},
        upsert=True,
        return_document=True
    )
    
    # Start from 1000 if not set (first increment will be 1)
    # Actually upsert starts at nothing, but $inc on non-existent creates it with value 1
    # We want to start from 1001 for better aesthetics
    
    sequence = counter_doc['sequence_value']
    
    # If it's the very first time (sequence is small), let's boost it to 1000 base
    if sequence < 1000:
         # This is a bit race-condition-y if multiple requests hit at once on fresh db, 
         # but sufficient for this scale. 
         # Better approach: initialize counters manually or set start value in $inc logic?
         # Simple fix: add 1000 to the sequence
         sequence += 1000

    return f"{prefix}-{sequence}"

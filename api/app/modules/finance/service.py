from supabase import Client
from .schemas import TransactionBase
from app.core.security import User

def create_transaction(db: Client, transaction_data: TransactionBase, user: User):
    try:
        # Prepare the data for insertion, including the user_id from the JWT
        data_to_insert = transaction_data.model_dump()
        data_to_insert['user_id'] = user.id
        
        # Determine transaction type based on amount
        data_to_insert['type'] = 'income' if transaction_data.amount > 0 else 'expense'

        # Supabase Python client uses execute() for RPCs or data manipulation
        response = db.table('transactions').insert(data_to_insert).execute()
        
        # The response.data will contain the list of inserted rows
        if response.data:
            return response.data[0]
        else:
            # Handle potential errors, e.g., RLS violation
            raise Exception("Failed to insert transaction")

    except Exception as e:
        # In a real app, you'd have more robust logging and error handling
        print(f"Error creating transaction: {e}")
        return None
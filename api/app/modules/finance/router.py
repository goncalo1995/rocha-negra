from fastapi import APIRouter, Depends, Body, HTTPException, status
from supabase import Client

from app.core.security import get_current_user, User
from app.core.db import get_db_client
from app.services import llm_service
from .schemas import TransactionCreateLLM, TransactionBase, Transaction
from . import service as finance_service # Import the service

router = APIRouter()

@router.post("/transactions/parse", response_model=TransactionCreateLLM)
def parse_transaction(
    text: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    """
    Parses natural language text into a structured transaction using an LLM.
    This endpoint is protected and requires authentication.
    """
    # The current_user object is available, so you know who is making the request.
    # You would use current_user.id when saving to the database.
    structured_data = llm_service.parse_transaction_from_text(text)
    return structured_data

@router.post("/transactions", response_model=Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: TransactionBase,
    current_user: User = Depends(get_current_user),
    db: Client = Depends(get_db_client)
):
    """
    Creates a new transaction from structured data and saves it to the database.
    """
    new_transaction = finance_service.create_transaction(
        db=db,
        transaction_data=transaction,
        user=current_user
    )
    if not new_transaction:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create transaction."
        )
    return new_transaction
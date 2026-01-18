from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class TransactionBase(BaseModel):
    description: str
    amount: float
    date: datetime
    category: Optional[str] = None
    asset_id: Optional[str] = None # Assuming assets are identified by a string ID
    custom_fields: Optional[Dict[str, Any]] = None

class TransactionCreateLLM(BaseModel):
    description: str = Field(description="A concise description of the transaction.")
    amount: float = Field(description="The numeric value of the transaction. Expenses should be positive.")
    date: datetime = Field(description="The date and time of the transaction in ISO 8601 format.")
    category: str = Field(description="Infer a relevant category, e.g., 'Food', 'Transport', 'Utilities', 'Shopping'.")

class Transaction(TransactionBase):
    id: str
    user_id: str
    created_at: datetime
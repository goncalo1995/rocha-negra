from fastapi import APIRouter, Depends
from app.core.security import get_current_user, User

router = APIRouter()

@router.get("/")
def get_user_vehicles(current_user: User = Depends(get_current_user)):
    """
    Placeholder to get all vehicles for the authenticated user.
    """
    # In a real app, you would fetch this from the database
    return [
        {"id": "veh_1", "user_id": current_user.id, "name": "My Sedan", "make": "Toyota"},
        {"id": "veh_2", "user_id": current_user.id, "name": "Work Truck", "make": "Ford"},
    ]
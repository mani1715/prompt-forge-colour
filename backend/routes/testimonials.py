from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
import uuid

from database import testimonials_collection, clients_collection
from schemas.testimonial import TestimonialCreate, TestimonialSubmit, TestimonialUpdate, TestimonialResponse
from auth.admin_auth import get_current_admin
from auth.client_auth import get_current_client

router = APIRouter()


# Helper function to convert MongoDB document to response format
def testimonial_helper(testimonial) -> dict:
    return {
        "id": testimonial["id"],
        "name": testimonial["name"],
        "role": testimonial.get("role"),
        "company": testimonial.get("company"),
        "email": testimonial.get("email"),
        "message": testimonial["message"],
        "rating": testimonial["rating"],
        "image": testimonial.get("image"),
        "status": testimonial["status"],
        "source": testimonial.get("source", "admin_created"),
        "verified": testimonial.get("verified", False),
        "created_at": testimonial["created_at"],
        "updated_at": testimonial["updated_at"]
    }


# ================================
# PUBLIC ROUTES
# ================================

@router.get("/", response_model=List[TestimonialResponse])
async def get_public_testimonials():
    """Get all approved testimonials (public endpoint)"""
    try:
        testimonials = []
        async for testimonial in testimonials_collection.find({"status": "approved"}):
            testimonials.append(testimonial_helper(testimonial))
        
        # Sort by created_at descending (newest first)
        testimonials.sort(key=lambda x: x["created_at"], reverse=True)
        
        return testimonials
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching testimonials: {str(e)}")


@router.post("/submit", response_model=dict, status_code=201)
async def submit_testimonial(testimonial: TestimonialSubmit):
    """Public endpoint for customers to submit testimonials"""
    try:
        testimonial_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        testimonial_dict = {
            "id": testimonial_id,
            "name": testimonial.name,
            "role": testimonial.role,
            "company": testimonial.company,
            "email": testimonial.email,
            "message": testimonial.message,
            "rating": testimonial.rating,
            "image": None,  # Image can be added by admin later
            "status": "pending",  # All customer submissions start as pending
            "source": "public_submitted",
            "verified": False,
            "client_id": None,
            "created_at": now,
            "updated_at": now
        }
        
        await testimonials_collection.insert_one(testimonial_dict)
        
        return {
            "message": "Thank you for your testimonial! It has been submitted for review.",
            "id": testimonial_id,
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting testimonial: {str(e)}")


# ================================
# ADMIN ROUTES (JWT Protected)
# ================================

@router.get("/admin/all", response_model=List[TestimonialResponse])
async def get_all_testimonials(current_admin: dict = Depends(get_current_admin)):
    """Get all testimonials (admin only - includes pending)"""
    try:
        testimonials = []
        async for testimonial in testimonials_collection.find():
            testimonials.append(testimonial_helper(testimonial))
        
        # Sort by created_at descending (newest first)
        testimonials.sort(key=lambda x: x["created_at"], reverse=True)
        
        return testimonials
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching testimonials: {str(e)}")


@router.post("/admin/create", response_model=TestimonialResponse, status_code=201)
async def create_testimonial(
    testimonial: TestimonialCreate,
    current_admin: dict = Depends(get_current_admin)
):
    """Create a new testimonial (admin only)"""
    try:
        testimonial_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        testimonial_dict = {
            "id": testimonial_id,
            "name": testimonial.name,
            "role": testimonial.role,
            "company": testimonial.company,
            "email": testimonial.email,
            "message": testimonial.message,
            "rating": testimonial.rating,
            "image": testimonial.image,
            "status": testimonial.status,
            "source": testimonial.source,
            "verified": testimonial.verified,
            "created_at": now,
            "updated_at": now
        }
        
        await testimonials_collection.insert_one(testimonial_dict)
        
        return testimonial_helper(testimonial_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating testimonial: {str(e)}")


@router.put("/admin/{testimonial_id}", response_model=TestimonialResponse)
async def update_testimonial(
    testimonial_id: str,
    testimonial_update: TestimonialUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update an existing testimonial (admin only)"""
    try:
        # Find existing testimonial
        existing_testimonial = await testimonials_collection.find_one({"id": testimonial_id})
        if not existing_testimonial:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        # Prepare update data
        update_data = {k: v for k, v in testimonial_update.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated_at timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        # Update testimonial
        await testimonials_collection.update_one(
            {"id": testimonial_id},
            {"$set": update_data}
        )
        
        # Fetch and return updated testimonial
        updated_testimonial = await testimonials_collection.find_one({"id": testimonial_id})
        return testimonial_helper(updated_testimonial)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating testimonial: {str(e)}")


@router.delete("/admin/{testimonial_id}", status_code=200)
async def delete_testimonial(
    testimonial_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete a testimonial (admin only)"""
    try:
        # Check if testimonial exists
        existing_testimonial = await testimonials_collection.find_one({"id": testimonial_id})
        if not existing_testimonial:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        # Delete testimonial
        result = await testimonials_collection.delete_one({"id": testimonial_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        return {"message": "Testimonial deleted successfully", "id": testimonial_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting testimonial: {str(e)}")

from fastapi import APIRouter, HTTPException, status
from typing import List
from models.firm_client import (
    FirmClientApplication, FirmClient, FirmClientLogin, ClientCaseUpdate
)
from services.database import db
from passlib.context import CryptContext
from datetime import datetime
import os
from jose import jwt

router = APIRouter(prefix="/firm-clients", tags=["Firm Clients"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Submit client application to join a law firm
@router.post("/applications")
async def submit_firm_client_application(application: FirmClientApplication):
    """Submit application to join a law firm as a client"""
    try:
        collection = db.firm_client_applications
        
        # Check if already applied
        existing = await collection.find_one({"email": application.email, "law_firm_id": application.law_firm_id})
        if existing and existing.get("status") == "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have a pending application for this law firm"
            )
        
        app_dict = application.model_dump()
        
        # Hash the password before storing
        app_dict["password"] = pwd_context.hash(application.password)
        
        await collection.insert_one(app_dict)
        
        return {
            "message": "Application submitted successfully",
            "application_id": application.id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting application: {str(e)}"
        )

# Get all client applications for a law firm
@router.get("/applications/firm/{law_firm_id}")
async def get_firm_client_applications(law_firm_id: str, status: str = None):
    """Get all client applications for a specific law firm"""
    try:
        collection = db.firm_client_applications
        query = {"law_firm_id": law_firm_id}
        
        if status:
            query["status"] = status
        
        applications = await collection.find(query).to_list(length=100)
        
        # Convert ObjectId to string if present
        for app in applications:
            if "_id" in app:
                app["_id"] = str(app["_id"])
        
        return applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching applications: {str(e)}"
        )

# Get ALL client applications (for admin)
@router.get("/applications/all")
async def get_all_client_applications():
    """Get all client applications across all law firms (Admin only)"""
    try:
        collection = db.firm_client_applications
        applications = await collection.find({}).to_list(length=1000)
        
        # Convert ObjectId to string if present
        for app in applications:
            if "_id" in app:
                app["_id"] = str(app["_id"])
        
        return applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching applications: {str(e)}"
        )

# Approve/Reject client application
@router.put("/applications/{application_id}/status")
async def update_client_application_status(
    application_id: str,
    status_update: dict
):
    """Approve or reject a client application"""
    try:
        collection = db.firm_client_applications
        
        # Get application
        application = await collection.find_one({"id": application_id})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        new_status = status_update.get("status")
        reviewer_email = status_update.get("reviewed_by")
        assigned_lawyer_id = status_update.get("assigned_lawyer_id")
        assigned_lawyer_name = status_update.get("assigned_lawyer_name")
        
        # Update application status
        await collection.update_one(
            {"id": application_id},
            {
                "$set": {
                    "status": new_status,
                    "reviewed_at": datetime.utcnow(),
                    "reviewed_by": reviewer_email,
                    "rejection_reason": status_update.get("rejection_reason")
                }
            }
        )
        
        # If approved, create client account
        if new_status == "approved":
            # Use the password from the application (already hashed)
            hashed_password = application.get("password")
            
            # If password doesn't exist (old applications), generate a temp password
            if not hashed_password:
                temp_password = f"Client@{application['email'].split('@')[0][:4]}{application_id[:4]}"
                hashed_password = pwd_context.hash(temp_password)
            
            client = FirmClient(
                id=application_id,
                full_name=application["full_name"],
                email=application["email"],
                password=hashed_password,
                phone=application["phone"],
                company_name=application.get("company_name"),
                case_type=application["case_type"],
                case_description=application["case_description"],
                law_firm_id=application["law_firm_id"],
                law_firm_name=application["law_firm_name"],
                assigned_lawyer_id=assigned_lawyer_id,
                assigned_lawyer_name=assigned_lawyer_name,
                status="active"
            )
            
            clients_collection = db.firm_clients
            await clients_collection.insert_one(client.model_dump())
            
            return {
                "message": "Application approved and client account created",
                "client_id": client.id
            }
        
        return {"message": f"Application {new_status} successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating application status: {str(e)}"
        )

# Direct registration for paid clients (requires admin approval)
@router.post("/register-paid")
async def register_paid_firm_client(client_data: dict):
    """
    Register a firm client after payment.
    Status is set to 'pending_approval' - admin must approve before login.
    """
    try:
        clients_collection = db.firm_clients
        
        # Check if client already exists
        existing = await clients_collection.find_one({"email": client_data.get("email")})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered. Please login instead."
            )
        
        # Hash password
        hashed_password = pwd_context.hash(client_data.get("password"))
        
        # Create client ID
        import uuid
        client_id = uuid.uuid4().hex
        
        # Create client record with pending_approval status
        client = {
            "id": client_id,
            "full_name": client_data.get("full_name"),
            "email": client_data.get("email"),
            "password": hashed_password,
            "phone": client_data.get("phone"),
            "company_name": client_data.get("company_name"),
            "case_type": client_data.get("case_type"),
            "case_description": client_data.get("case_description"),
            "law_firm_id": client_data.get("law_firm_id"),
            "law_firm_name": client_data.get("law_firm_name"),
            "assigned_lawyer_id": None,
            "assigned_lawyer_name": None,
            "status": "active",
            "payment_status": "paid",
            "payment_amount": client_data.get("payment_amount"),
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow()
        }
        
        await clients_collection.insert_one(client)
        
        # Remove password and _id from response
        client.pop("password", None)
        client.pop("_id", None)

        # Generate token
        token_data = {
            "email": client["email"],
            "role": "firm_client",
            "client_id": client_id,
            "law_firm_id": client["law_firm_id"]
        }
        token = jwt.encode(
            token_data,
            os.environ.get("JWT_SECRET", "secret"),
            algorithm="HS256"
        )
        
        return {
            "message": "Registration successful! You can now access your dashboard.",
            "token": token,
            "user": client,
            "role": "firm_client",
            "status": "active"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )

# Get all pending firm client approvals (for admin)
@router.get("/pending-approvals")
async def get_pending_firm_clients():
    """Get all firm clients pending approval (Admin only)"""
    try:
        collection = db.firm_clients
        pending = await collection.find({"status": "pending_approval"}, {"password": 0}).to_list(length=100)
        
        for client in pending:
            if "_id" in client:
                client["_id"] = str(client["_id"])
        
        return pending
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pending clients: {str(e)}"
        )

# Approve or reject firm client (Admin only)
@router.put("/{client_id}/approve")
async def approve_firm_client(client_id: str, approval_data: dict):
    """Approve or reject a firm client application"""
    try:
        collection = db.firm_clients
        
        # Find the client
        client = await collection.find_one({"id": client_id})
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        
        action = approval_data.get("action", "approve")  # approve or reject
        
        if action == "approve":
            new_status = "active"
            message = "Client approved successfully"
        else:
            new_status = "rejected"
            message = "Client rejected"
        
        # Update client status
        await collection.update_one(
            {"id": client_id},
            {
                "$set": {
                    "status": new_status,
                    "approved_at": datetime.utcnow().isoformat() if action == "approve" else None,
                    "approved_by": approval_data.get("approved_by"),
                    "rejection_reason": approval_data.get("rejection_reason") if action == "reject" else None
                }
            }
        )
        
        return {"message": message, "status": new_status}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating client status: {str(e)}"
        )

# Client login
@router.post("/login")
async def firm_client_login(credentials: FirmClientLogin):
    """Login for firm clients"""
    try:
        collection = db.firm_clients
        
        # Find client in firm_clients collection
        client = await collection.find_one({"email": credentials.email})
        
        # If not found, check applications with approved status
        if not client:
            applications_collection = db.firm_client_applications
            application = await applications_collection.find_one({
                "email": credentials.email,
                "status": "approved"
            })
            
            if application:
                # Check if password exists in application (from old flow)
                if "password" in application and application.get("password"):
                    if not pwd_context.verify(credentials.password, application["password"]):
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid credentials"
                        )
                    client = application
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Your account was created before the new system. Please sign up again through 'I Want a Law Firm' option to set your password."
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No account found with this email. Please sign up first by selecting a law firm."
                )
        else:
            # Check if account is approved
            client_status = client.get("status", "active")
            if client_status == "pending_approval":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your account is pending admin approval. Please wait for approval before logging in."
                )
            elif client_status == "rejected":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your account application was rejected. Please contact support for more information."
                )
            
            # Verify password
            if not pwd_context.verify(credentials.password, client["password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
        
        # Update last login
        if client.get("_id"):
            await collection.update_one(
                {"email": credentials.email},
                {"$set": {"last_login": datetime.utcnow()}}
            )
        
        # Generate token
        token_data = {
            "email": client["email"],
            "role": "firm_client",
            "client_id": client.get("id", str(client.get("_id", ""))),
            "law_firm_id": client.get("law_firm_id", "")
        }
        token = jwt.encode(
            token_data,
            os.environ.get("JWT_SECRET", "secret"),
            algorithm="HS256"
        )
        
        # Prepare response - remove sensitive data
        response_client = {
            "id": client.get("id", str(client.get("_id", ""))),
            "full_name": client.get("full_name"),
            "email": client.get("email"),
            "phone": client.get("phone"),
            "law_firm_id": client.get("law_firm_id"),
            "law_firm_name": client.get("law_firm_name"),
            "case_type": client.get("case_type"),
            "case_description": client.get("case_description"),
            "assigned_lawyer_id": client.get("assigned_lawyer_id"),
            "assigned_lawyer_name": client.get("assigned_lawyer_name"),
            "status": client.get("status", "active"),
            "payment_status": client.get("payment_status"),
            "payment_amount": client.get("payment_amount"),
            "created_at": str(client.get("created_at", "")),
        }
        
        return {
            "token": token,
            "user": response_client,
            "role": "firm_client"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

# Get client details
@router.get("/{client_id}")
async def get_client_details(client_id: str):
    """Get firm client details"""
    try:
        collection = db.firm_clients
        client = await collection.find_one({"id": client_id})
        
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        
        client.pop("password", None)
        if "_id" in client:
            client["_id"] = str(client["_id"])
        
        return client
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching client: {str(e)}"
        )

# Get all clients for a law firm
@router.get("/firm/{law_firm_id}/list")
async def get_firm_clients(law_firm_id: str):
    """Get all clients for a law firm"""
    try:
        collection = db.firm_clients
        clients = await collection.find({"law_firm_id": law_firm_id}).to_list(length=100)
        
        for client in clients:
            client.pop("password", None)
            if "_id" in client:
                client["_id"] = str(client["_id"])
        
        return clients
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching clients: {str(e)}"
        )

# Add case update
@router.post("/case-updates")
async def add_case_update(update: ClientCaseUpdate):
    """Add a case progress update for a client"""
    try:
        collection = db.client_case_updates
        
        update_dict = update.model_dump()
        await collection.insert_one(update_dict)
        
        return {"message": "Case update added successfully", "update_id": update.id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding update: {str(e)}"
        )

# Get case updates for a client
@router.get("/{client_id}/case-updates")
async def get_client_case_updates(client_id: str):
    """Get all case updates for a client"""
    try:
        collection = db.client_case_updates
        updates = await collection.find({"client_id": client_id}).sort("created_at", -1).to_list(length=100)
        
        for update in updates:
            if "_id" in update:
                update["_id"] = str(update["_id"])
        
        return updates
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching updates: {str(e)}"
        )

# Assign lawyer to client
@router.put("/{client_id}/assign-lawyer")
async def assign_lawyer_to_client(client_id: str, assignment: dict):
    """Assign or change lawyer for a client"""
    try:
        collection = db.firm_clients
        
        result = await collection.update_one(
            {"id": client_id},
            {
                "$set": {
                    "assigned_lawyer_id": assignment.get("lawyer_id"),
                    "assigned_lawyer_name": assignment.get("lawyer_name")
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        
        return {"message": "Lawyer assigned successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning lawyer: {str(e)}"
        )

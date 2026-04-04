from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from typing import List, Optional
from datetime import datetime
import os
import shutil
import uuid
from pathlib import Path
from models.document import Document, DocumentCreate
from services.database import db
from routes.auth import get_current_user

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
try:
    if not UPLOAD_DIR.exists():
        UPLOAD_DIR.mkdir(parents=True)
except Exception:
    pass  # In Serverless environments like Vercel, filesystem is read-only

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/ping")
async def ping_documents():
    return {"status": "ok", "message": "Documents router is reachable"}


@router.post("", response_model=Document)
async def create_document(doc_data: DocumentCreate, current_user: dict = Depends(get_current_user)):
    """Create a new document"""
    doc_dict = doc_data.model_dump()
    doc_dict['user_id'] = current_user['id']
    doc_obj = Document(**doc_dict)
    
    doc = doc_obj.model_dump()
    doc['uploaded_at'] = doc['uploaded_at'].isoformat()
    
    await db.documents.insert_one(doc)
    return doc_obj


@router.get("", response_model=List[Document])
async def get_documents(case_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get documents for current user, optionally filtered by case"""
    query = {'user_id': current_user['id']}
    if case_id:
        query['case_id'] = case_id
    
    documents = await db.documents.find(query, {'_id': 0}).to_list(100)
    
    for doc in documents:
        if isinstance(doc['uploaded_at'], str):
            dt_str = doc['uploaded_at'].replace('Z', '+00:00') if doc['uploaded_at'].endswith('Z') else doc['uploaded_at']
            doc['uploaded_at'] = datetime.fromisoformat(dt_str)
    
    return documents
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    case_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    print(f"DEBUG: Receiving file upload: {file.filename}, type: {file.content_type}")
    print(f"DEBUG: Receiving file upload: {file.filename}, type: {file.content_type}")
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    saved_filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / saved_filename
    
    try:
        # Save file asynchronously
        import anyio
        print(f"DEBUG: Writing file to {file_path}...")
        async with await anyio.open_file(file_path, "wb") as f:
            while chunk := await file.read(1024 * 1024): # 1MB chunks
                await f.write(chunk)
        print(f"DEBUG: File written successfully.")
    except Exception as e:
        print(f"ERROR: Failed to save file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    doc_title = title if title else file.filename
    file_url = f"/uploads/{saved_filename}"
    file_size = os.path.getsize(file_path)
    
    doc_obj = Document(
        id=file_id,
        user_id=current_user['id'],
        case_id=case_id or "unassigned",
        title=doc_title,
        file_url=file_url,
        file_type=file.content_type or "application/octet-stream",
        file_size=file_size
    )
    
    doc = doc_obj.model_dump()
    doc['uploaded_at'] = doc['uploaded_at'].isoformat()
    
    try:
        print(f"DEBUG: Inserting document into DB: {file_id}")
        await db.documents.insert_one(doc)
        print(f"DEBUG: DB insertion successful.")
    except Exception as e:
        print(f"ERROR: DB insertion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    return doc_obj

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a document and its file"""
    print(f"DEBUG: Attempting to delete document: {doc_id} for user: {current_user['id']}")
    
    doc = await db.documents.find_one({"id": doc_id, "user_id": current_user["id"]})
    if not doc:
        print(f"ERROR: Document {doc_id} not found or unauthorized")
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Remove file from disk
    file_url = doc.get("file_url", "")
    print(f"DEBUG: Found document in DB. File URL: {file_url}")
    
    if file_url.startswith("/uploads/"):
        filename = file_url.replace("/uploads/", "")
        file_path = UPLOAD_DIR / filename
        print(f"DEBUG: Deleting file: {file_path}")
        if file_path.exists():
            os.remove(file_path)
            print(f"DEBUG: File removed from disk.")
        else:
            print(f"WARNING: File not found on disk at {file_path}")
            
    # Remove from DB
    await db.documents.delete_one({"id": doc_id})
    print(f"DEBUG: Document record removed from database.")
    return {"success": True}
@router.post("/{doc_id}/share")
async def share_document(doc_id: str, client_id: str = Form(...), current_user: dict = Depends(get_current_user)):
    """Share a document with a client"""
    doc = await db.documents.find_one({"id": doc_id, "user_id": current_user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    await db.documents.update_one(
        {"id": doc_id},
        {"$addToSet": {"shared_with": client_id}}
    )
    
    # Optionally create a notification for the client
    from routes.notifications import create_notification
    await create_notification(
        user_id=client_id,
        title="Document Shared",
        message=f"Lawyer {current_user.get('full_name', 'Legal Partner')} shared a document: {doc['title']}",
        n_type="document_shared",
        related_id=doc_id
    )
    
    return {"success": True}

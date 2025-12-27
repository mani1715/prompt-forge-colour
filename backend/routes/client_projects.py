from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import FileResponse
from typing import List
from schemas.client_project import (
    ClientProjectResponse, CommentCreate, CommentResponse,
    MilestoneResponse, TaskResponse, ProjectFileResponse,
    ActivityResponse, TeamMemberResponse, BudgetResponse,
    ChatMessageCreate, ChatMessageResponse
)
from database import client_projects_collection
from auth.client_auth import get_current_client
from models.client_project import ProjectComment, ProjectActivity
from models.client_project import ChatMessage
from datetime import datetime
import os

router = APIRouter(prefix="/client/projects", tags=["client-projects"])

def convert_project_to_response(project_doc) -> ClientProjectResponse:
    """Helper function to convert project document to response"""
    return ClientProjectResponse(
        id=project_doc['id'],
        name=project_doc['name'],
        client_id=project_doc['client_id'],
        description=project_doc.get('description'),
        status=project_doc['status'],
        priority=project_doc.get('priority', 'medium'),
        progress=project_doc['progress'],
        start_date=str(project_doc['start_date']) if project_doc.get('start_date') else None,
        expected_delivery=str(project_doc['expected_delivery']) if project_doc.get('expected_delivery') else None,
        actual_delivery=str(project_doc['actual_delivery']) if project_doc.get('actual_delivery') else None,
        notes=project_doc.get('notes'),
        milestones=[
            MilestoneResponse(
                id=m['id'],
                title=m['title'],
                description=m.get('description'),
                due_date=str(m['due_date']) if m.get('due_date') else None,
                status=m['status'],
                completion_date=m.get('completion_date'),
                order=m.get('order', 0),
                created_at=m['created_at'] if isinstance(m['created_at'], str) else m['created_at'].isoformat()
            ) for m in project_doc.get('milestones', [])
        ],
        tasks=[
            TaskResponse(
                id=t['id'],
                title=t['title'],
                description=t.get('description'),
                status=t['status'],
                priority=t.get('priority', 'medium'),
                assigned_to=t.get('assigned_to'),
                due_date=str(t['due_date']) if t.get('due_date') else None,
                completed_at=t.get('completed_at'),
                milestone_id=t.get('milestone_id'),
                created_at=t['created_at'] if isinstance(t['created_at'], str) else t['created_at'].isoformat()
            ) for t in project_doc.get('tasks', [])
        ],
        files=[
            ProjectFileResponse(
                id=f['id'],
                filename=f['filename'],
                file_path=f['file_path'],
                uploaded_at=f['uploaded_at'] if isinstance(f['uploaded_at'], str) else f['uploaded_at'].isoformat(),
                uploaded_by=f['uploaded_by'],
                file_size=f.get('file_size', 0),
                file_type=f.get('file_type')
            ) for f in project_doc.get('files', [])
        ],
        comments=[
            CommentResponse(
                id=c['id'],
                user_id=c['user_id'],
                user_name=c['user_name'],
                user_type=c['user_type'],
                message=c['message'],
                created_at=c['created_at'] if isinstance(c['created_at'], str) else c['created_at'].isoformat()
            ) for c in project_doc.get('comments', [])
        ],
        chat_messages=[
            ChatMessageResponse(
                id=cm['id'],
                sender_id=cm['sender_id'],
                sender_name=cm['sender_name'],
                sender_type=cm['sender_type'],
                message=cm['message'],
                read=cm.get('read', False),
                created_at=cm['created_at'] if isinstance(cm['created_at'], str) else cm['created_at'].isoformat()
            ) for cm in project_doc.get('chat_messages', [])
        ],
        activity_log=[
            ActivityResponse(
                id=a['id'],
                action=a['action'],
                description=a['description'],
                user_id=a['user_id'],
                user_name=a['user_name'],
                timestamp=a['timestamp'] if isinstance(a['timestamp'], str) else a['timestamp'].isoformat(),
                metadata=a.get('metadata')
            ) for a in project_doc.get('activity_log', [])
        ],
        team_members=[
            TeamMemberResponse(
                admin_id=tm['admin_id'],
                admin_name=tm['admin_name'],
                role=tm.get('role'),
                added_at=tm['added_at'] if isinstance(tm['added_at'], str) else tm['added_at'].isoformat()
            ) for tm in project_doc.get('team_members', [])
        ],
        budget=BudgetResponse(
            total_amount=project_doc.get('budget', {}).get('total_amount', 0.0),
            currency=project_doc.get('budget', {}).get('currency', 'USD'),
            paid_amount=project_doc.get('budget', {}).get('paid_amount', 0.0),
            pending_amount=project_doc.get('budget', {}).get('pending_amount', 0.0),
            payment_terms=project_doc.get('budget', {}).get('payment_terms')
        ) if project_doc.get('budget') else None,
        tags=project_doc.get('tags', []),
        created_at=project_doc['created_at'] if isinstance(project_doc['created_at'], str) else project_doc['created_at'].isoformat(),
        updated_at=project_doc.get('updated_at'),
        last_activity_at=project_doc.get('last_activity_at')
    )

@router.get("/", response_model=List[ClientProjectResponse])
async def get_my_projects(client = Depends(get_current_client)):
    """Get all projects assigned to the current client"""
    projects = []
    async for project_doc in client_projects_collection.find({"client_id": client["id"]}):
        projects.append(convert_project_to_response(project_doc))
    return projects

@router.get("/{project_id}", response_model=ClientProjectResponse)
async def get_project(project_id: str, client = Depends(get_current_client)):
    """Get a specific project (only if assigned to current client)"""
    project_doc = await client_projects_collection.find_one({
        "id": project_id,
        "client_id": client["id"]
    })
    
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not assigned to you"
        )
    
    return convert_project_to_response(project_doc)

@router.post("/{project_id}/comments", response_model=CommentResponse)
async def add_comment(project_id: str, comment_data: CommentCreate, client = Depends(get_current_client)):
    """Add a comment to project (Client)"""
    project_doc = await client_projects_collection.find_one({
        "id": project_id,
        "client_id": client["id"]
    })
    
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not assigned to you"
        )
    
    comment = ProjectComment(
        user_id=client["id"],
        user_name=client.get("name", "Client"),
        user_type="client",
        message=comment_data.message
    )
    
    comment_dict = comment.model_dump()
    comment_dict['created_at'] = comment_dict['created_at'].isoformat()
    
    # Add activity log
    activity = ProjectActivity(
        action="comment_added",
        description=f"{client.get('name', 'Client')} added a comment",
        user_id=client["id"],
        user_name=client.get("name", "Client")
    )
    activity_dict = activity.model_dump()
    activity_dict['timestamp'] = activity_dict['timestamp'].isoformat()
    
    await client_projects_collection.update_one(
        {"id": project_id},
        {
            "$push": {
                "comments": comment_dict,
                "activity_log": activity_dict
            },
            "$set": {"last_activity_at": datetime.utcnow().isoformat()}
        }
    )
    
    return CommentResponse(**comment_dict)

@router.get("/{project_id}/files/{file_id}/download")
async def download_project_file(
    project_id: str,
    file_id: str,
    client = Depends(get_current_client)
):
    """Download a file from a project (only if project is assigned to current client)"""
    # Verify project belongs to client
    project_doc = await client_projects_collection.find_one({
        "id": project_id,
        "client_id": client["id"]
    })
    
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not assigned to you"
        )
    
    # Find file in project
    file_info = None
    for f in project_doc.get('files', []):
        if f['id'] == file_id:
            file_info = f
            break
    
    if not file_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    file_path = file_info['file_path']
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    return FileResponse(
        path=file_path,
        filename=file_info['filename'],
        media_type='application/octet-stream'
    )

# ============================================================================
# CHAT ENDPOINTS (Client)
# ============================================================================

@router.post("/{project_id}/chat", response_model=ChatMessageResponse)
async def send_chat_message(project_id: str, message_data: ChatMessageCreate, client = Depends(get_current_client)):
    """Send a chat message to admin (Client)"""
    project_doc = await client_projects_collection.find_one({
        "id": project_id,
        "client_id": client["id"]
    })
    
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not assigned to you"
        )
    
    chat_message = ChatMessage(
        sender_id=client["id"],
        sender_name=client.get("name", "Client"),
        sender_type="client",
        message=message_data.message,
        read=False
    )
    
    message_dict = chat_message.model_dump()
    message_dict['created_at'] = message_dict['created_at'].isoformat()
    
    # Add activity log
    activity = ProjectActivity(
        action="chat_message",
        description=f"{client.get('name', 'Client')} sent a chat message",
        user_id=client["id"],
        user_name=client.get("name", "Client")
    )
    activity_dict = activity.model_dump()
    activity_dict['timestamp'] = activity_dict['timestamp'].isoformat()
    
    await client_projects_collection.update_one(
        {"id": project_id},
        {
            "$push": {
                "chat_messages": message_dict,
                "activity_log": activity_dict
            },
            "$set": {"last_activity_at": datetime.utcnow().isoformat()}
        }
    )
    
    return ChatMessageResponse(**message_dict)

@router.get("/{project_id}/chat", response_model=List[ChatMessageResponse])
async def get_chat_messages(project_id: str, client = Depends(get_current_client)):
    """Get all chat messages for a project (Client)"""
    project_doc = await client_projects_collection.find_one({
        "id": project_id,
        "client_id": client["id"]
    })
    
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not assigned to you"
        )
    
    # Mark client messages as read
    chat_messages = project_doc.get('chat_messages', [])
    updated = False
    for msg in chat_messages:
        if msg['sender_type'] == 'admin' and not msg.get('read', False):
            msg['read'] = True
            updated = True
    
    if updated:
        await client_projects_collection.update_one(
            {"id": project_id},
            {"$set": {"chat_messages": chat_messages}}
        )
    
    return [
        ChatMessageResponse(
            id=cm['id'],
            sender_id=cm['sender_id'],
            sender_name=cm['sender_name'],
            sender_type=cm['sender_type'],
            message=cm['message'],
            read=cm.get('read', False),
            created_at=cm['created_at'] if isinstance(cm['created_at'], str) else cm['created_at'].isoformat()
        ) for cm in chat_messages
    ]


from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict
from datetime import date

# Project File Schema
class ProjectFileResponse(BaseModel):
    """Schema for project file response"""
    id: str
    filename: str
    file_path: str
    uploaded_at: str
    uploaded_by: str
    file_size: Optional[int] = 0
    file_type: Optional[str] = None

# Milestone Schemas
class MilestoneCreate(BaseModel):
    """Schema for creating milestone"""
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str = "pending"
    order: int = 0
    
    @field_validator('due_date', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None for date fields"""
        if v == '' or v is None:
            return None
        return v

class MilestoneUpdate(BaseModel):
    """Schema for updating milestone"""
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    order: Optional[int] = None
    
    @field_validator('due_date', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None for date fields"""
        if v == '' or v is None:
            return None
        return v

class MilestoneResponse(BaseModel):
    """Schema for milestone response"""
    id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    status: str
    completion_date: Optional[str] = None
    order: int
    created_at: str

# Task Schemas
class TaskCreate(BaseModel):
    """Schema for creating task"""
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    milestone_id: Optional[str] = None

class TaskUpdate(BaseModel):
    """Schema for updating task"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    milestone_id: Optional[str] = None

class TaskResponse(BaseModel):
    """Schema for task response"""
    id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    completed_at: Optional[str] = None
    milestone_id: Optional[str] = None
    created_at: str

# Comment Schemas
class CommentCreate(BaseModel):
    """Schema for creating comment"""
    message: str

class CommentResponse(BaseModel):
    """Schema for comment response"""
    id: str
    user_id: str
    user_name: str
    user_type: str
    message: str
    created_at: str

# Chat Message Schemas
class ChatMessageCreate(BaseModel):
    """Schema for creating chat message"""
    message: str

class ChatMessageResponse(BaseModel):
    """Schema for chat message response"""
    id: str
    sender_id: str
    sender_name: str
    sender_type: str  # admin or client
    message: str
    read: bool
    created_at: str

# Activity Log Schema
class ActivityResponse(BaseModel):
    """Schema for activity log response"""
    id: str
    action: str
    description: str
    user_id: str
    user_name: str
    timestamp: str
    metadata: Optional[Dict] = None

# Team Member Schemas
class TeamMemberAdd(BaseModel):
    """Schema for adding team member"""
    admin_id: str
    admin_name: str
    role: Optional[str] = None

class TeamMemberResponse(BaseModel):
    """Schema for team member response"""
    admin_id: str
    admin_name: str
    role: Optional[str] = None
    added_at: str

# Budget Schemas
class BudgetUpdate(BaseModel):
    """Schema for updating budget"""
    total_amount: Optional[float] = None
    currency: Optional[str] = None
    paid_amount: Optional[float] = None
    payment_terms: Optional[str] = None

class BudgetResponse(BaseModel):
    """Schema for budget response"""
    total_amount: float
    currency: str
    paid_amount: float
    pending_amount: float
    payment_terms: Optional[str] = None

# Client Project Schemas
class ClientProjectCreate(BaseModel):
    """Schema for creating a new client project"""
    name: str
    client_id: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    progress: int = 0
    start_date: Optional[date] = None
    expected_delivery: Optional[date] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = []
    
    @field_validator('start_date', 'expected_delivery', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None for date fields"""
        if v == '' or v is None:
            return None
        return v

class ClientProjectUpdate(BaseModel):
    """Schema for updating a client project"""
    name: Optional[str] = None
    client_id: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[int] = None
    start_date: Optional[date] = None
    expected_delivery: Optional[date] = None
    actual_delivery: Optional[date] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    
    @field_validator('start_date', 'expected_delivery', 'actual_delivery', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None for date fields"""
        if v == '' or v is None:
            return None
        return v

class ClientProjectResponse(BaseModel):
    """Schema for client project response"""
    id: str
    name: str
    client_id: str
    description: Optional[str] = None
    status: str
    priority: str
    progress: int
    start_date: Optional[str] = None
    expected_delivery: Optional[str] = None
    actual_delivery: Optional[str] = None
    notes: Optional[str] = None
    milestones: List[MilestoneResponse] = []
    tasks: List[TaskResponse] = []
    files: List[ProjectFileResponse] = []
    comments: List[CommentResponse] = []
    chat_messages: List['ChatMessageResponse'] = []  # New chat feature
    activity_log: List[ActivityResponse] = []
    team_members: List[TeamMemberResponse] = []
    budget: Optional[BudgetResponse] = None
    tags: List[str] = []
    created_at: str
    updated_at: Optional[str] = None
    last_activity_at: Optional[str] = None

class FileUploadResponse(BaseModel):
    """Schema for file upload response"""
    id: str
    filename: str
    message: str

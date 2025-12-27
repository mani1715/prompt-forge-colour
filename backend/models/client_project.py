from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, date
import uuid

class ProjectFile(BaseModel):
    """File attached to a project"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    uploaded_by: str  # Admin ID
    file_size: Optional[int] = 0  # Size in bytes
    file_type: Optional[str] = None  # MIME type

class ProjectMilestone(BaseModel):
    """Milestone for a project"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str = "pending"  # pending, in_progress, completed
    completion_date: Optional[datetime] = None
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectTask(BaseModel):
    """Task within a project"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed
    priority: str = "medium"  # low, medium, high, urgent
    assigned_to: Optional[str] = None  # Admin ID
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    milestone_id: Optional[str] = None  # Link to milestone
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectComment(BaseModel):
    """Comment on a project"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # Admin or Client ID
    user_name: str
    user_type: str  # admin or client
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectActivity(BaseModel):
    """Activity log entry"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: str  # created, updated, status_changed, file_uploaded, comment_added, etc.
    description: str
    user_id: str
    user_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict] = None

class TeamMember(BaseModel):
    """Team member assigned to project"""
    admin_id: str
    admin_name: str
    role: Optional[str] = None  # Project Manager, Developer, Designer, etc.
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Budget(BaseModel):
    """Budget information for project"""
    total_amount: float = 0.0
    currency: str = "USD"
    paid_amount: float = 0.0
    pending_amount: float = 0.0
    payment_terms: Optional[str] = None

class ClientProject(BaseModel):
    """Project assigned to a client"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    client_id: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, review, completed, on_hold
    priority: str = "medium"  # low, medium, high, urgent
    progress: int = 0  # 0-100
    start_date: Optional[date] = None
    expected_delivery: Optional[date] = None
    actual_delivery: Optional[datetime] = None
    notes: Optional[str] = None  # Admin notes visible to client
    
    # Enhanced features
    milestones: List[ProjectMilestone] = []
    tasks: List[ProjectTask] = []
    files: List[ProjectFile] = []
    comments: List[ProjectComment] = []
    activity_log: List[ProjectActivity] = []
    team_members: List[TeamMember] = []
    budget: Optional[Budget] = None
    tags: List[str] = []  # For categorization
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str  # Admin ID
    updated_at: Optional[datetime] = None
    last_activity_at: Optional[datetime] = None

from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Depends
from database import SessionLocal, TaskDB, UserDB, engine
from auth import hash_password, verify_password, create_access_token, verify_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

# Specifies where clients can obtain a token (enables Swagger UI "Authorize" functionality)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_db():
    """Dependency that creates a new database session for each request and closes it when done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize the FastAPI application
app = FastAPI()

# Configure CORS middleware to allow cross-origin requests from frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (e.g., http://localhost:5173 for Vite/React)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Health check endpoint to verify the server is running."""
    return {"message": "Hello, this is my first FastAPI app!"}


# Pydantic schema for validating incoming task payloads
class Task(BaseModel):
    title: str
    done: bool = False


# Pydantic schema for validating user registration payloads
class UserCreate(BaseModel):
    username: str
    password: str


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency that extracts, decodes, and validates the current user from the request's JWT token."""
    username = verify_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return username


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticates user credentials and returns a JWT access token."""
    db_user = db.query(UserDB).filter(UserDB.username == form_data.username).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Generate access token with user sub claim
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Retrieves a specific task by ID for the currently authenticated user."""
    user = db.query(UserDB).filter(UserDB.username == current_user).first()
    task = db.query(TaskDB).filter(TaskDB.id == task_id, TaskDB.owner_id == user.id).first()

    if task:
        return task
    raise HTTPException(status_code=404, detail="Task not found")


@app.get("/tasks/filter/")
def get_filter(done: bool = True, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Retrieves tasks filtered by completion status ('done') for the authenticated user."""
    user = db.query(UserDB).filter(UserDB.username == current_user).first()
    filtered_tasks = db.query(TaskDB).filter(TaskDB.done == done, TaskDB.owner_id == user.id).all()
    return filtered_tasks


@app.get("/tasks")
def get_all_tasks(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Retrieves all tasks owned by the currently authenticated user."""
    user = db.query(UserDB).filter(UserDB.username == current_user).first()
    return db.query(TaskDB).filter(TaskDB.owner_id == user.id).all()


@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user after verifying username uniqueness and hashing the password."""
    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    new_user = UserDB(username=user.username, hashed_password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "username": new_user.username}


@app.post("/tasks")
def create_task(task: Task, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Creates a new task associated with the currently authenticated user."""
    user = db.query(UserDB).filter(UserDB.username == current_user).first()
    new_task = TaskDB(title=task.title, done=task.done, owner_id=user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Deletes a specific task owned by the currently authenticated user."""
    user = db.query(UserDB).filter(UserDB.username == current_user).first()
    task = db.query(TaskDB).filter(TaskDB.id == task_id, TaskDB.owner_id == user.id).first()
    if task:
        db.delete(task)
        db.commit()
        return task
    raise HTTPException(status_code=404, detail="Task not found")


@app.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: Task, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Updates the title and completion status of an existing task owned by the user."""
    user = db.query(UserDB).filter(UserDB.username == current_user).first()
    task = db.query(TaskDB).filter(TaskDB.id == task_id, TaskDB.owner_id == user.id).first()
    if task:
        task.title = updated_task.title
        task.done = updated_task.done
        db.add(task)
        db.commit()
        return task
    raise HTTPException(status_code=404, detail="Task not found")


@app.delete("/users/me")
def delete_account(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Deletes the authenticated user's account along with all associated tasks."""
    user = db.query(UserDB).filter(UserDB.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete all tasks associated with this user
    db.query(TaskDB).filter(TaskDB.owner_id == user.id).delete()
    
    # Delete the user record
    db.delete(user)
    db.commit()
    return {"message": "Account deleted successfully"}
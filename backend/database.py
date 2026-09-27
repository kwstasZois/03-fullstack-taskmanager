from sqlalchemy import create_engine, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Boolean

# Base class that all our database models (tables) will inherit from
Base = declarative_base()

# SQLite database file, stored locally as tasks.db
DATABASE_URL = "sqlite:///./tasks.db"

# The connection to the database
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Factory for creating new database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class UserDB(Base):
    """Represents a row in the 'users' table."""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)  # no duplicate usernames allowed
    hashed_password = Column(String)  # never store the plain password, only the hash


class TaskDB(Base):
    """Represents a row in the 'tasks' table."""
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    done = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))  # links each task to the user who created it


# Creates the tables in the database if they don't already exist
Base.metadata.create_all(bind=engine)
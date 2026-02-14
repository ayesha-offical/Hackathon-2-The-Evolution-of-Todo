import sys
import os
from pathlib import Path

# Path setup
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from sqlmodel import SQLModel, create_engine
from src.models.user import User
from src.models.task import Task
from src.models.refresh_token import RefreshToken
from src.config import settings

def create_db_and_tables():
    # Pydantic settings check (Try both uppercase and lowercase)
    db_url = getattr(settings, "DATABASE_URL", None) or getattr(settings, "database_url", None)
    
    if not db_url:
        print("❌ Error: DATABASE_URL settings mein nahi mili!")
        print(f"Available settings: {settings.model_dump().keys()}")
        return
        
    engine = create_engine(db_url)
    print(f"Connecting to database...")
    try:
        SQLModel.metadata.create_all(engine)
        print("✅ Tables created successfully in the database!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_db_and_tables()
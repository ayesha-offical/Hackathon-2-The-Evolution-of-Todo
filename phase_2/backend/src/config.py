"""
Task: T008 | Spec: Constitution IV - Stateless Backend Architecture
Description: Environment configuration loader using Pydantic BaseSettings
Purpose: Load DATABASE_URL, JWT_SECRET, API_PORT, LOG_LEVEL from environment
Reference: plan.md Step 1, Constitution VI
"""

from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Constitution IV (Stateless Backend): All configuration comes from environment,
    never hardcoded. This enables horizontal scaling and deployment flexibility.
    """

    # =========================================================================
    # DATABASE CONFIGURATION
    # =========================================================================

    database_url: str
    """PostgreSQL connection string from DATABASE_URL environment variable"""

    # =========================================================================
    # AUTHENTICATION & JWT (Constitution II - JWT Bridge)
    # =========================================================================

    better_auth_secret: str
    """JWT signing secret shared with Better Auth frontend"""

    # =========================================================================
    # API CONFIGURATION
    # =========================================================================

    api_port: int = 8000
    """FastAPI server port"""

    api_host: str = "0.0.0.0"
    """FastAPI server host"""

    # =========================================================================
    # APPLICATION ENVIRONMENT
    # =========================================================================

    environment: Literal["development", "staging", "production"] = "development"
    """Environment type controls logging level and error detail exposure"""

    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    """Logging level for application and dependencies"""

    # =========================================================================
    # CORS CONFIGURATION
    # =========================================================================

    frontend_url: str = "https://focus-ibl84uy58-ayesha-officals-projects.vercel.app"
    """Frontend URL for CORS - allows requests from frontend origin only
    Note: 3000 is the standard Next.js dev server port"""

    # =========================================================================
    # CONSTANTS (Not from environment - hardcoded JWT expiration)
    # =========================================================================

    # JWT token expiration times (from spec.md)
    access_token_expire_seconds: int = 3600  # 1 hour
    refresh_token_expire_days: int = 30      # 30 days

    # JWT algorithm (Constitution II - JWT Bridge)
    jwt_algorithm: str = "HS256"

    class Config:
        """Pydantic configuration"""
        # Try .env and .env.local in backend dir; also parent .env when run from backend/
        env_file = (".env", ".env.local", "../.env")
        case_sensitive = False   # Allow both DATABASE_URL and database_url
        str_strip_whitespace = True
        extra = "ignore"  # Ignore extra environment variables not in model

    def get_database_url(self) -> str:
        """Return database URL (for SQLAlchemy engine creation)"""
        return self.database_url

    def get_jwt_secret(self) -> str:
        """Return JWT secret (for token verification)"""
        return self.better_auth_secret

    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment == "production"

    def is_development(self) -> bool:
        """Check if running in development"""
        return self.environment == "development"


# Global settings instance
# Load once at module import time
try:
    settings = Settings()
except Exception as e:
    raise RuntimeError(
        f"Failed to load settings from environment. "
        f"Ensure .env or .env.local exists (in backend/ or project root) with DATABASE_URL and BETTER_AUTH_SECRET. "
        f"Error: {e}"
    )


def get_settings() -> Settings:
    """
    Get global settings instance.

    Used for dependency injection in FastAPI routes and middleware.
    Returns the cached Settings instance loaded at module import.

    Returns:
        Settings: Global application settings
    """
    return settings

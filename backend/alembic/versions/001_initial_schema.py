# Task: T023 | Spec: specs/001-sdd-initialization/tasks.md §Alembic Migrations
# Constitution III: User Isolation - Initial database schema with user_id foreign keys

"""001: Initial schema with users, tasks, refresh_tokens tables.

Revision ID: 001
Revises:
Create Date: 2026-01-23

Schema:
- users table with email unique index
- tasks table with user_id foreign key and indexes (Constitution III)
- refresh_tokens table with user_id foreign key and indexes
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade() -> None:
    """Create initial database schema."""
    # Create users table (root entity for Constitution III)
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=60), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='uq_users_email'),
    )

    # Create index on email for unique lookups
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # Create tasks table with user_id foreign key (Constitution III - CRITICAL)
    op.create_table(
        'task',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='Pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes on tasks for Constitution III enforcement
    op.create_index('idx_tasks_user_id', 'task', ['user_id'])
    op.create_index('idx_tasks_user_created', 'task', ['user_id', 'created_at'], postgresql_ops={'created_at': 'DESC'})

    # Create refresh_tokens table with user_id foreign key
    op.create_table(
        'refreshtoken',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('token_hash', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes on refresh_tokens
    op.create_index('idx_refresh_tokens_user_id', 'refreshtoken', ['user_id'])
    op.create_index('idx_refresh_tokens_expires_at', 'refreshtoken', ['expires_at'])


def downgrade() -> None:
    """Rollback initial database schema."""
    # Drop refresh_tokens table
    op.drop_index('idx_refresh_tokens_expires_at', table_name='refreshtoken')
    op.drop_index('idx_refresh_tokens_user_id', table_name='refreshtoken')
    op.drop_table('refreshtoken')

    # Drop tasks table
    op.drop_index('idx_tasks_user_created', table_name='task')
    op.drop_index('idx_tasks_user_id', table_name='task')
    op.drop_table('task')

    # Drop users table
    op.drop_index('idx_users_email', table_name='users')
    op.drop_table('users')

# Task: T001 | Spec: @specs/003-modern-ui-improvements/spec.md §US2
# Feature: 003-modern-ui-improvements - Contact form messages storage
# Constitution III: User Isolation - contact_messages with optional user_id foreign key

"""002: Create contact_messages table for user contact form submissions.

Revision ID: 002
Revises: 001
Create Date: 2026-02-06

Schema:
- contact_messages table with optional user_id foreign key (nullable for unauthenticated submissions)
- Fields: id, user_id, name, email, subject, message, created_at, updated_at, ip_address, is_read, admin_notes
- Indexes on: user_id, created_at (DESC), email, is_read for optimal query performance
- Check constraints for field validation
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Alembic revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create contact_messages table for contact form submissions."""
    # Create contact_messages table with optional user_id for unauthenticated submissions
    op.create_table(
        'contact_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('subject', sa.String(length=500), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes for query performance (Constitution III optimization)
    # Index on user_id for user-specific message queries
    op.create_index('idx_contact_messages_user_id', 'contact_messages', ['user_id'])

    # Index on created_at DESC for sorting by newest messages
    op.create_index('idx_contact_messages_created_at', 'contact_messages', ['created_at'], postgresql_ops={'created_at': 'DESC'})

    # Index on email for duplicate detection and user lookups
    op.create_index('idx_contact_messages_email', 'contact_messages', ['email'])

    # Index on is_read for admin dashboard filtering
    op.create_index('idx_contact_messages_is_read', 'contact_messages', ['is_read'])

    # Add check constraints for field validation at database level
    op.create_check_constraint(
        'ck_contact_messages_name_not_empty',
        'contact_messages',
        "LENGTH(TRIM(name)) > 0"
    )

    op.create_check_constraint(
        'ck_contact_messages_email_not_empty',
        'contact_messages',
        "LENGTH(TRIM(email)) > 0"
    )

    op.create_check_constraint(
        'ck_contact_messages_subject_not_empty',
        'contact_messages',
        "LENGTH(TRIM(subject)) > 0"
    )

    op.create_check_constraint(
        'ck_contact_messages_message_not_empty',
        'contact_messages',
        "LENGTH(TRIM(message)) > 0"
    )


def downgrade() -> None:
    """Rollback contact_messages table."""
    # Drop check constraints
    op.drop_constraint('ck_contact_messages_message_not_empty', 'contact_messages', type_='check')
    op.drop_constraint('ck_contact_messages_subject_not_empty', 'contact_messages', type_='check')
    op.drop_constraint('ck_contact_messages_email_not_empty', 'contact_messages', type_='check')
    op.drop_constraint('ck_contact_messages_name_not_empty', 'contact_messages', type_='check')

    # Drop indexes
    op.drop_index('idx_contact_messages_is_read', table_name='contact_messages')
    op.drop_index('idx_contact_messages_email', table_name='contact_messages')
    op.drop_index('idx_contact_messages_created_at', table_name='contact_messages')
    op.drop_index('idx_contact_messages_user_id', table_name='contact_messages')

    # Drop table
    op.drop_table('contact_messages')

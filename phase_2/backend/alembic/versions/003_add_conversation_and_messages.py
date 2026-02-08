# Task: T304 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-004, FR-005
# Constitution III: User Isolation - conversations and messages tables with strict user_id enforcement
# Constitution IX: Conversation History & Persistence - Multi-turn conversation storage

"""003: Create conversations and messages tables for AI chatbot.

Revision ID: 003
Revises: 002
Create Date: 2026-02-08

Schema:
- conversations table with user_id foreign key (CRITICAL - Constitution III)
- messages table with conversation_id and user_id foreign keys (defense-in-depth)
- Indexes on: user_id (conversations), conversation_id + created_at (messages), user_id (messages)
- Constraints: role enum check, content not empty, immutable created_at
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Alembic revision identifiers
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create conversations and messages tables for AI chatbot."""

    # ========================================================================
    # Create conversations table (Constitution IX: Conversation Persistence)
    # ========================================================================
    op.create_table(
        'conversations',
        # Primary Key
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text('gen_random_uuid()'),
            comment='Conversation ID (UUID, generated)',
        ),
        # Foreign Key (Constitution III - CRITICAL user isolation)
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            nullable=False,
            comment='User ID (FK to users.id) - CRITICAL for Constitution III',
        ),
        # Timestamps
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            comment='Conversation creation timestamp (UTC)',
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            comment='Last update timestamp (UTC)',
        ),
        # Constraints
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            ondelete='CASCADE',
            name='fk_conversations_user_id',
        ),
        sa.PrimaryKeyConstraint('id', name='pk_conversations'),
    )

    # Create indexes for query performance (Constitution III optimization)
    # Index on user_id for user-specific conversation retrieval
    op.create_index(
        'idx_conversations_user_id',
        'conversations',
        ['user_id'],
        comment='User conversations lookup',
    )

    # Composite index: user_id + created_at DESC for efficient pagination
    op.create_index(
        'idx_conversations_user_created',
        'conversations',
        ['user_id', 'created_at'],
        postgresql_ops={'created_at': 'DESC'},
        comment='User conversations ordered by creation time',
    )

    # ========================================================================
    # Create messages table (Constitution IX: Conversation History)
    # ========================================================================
    op.create_table(
        'messages',
        # Primary Key
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text('gen_random_uuid()'),
            comment='Message ID (UUID, generated)',
        ),
        # Foreign Keys (Constitution III - defense-in-depth user isolation)
        sa.Column(
            'conversation_id',
            postgresql.UUID(as_uuid=True),
            nullable=False,
            comment='Conversation ID (FK to conversations.id)',
        ),
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            nullable=False,
            comment='User ID (FK to users.id) - defense-in-depth Constitution III',
        ),
        # Message Content
        sa.Column(
            'role',
            sa.String(20),
            nullable=False,
            comment="Message role: 'user' or 'assistant'",
        ),
        sa.Column(
            'content',
            sa.Text(),
            nullable=False,
            comment='Message content (1-10000 chars)',
        ),
        # Timestamps (immutable after creation)
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            comment='Message creation timestamp (UTC, immutable)',
        ),
        # Constraints
        sa.ForeignKeyConstraint(
            ['conversation_id'],
            ['conversations.id'],
            ondelete='CASCADE',
            name='fk_messages_conversation_id',
        ),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            ondelete='CASCADE',
            name='fk_messages_user_id',
        ),
        sa.PrimaryKeyConstraint('id', name='pk_messages'),
    )

    # Create indexes for query performance (Constitution III optimization)
    # Index on conversation_id + created_at ASC for efficient history retrieval in order
    op.create_index(
        'idx_messages_conversation_created',
        'messages',
        ['conversation_id', 'created_at'],
        postgresql_ops={'created_at': 'ASC'},
        comment='Messages for conversation in chronological order',
    )

    # Index on user_id + created_at DESC for efficient user message queries
    op.create_index(
        'idx_messages_user_created',
        'messages',
        ['user_id', 'created_at'],
        postgresql_ops={'created_at': 'DESC'},
        comment='User messages reverse chronological order',
    )

    # Add check constraints for field validation at database level
    # Validate role values
    op.create_check_constraint(
        'ck_messages_role',
        'messages',
        "role IN ('user', 'assistant')",
    )

    # Validate content is not empty
    op.create_check_constraint(
        'ck_messages_content_not_empty',
        'messages',
        "LENGTH(TRIM(content)) > 0",
    )


def downgrade() -> None:
    """Rollback conversations and messages tables."""

    # Drop check constraints
    op.drop_constraint('ck_messages_content_not_empty', 'messages', type_='check')
    op.drop_constraint('ck_messages_role', 'messages', type_='check')

    # Drop indexes
    op.drop_index('idx_messages_user_created', table_name='messages')
    op.drop_index('idx_messages_conversation_created', table_name='messages')
    op.drop_index('idx_conversations_user_created', table_name='conversations')
    op.drop_index('idx_conversations_user_id', table_name='conversations')

    # Drop tables (messages first due to FK dependency)
    op.drop_table('messages')
    op.drop_table('conversations')

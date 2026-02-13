# Data Model: Modern UI Improvements

**Feature**: 003-modern-ui-improvements
**Version**: 1.0.0
**Created**: 2026-02-06

---

## Entities

### ContactMessage

Represents a user-submitted contact/inquiry message from the contact form.

**Table Name**: `contact_messages`

**Attributes**:

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key; unique identifier for each message |
| user_id | UUID | YES | NULL | Foreign key to `users.id`; NULL for unauthenticated submissions |
| name | VARCHAR(255) | NO | - | Sender's name (provided by user) |
| email | VARCHAR(255) | NO | - | Sender's email address (must be valid email format) |
| subject | VARCHAR(500) | NO | - | Message subject/topic |
| message | TEXT | NO | - | Full message content |
| created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | Timestamp when message was created |
| updated_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | Timestamp of last update (for auditing) |
| ip_address | VARCHAR(45) | YES | NULL | IP address of sender (optional, for spam tracking) |
| is_read | BOOLEAN | NO | FALSE | Whether admin has read this message |
| admin_notes | TEXT | YES | NULL | Internal notes from admin (not visible to user) |

**Constraints**:

```sql
PRIMARY KEY (id)
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
UNIQUE INDEX (id)
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')  -- Email validation
CHECK (LENGTH(name) > 0)  -- Non-empty name
CHECK (LENGTH(email) > 0)  -- Non-empty email
CHECK (LENGTH(subject) > 0)  -- Non-empty subject
CHECK (LENGTH(message) > 0)  -- Non-empty message
```

**Indexes**:

```sql
CREATE INDEX idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_is_read ON contact_messages(is_read);
```

**Relationships**:

- **ContactMessage → User**: Many-to-One (optional)
  - A contact message may belong to an authenticated user
  - A user may have submitted zero or more contact messages
  - Foreign key `user_id` is nullable to allow unauthenticated submissions

---

## State Transitions

### ContactMessage Lifecycle

```
[SUBMITTED] → [ADMIN_REVIEW] → [RESOLVED]
   ↓
   └─→ [SPAM/ARCHIVED] (optional)
```

**States**:

1. **SUBMITTED** (Default)
   - Message is created via contact form
   - is_read = FALSE
   - admin_notes = NULL

2. **ADMIN_REVIEW** (Manual)
   - Admin has viewed the message
   - is_read = TRUE
   - admin_notes may be populated

3. **RESOLVED** (Manual)
   - Admin has taken action (responded, fixed issue, etc.)
   - Message marked as handled

4. **SPAM/ARCHIVED** (Manual)
   - Message marked as spam or no longer relevant
   - Can be soft-deleted or archived

**Note**: Current implementation focuses on submission and storage. State transitions are future functionality.

---

## Validation Rules

### Field Validation (Database Level)

**name**:
- NOT NULL
- Length: 1-255 characters
- Type: String (VARCHAR)
- No special requirements

**email**:
- NOT NULL
- Length: 5-255 characters
- Format: Valid email address (RFC 5322 compliant)
- Type: String (VARCHAR)
- Validation: CHECK constraint with regex

**subject**:
- NOT NULL
- Length: 1-500 characters
- Type: String (VARCHAR)
- No special requirements

**message**:
- NOT NULL
- Minimum length: 1 character
- Type: Text
- No maximum enforced (supports long messages)

**user_id**:
- NULL allowed (for unauthenticated users)
- Must reference existing user if provided
- Type: UUID (Foreign key)

**ip_address**:
- NULL allowed
- Length: 1-45 characters (supports IPv4 and IPv6)
- Type: String (VARCHAR)
- Optional tracking for spam prevention

---

## API Contract Mapping

### Request Schema → Database

**Request** (from frontend):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about FocusHub",
  "message": "I would like to know more about..."
}
```

**Stored in Database**:
```
INSERT INTO contact_messages (
  id, user_id, name, email, subject, message,
  created_at, updated_at, ip_address, is_read, admin_notes
) VALUES (
  gen_random_uuid(),
  [user_id from JWT or NULL],
  'John Doe',
  'john@example.com',
  'Question about FocusHub',
  'I would like to know more about...',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  [IP from request],
  FALSE,
  NULL
)
```

### Response Schema ← Database

**Response** (to frontend, 201 Created):
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "user_id": "9f47ac10-58cc-4372-a567-0e02b2c3d479",
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about FocusHub",
  "message": "I would like to know more about...",
  "created_at": "2026-02-06T10:30:00Z"
}
```

---

## Schema Evolution & Migration Strategy

### Initial Migration (v001)

**Filename**: `backend/migrations/001_create_contact_messages.py`

```python
"""Create contact_messages table for storing user inquiries."""

# Migration will:
# 1. Create contact_messages table with all fields
# 2. Create indexes for performance
# 3. Add foreign key constraint to users table
# 4. Add check constraints for validation
```

### Future Migrations (if needed)

- **v002**: Add `reply_message_id` for message threads
- **v003**: Add `category` field for message classification
- **v004**: Add `status` enum field for state management

---

## Considerations

### Performance

- **Indexes**: Created on frequently queried columns (user_id, created_at, email)
- **Query Patterns**:
  - "Get all messages for a user" → uses user_id index
  - "Get recent messages" → uses created_at DESC index
  - "Check for duplicate emails" → uses email index

### Security

- **User Isolation**: user_id field ties messages to authenticated users
- **Null Handling**: NULL user_id allows unauthenticated submissions while maintaining data integrity
- **Data Sensitivity**: Email and message content should not be logged or exposed unnecessarily

### Scalability

- **Partitioning**: Future optimization could partition by created_at for very large datasets
- **Archival**: Old messages can be archived to separate table for performance

### Maintenance

- **Soft Deletes**: Consider adding `deleted_at` field for non-destructive archival
- **TTL**: Consider adding automatic deletion policy for messages older than N days (GDPR compliance)


# API Contract: Contact Messages

**Feature**: 003-modern-ui-improvements
**Version**: 1.0.0
**Base URL**: `/api/v1`
**Authentication**: Optional (JWT Bearer token)

---

## Endpoints

### POST /messages/contact

**Purpose**: Submit a contact form message

**Authentication**: Optional (unauthenticated users can submit)

**Request**:

```http
POST /api/v1/messages/contact HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN> [Optional]

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about FocusHub",
  "message": "I would like to know more about your service..."
}
```

**Request Body Schema**:

| Field | Type | Required | Validation | Example |
|-------|------|----------|-----------|---------|
| name | string | YES | Min 1, Max 255 chars | "John Doe" |
| email | string | YES | Valid email format | "john@example.com" |
| subject | string | YES | Min 1, Max 500 chars | "Question about FocusHub" |
| message | string | YES | Min 1 char (no max) | "I would like to know..." |

**Responses**:

#### 201 Created (Success)

Successful submission - message stored in database.

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "user_id": "9f47ac10-58cc-4372-a567-0e02b2c3d479",
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about FocusHub",
  "message": "I would like to know more about your service...",
  "created_at": "2026-02-06T10:30:00Z"
}
```

**Response Body Schema**:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier for the message |
| user_id | UUID or null | User ID if authenticated, null if unauthenticated |
| name | string | Sender's name |
| email | string | Sender's email address |
| subject | string | Message subject |
| message | string | Full message content |
| created_at | ISO 8601 | Timestamp when message was created |

#### 400 Bad Request (Validation Error)

Invalid input - missing required fields or validation failure.

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "detail": "Validation error: email must be a valid email address"
}
```

**Common Error Messages**:

- "Validation error: name is required"
- "Validation error: email must be a valid email address"
- "Validation error: subject is required"
- "Validation error: message is required"
- "Validation error: name must be between 1 and 255 characters"
- "Validation error: subject must be between 1 and 500 characters"

#### 422 Unprocessable Entity (Schema Error)

Request body doesn't match expected schema (e.g., missing required field, wrong type).

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "name"],
      "msg": "Field required"
    }
  ]
}
```

#### 500 Internal Server Error (Server Error)

Unexpected server-side error (database error, etc.).

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "detail": "Internal server error"
}
```

---

## Frontend Integration

### Request Example (JavaScript/Fetch)

```javascript
async function submitContactForm(formData) {
  try {
    const response = await fetch('/api/v1/messages/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include JWT if authenticated (automatically added by auth interceptor)
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      })
    });

    if (response.status === 201) {
      const data = await response.json();
      return { success: true, messageId: data.id };
    } else if (response.status === 400) {
      const error = await response.json();
      return { success: false, error: error.detail };
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return { success: false, error: 'Network error' };
  }
}
```

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(500),
  message: z.string().min(1, 'Message is required')
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    const response = await fetch('/api/v1/messages/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.status === 201) {
      // Show success message
      alert('Thank you! Your message has been sent.');
    } else {
      const error = await response.json();
      alert(`Error: ${error.detail}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <p>{errors.name.message}</p>}

      <input {...register('email')} placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register('subject')} placeholder="Subject" />
      {errors.subject && <p>{errors.subject.message}</p>}

      <textarea {...register('message')} placeholder="Message" />
      {errors.message && <p>{errors.message.message}</p>}

      <button type="submit">Send Message</button>
    </form>
  );
}
```

---

## Backend Implementation

### FastAPI Pydantic Schemas

```python
# schemas/contact.py

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from uuid import UUID

class ContactFormRequest(BaseModel):
    """Request schema for contact form submission"""
    name: str = Field(..., min_length=1, max_length=255, description="Sender's name")
    email: EmailStr = Field(..., description="Sender's email address")
    subject: str = Field(..., min_length=1, max_length=500, description="Message subject")
    message: str = Field(..., min_length=1, description="Message content")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Question about FocusHub",
                "message": "I would like to know more about..."
            }
        }

class ContactFormResponse(BaseModel):
    """Response schema for contact form submission"""
    id: UUID
    user_id: Optional[UUID] = None
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### FastAPI Route Handler

```python
# api/v1/messages.py

from fastapi import APIRouter, HTTPException, status, Request
from typing import Optional
from uuid import UUID
from schemas.contact import ContactFormRequest, ContactFormResponse
from services.contact_service import ContactService
from middleware.jwt_verification import get_user_id_from_request

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/contact", status_code=status.HTTP_201_CREATED, response_model=ContactFormResponse)
async def submit_contact_form(
    form_data: ContactFormRequest,
    request: Request,
    contact_service: ContactService = Depends()
):
    """
    Submit a contact form message.

    - **name**: Sender's name (1-255 characters)
    - **email**: Valid email address
    - **subject**: Message subject (1-500 characters)
    - **message**: Message content

    Authentication: Optional (unauthenticated users can submit)
    """
    try:
        # Extract user_id from JWT if authenticated
        user_id: Optional[UUID] = get_user_id_from_request(request)

        # Get client IP for spam tracking
        ip_address = request.client.host if request.client else None

        # Create message in database
        message = await contact_service.create_contact_message(
            user_id=user_id,
            name=form_data.name,
            email=form_data.email,
            subject=form_data.subject,
            message=form_data.message,
            ip_address=ip_address
        )

        return ContactFormResponse.from_orm(message)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        # Log the error
        logger.error(f"Contact form submission failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
```

---

## Testing Requirements

### Unit Tests

- Validate email format validation
- Validate required field validation
- Validate field length constraints
- Test with authenticated user (user_id set)
- Test with unauthenticated user (user_id null)

### Integration Tests

- Full request/response cycle
- Database persistence
- Response status codes (201, 400, 422, 500)
- Error message format

### Example Test Cases

```python
# tests/integration/test_contact_api.py

import pytest
from fastapi.testclient import TestClient

@pytest.mark.asyncio
async def test_contact_form_submission_success(client: TestClient):
    """Test successful contact form submission"""
    response = client.post("/api/v1/messages/contact", json={
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Question",
        "message": "Hello"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["email"] == "john@example.com"

@pytest.mark.asyncio
async def test_contact_form_invalid_email(client: TestClient):
    """Test contact form with invalid email"""
    response = client.post("/api/v1/messages/contact", json={
        "name": "John Doe",
        "email": "invalid-email",
        "subject": "Question",
        "message": "Hello"
    })
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_contact_form_missing_field(client: TestClient):
    """Test contact form with missing required field"""
    response = client.post("/api/v1/messages/contact", json={
        "name": "John Doe",
        "email": "john@example.com"
        # Missing subject and message
    })
    assert response.status_code == 422
```

---

## Rate Limiting & Security

### Considerations for Implementation

- **Rate Limiting**: Consider implementing rate limiting per IP to prevent spam
- **CAPTCHA**: May require CAPTCHA for unauthenticated submissions
- **Email Verification**: Consider verifying email before storing (optional)
- **Spam Detection**: Monitor suspicious patterns (e.g., many messages from same IP)

### Current Phase 1 Implementation

- No rate limiting (can be added in future phase)
- No CAPTCHA (can be added if spam becomes issue)
- Server-side email validation via Pydantic EmailStr
- IP address stored for future spam analysis


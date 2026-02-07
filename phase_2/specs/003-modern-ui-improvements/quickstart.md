# Quickstart: Modern UI Improvements Integration

**Feature**: 003-modern-ui-improvements
**Version**: 1.0.0
**Last Updated**: 2026-02-06

---

## Overview

This quickstart guide helps developers integrate the Modern UI Improvements feature into the FocusHub application. The feature includes:

1. **Enhanced Header** - Modern, responsive navigation with auth-aware menu
2. **Contact Page** - Public contact form for user inquiries
3. **Session Preservation** - Users stay authenticated while navigating between pages

---

## Prerequisites

- Next.js 15+ with App Router
- FastAPI backend with JWT middleware
- Better Auth configured for authentication
- Tailwind CSS for styling
- React 18+ with React Hook Form

---

## Frontend Integration

### 1. Header Component Setup

**Step 1.1**: Create the Header component

```bash
# Create the Header component file
touch frontend/src/components/common/Header.tsx
```

**Step 1.2**: Implement Header with these features:

- Display FocusHub logo and brand name
- Navigation links: Home, About, Contact
- Responsive design with hamburger menu on mobile (< 768px)
- Conditional rendering based on auth state:
  - **Unauthenticated**: Show Login/Register buttons
  - **Authenticated**: Show user dropdown with logout option
- Navigation to dashboard when logged in

**Step 1.3**: Import and use AuthContext

```typescript
// In Header.tsx
import { useAuthContext } from '@/contexts/AuthContext';

export function Header() {
  const { user, isAuthenticated } = useAuthContext();

  return (
    <header className="bg-white shadow">
      {/* Render navigation based on isAuthenticated */}
    </header>
  );
}
```

**Step 1.4**: Add Header to root layout

```typescript
// frontend/src/app/layout.tsx
import { Header } from '@/components/common/Header';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
```

### 2. Contact Form Component

**Step 2.1**: Create ContactForm component

```bash
mkdir -p frontend/src/components/sections
touch frontend/src/components/sections/ContactForm.tsx
```

**Step 2.2**: Implement with React Hook Form + zod validation:

```typescript
// frontend/src/components/sections/ContactForm.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required').max(500),
  message: z.string().min(1, 'Message is required')
});

export function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data) => {
    const response = await fetch('/api/v1/messages/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // Handle response...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 3. Contact Page

**Step 3.1**: Create contact page route

```bash
mkdir -p frontend/src/app/contact
touch frontend/src/app/contact/page.tsx
```

**Step 3.2**: Implement page with contact info and form:

```typescript
// frontend/src/app/contact/page.tsx
import { ContactForm } from '@/components/sections/ContactForm';

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12">
      <h1>Contact Us</h1>
      <p>Get in touch with the FocusHub team</p>
      <ContactForm />
      {/* Contact information section */}
    </div>
  );
}
```

### 4. Authentication Integration

**Step 4.1**: Ensure AuthContext is properly configured:

```typescript
// frontend/src/contexts/AuthContext.tsx
// Verify it provides: user, isAuthenticated, logout, login
```

**Step 4.2**: Update API client to include JWT token:

```typescript
// frontend/src/lib/api.ts
const apiCall = async (url: string, options = {}) => {
  const token = await getAuthToken(); // From Better Auth

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};
```

### 5. Navigation Links

**Step 5.1**: Update navigation to include Contact link:

```typescript
// In Header component
<nav>
  <Link href="/">Home</Link>
  <Link href="/about">About</Link>
  <Link href="/contact">Contact</Link>
  {isAuthenticated && <Link href="/dashboard">Dashboard</Link>}
</nav>
```

**Step 5.2**: Ensure Home link navigates correctly:

```typescript
// Logo should navigate to home or dashboard depending on auth state
<Link href={isAuthenticated ? '/dashboard' : '/'}>
  <Logo />
</Link>
```

---

## Backend Integration

### 1. Database Setup

**Step 1.1**: Create migration for contact_messages table

```bash
# Create migration file
touch backend/migrations/001_create_contact_messages.py
```

**Step 1.2**: Migration SQL:

```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  is_read BOOLEAN DEFAULT FALSE,
  admin_notes TEXT
);

CREATE INDEX idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
```

**Step 1.3**: Run migration:

```bash
cd backend
# Using Alembic or direct database migration tool
python -m alembic upgrade head
```

### 2. SQLModel Entity

**Step 2.1**: Create ContactMessage model:

```bash
touch backend/src/models/contact_message.py
```

**Step 2.2**: Define entity:

```python
# backend/src/models/contact_message.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

class ContactMessage(SQLModel, table=True):
    __tablename__ = "contact_messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    name: str = Field(..., max_length=255)
    email: str = Field(..., max_length=255)
    subject: str = Field(..., max_length=500)
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    is_read: bool = Field(default=False)
    admin_notes: Optional[str] = None
```

### 3. API Schemas (Pydantic)

**Step 3.1**: Create contact schemas:

```bash
touch backend/src/schemas/contact.py
```

**Step 3.2**: Define request/response models:

```python
# backend/src/schemas/contact.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from uuid import UUID

class ContactFormRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=500)
    message: str = Field(..., min_length=1)

class ContactFormResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### 4. Service Layer

**Step 4.1**: Create contact service:

```bash
touch backend/src/services/contact_service.py
```

**Step 4.2**: Implement business logic:

```python
# backend/src/services/contact_service.py
from sqlmodel import Session, select
from typing import Optional
from uuid import UUID
from models.contact_message import ContactMessage
from schemas.contact import ContactFormRequest

class ContactService:
    def __init__(self, session: Session):
        self.session = session

    async def create_contact_message(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None
    ) -> ContactMessage:
        """Create and store a contact message"""
        contact_msg = ContactMessage(
            name=name,
            email=email,
            subject=subject,
            message=message,
            user_id=user_id,
            ip_address=ip_address
        )
        self.session.add(contact_msg)
        self.session.commit()
        self.session.refresh(contact_msg)
        return contact_msg
```

### 5. API Route Handler

**Step 5.1**: Create messages API route:

```bash
touch backend/src/api/v1/messages.py
```

**Step 5.2**: Implement endpoint:

```python
# backend/src/api/v1/messages.py
from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import Optional
from uuid import UUID
from sqlmodel import Session
from schemas.contact import ContactFormRequest, ContactFormResponse
from services.contact_service import ContactService
from db import get_session
from middleware.jwt_verification import extract_user_id

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/contact", status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    form_data: ContactFormRequest,
    request: Request,
    session: Session = Depends(get_session)
):
    """Submit contact form message"""
    try:
        # Extract user_id if authenticated
        user_id: Optional[UUID] = extract_user_id(request)

        # Get client IP
        ip_address = request.client.host if request.client else None

        # Create service and save message
        service = ContactService(session)
        message = await service.create_contact_message(
            name=form_data.name,
            email=form_data.email,
            subject=form_data.subject,
            message=form_data.message,
            user_id=user_id,
            ip_address=ip_address
        )

        return ContactFormResponse.from_orm(message)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}"
        )
```

**Step 5.3**: Register route in main app:

```python
# backend/src/main.py
from api.v1 import messages

app = FastAPI()

# Register routers
app.include_router(messages.router, prefix="/api/v1")
```

### 6. CORS & Authentication

**Step 6.1**: Verify CORS configuration allows contact form requests:

```python
# backend/src/middleware/cors.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie", "Authorization"]
)
```

**Step 6.2**: Verify JWT middleware is configured:

```python
# backend/src/middleware/jwt_verification.py
# Ensure middleware extracts user_id but allows unauthenticated requests
# Contact form endpoint should accept both authenticated and unauthenticated users
```

---

## Testing Checklist

### Frontend Tests

- [ ] Header displays on all pages
- [ ] Header is responsive on mobile (< 768px)
- [ ] Navigation links work (Home, About, Contact)
- [ ] Login/Register buttons visible when unauthenticated
- [ ] User dropdown and logout visible when authenticated
- [ ] Contact page loads and displays form
- [ ] Form validation works (required fields, email format)
- [ ] Form submission succeeds (201 response)
- [ ] Success message displays after submission
- [ ] Users stay logged in when navigating between pages

### Backend Tests

- [ ] POST /api/v1/messages/contact accepts valid data (201)
- [ ] Returns 400 on missing required fields
- [ ] Returns 422 on invalid email format
- [ ] Contact message stored in database
- [ ] user_id is set if authenticated, null if not
- [ ] ip_address is captured
- [ ] All fields returned in response

### Integration Tests

- [ ] Unauthenticated user can submit contact form
- [ ] Authenticated user can submit contact form
- [ ] User remains logged in after form submission
- [ ] Contact link in header works
- [ ] Form submission response shows success

---

## Environment Configuration

### Frontend (.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000/auth
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost/focushub
BETTER_AUTH_SECRET=your-secret-key
API_HOST=0.0.0.0
API_PORT=8000
```

---

## Troubleshooting

### Issue: Contact form returns 401 Unauthorized

**Solution**: Verify JWT middleware is not requiring authentication for `/api/v1/messages/contact`. Contact form should accept unauthenticated requests.

### Issue: User logs out when navigating to contact page

**Solution**: Verify JWT token is being sent with all requests via Authorization header. Check API client configuration in `frontend/src/lib/api.ts`.

### Issue: Header doesn't update after login

**Solution**: Verify AuthContext is properly updating `isAuthenticated` state. Check that Header component re-renders when auth state changes.

### Issue: Contact form submission fails with CORS error

**Solution**: Verify CORS middleware includes `/api/v1/messages/contact` in allowed routes and includes necessary headers (Content-Type, Authorization).

---

## Next Steps

1. **Phase 2 Testing**: Run full integration tests on frontend and backend
2. **Phase 3 Optimization**: Optimize form submission performance
3. **Future Enhancements**: Add email notifications, admin dashboard, rate limiting

---

## Documentation References

- [API Contract: Contact Messages](./contracts/contact-api.md)
- [Data Model: Contact Messages](./data-model.md)
- [Implementation Plan](./plan.md)
- [Feature Specification](./spec.md)


# Chat API Documentation

**Version**: 1.0.0
**Last Updated**: 2026-02-08
**Status**: Production Ready
**Base URL**: `http://localhost:8000/api/v1` (development) | `https://api.focushub.com/api/v1` (production)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Request/Response Schemas](#requestresponse-schemas)
5. [Error Handling](#error-handling)
6. [Examples](#examples)
7. [Rate Limiting](#rate-limiting)
8. [Architecture](#architecture)

---

## Overview

The Chat API enables authenticated users to interact with an AI-powered task assistant. The API supports:

- **Multi-turn conversations**: Maintain conversation history across requests
- **Natural language task operations**: Create, list, update, delete tasks via chat
- **Stateless agent design**: Full context provided on each request
- **User isolation**: Strict enforcement of user_id filtering (Constitution III)
- **JWT authentication**: Secure Bearer token-based access (Constitution II)

**Architecture**:
- Frontend (Next.js 14) → Backend (FastAPI) → OpenAI Agent → MCP Tools → Database (PostgreSQL)

---

## Authentication

### JWT Bearer Token

All endpoints require authentication via JWT Bearer token in the `Authorization` header.

**Token Format**:
```
Authorization: Bearer <jwt_token>
```

**Token Claims** (from Better Auth):
```json
{
  "sub": "user-id-uuid",           // User ID (authoritative identity)
  "email": "user@example.com",     // Email address
  "iat": 1704067200,              // Issued at (Unix timestamp)
  "exp": 1704153600               // Expiration (24 hours)
}
```

**Token Verification**:
- Tokens are verified using `HS256` algorithm
- Secret key: `BETTER_AUTH_SECRET` environment variable
- Expired tokens return `401 Unauthorized`
- Missing/invalid tokens return `401 Unauthorized`

**Constitution II Compliance**:
- User ID is extracted from JWT `sub` claim
- All operations are scoped to authenticated user_id
- Cannot access another user's conversations

---

## Endpoints

### POST /api/v1/chat

Send a message to the AI chatbot and receive a response.

**Endpoint**: `POST /chat`

**Method**: POST

**Authentication**: Required (Bearer token)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body** (JSON):
```json
{
  "message": "create a task called Test Task",
  "conversation_id": "f1b93780-279e-4ae7-b7c4-fb7397884b97"  // Optional
}
```

**Response** (HTTP 200):
```json
{
  "response": "I've created a task called 'Test Task' for you.",
  "conversation_id": "f1b93780-279e-4ae7-b7c4-fb7397884b97",
  "messages": [
    {
      "id": "226ba540-40fd-4325-acf4-737b38a96256",
      "role": "user",
      "content": "create a task called Test Task",
      "created_at": "2026-02-08T16:08:41.535011"
    },
    {
      "id": "9dcc9abe-9da4-440d-aa57-16134f1abb44",
      "role": "assistant",
      "content": "I've created a task called 'Test Task' for you.",
      "created_at": "2026-02-08T16:08:42.034667"
    }
  ]
}
```

**Behavior**:

1. **If `conversation_id` is provided**:
   - Load existing conversation (verify it belongs to user)
   - Append message to conversation history
   - Return full updated conversation

2. **If `conversation_id` is NOT provided**:
   - Create new conversation for authenticated user
   - Save user message
   - Return conversation with 2 messages (user + assistant)

**Status Codes**:

| Code | Description | Example |
|------|-------------|---------|
| 200 | Chat message processed successfully | Response returned with messages |
| 400 | Invalid message (empty, > 2000 chars) | `{"error": 400, "message": "Message must be 1-2000 characters"}` |
| 401 | Unauthorized (invalid/missing JWT) | `{"detail": "Invalid or expired token"}` |
| 404 | Conversation not found / doesn't belong to user | `{"error": 404, "message": "Conversation not found or doesn't belong to you"}` |
| 500 | Server error (OpenAI API failure, DB error) | `{"error": 500, "message": "Error processing chat request. Please try again."}` |

---

## Request/Response Schemas

### ChatRequestBody

```typescript
interface ChatRequestBody {
  message: string;              // User message (1-2000 chars, required)
  conversation_id?: string;     // Existing conversation ID (optional, UUID format)
}
```

**Validation**:
- `message` must be non-empty
- `message` max length: 2000 characters
- `conversation_id` must be valid UUID format (if provided)

### ChatResponseBody

```typescript
interface ChatResponseBody {
  response: string;             // AI response text
  conversation_id: string;      // Conversation ID (UUID)
  messages: MessageResponse[];  // Full conversation history (ordered by created_at ASC)
}

interface MessageResponse {
  id: string;                   // Message ID (UUID)
  role: "user" | "assistant";   // Message sender
  content: string;              // Message content
  created_at: string;           // ISO 8601 timestamp
}
```

### Error Response

```typescript
interface ErrorResponse {
  error: number;                // HTTP status code
  message: string;              // Error description
  path?: string;                // Request path
  detail?: string;              // Additional error details (for 401 errors)
}
```

---

## Error Handling

### Error Codes

| Code | Cause | Solution |
|------|-------|----------|
| 400 | Message validation failed | Check message length (1-2000 chars) |
| 401 | JWT token invalid/expired | Re-authenticate and get new token |
| 404 | Conversation not found | Create new conversation (omit conversation_id) |
| 500 | OpenAI API error / DB error | Check logs, retry with exponential backoff |

### Example Error Responses

**400 - Empty Message**:
```json
{
  "error": 400,
  "message": "Message must be 1-2000 characters"
}
```

**401 - Expired Token**:
```json
{
  "detail": "Invalid or expired token"
}
```

**404 - Conversation Not Found**:
```json
{
  "error": 404,
  "message": "Conversation not found or doesn't belong to you"
}
```

**500 - OpenAI API Error**:
```json
{
  "error": 500,
  "message": "Error processing chat request. Please try again.",
  "path": "http://localhost:8000/api/v1/chat"
}
```

---

## Examples

### Example 1: Start New Conversation

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "hello"
  }'
```

**Response** (HTTP 200):
```json
{
  "response": "Hello! How can I assist you today with your todo list?",
  "conversation_id": "f1b93780-279e-4ae7-b7c4-fb7397884b97",
  "messages": [
    {
      "id": "226ba540-40fd-4325-acf4-737b38a96256",
      "role": "user",
      "content": "hello",
      "created_at": "2026-02-08T16:08:41.535011"
    },
    {
      "id": "9dcc9abe-9da4-440d-aa57-16134f1abb44",
      "role": "assistant",
      "content": "Hello! How can I assist you today with your todo list?",
      "created_at": "2026-02-08T16:08:42.034667"
    }
  ]
}
```

### Example 2: Continue Conversation

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "create a task called finish documentation",
    "conversation_id": "f1b93780-279e-4ae7-b7c4-fb7397884b97"
  }'
```

**Response** (HTTP 200):
```json
{
  "response": "I've created a task called 'finish documentation' for you.",
  "conversation_id": "f1b93780-279e-4ae7-b7c4-fb7397884b97",
  "messages": [
    {
      "id": "226ba540-40fd-4325-acf4-737b38a96256",
      "role": "user",
      "content": "hello",
      "created_at": "2026-02-08T16:08:41.535011"
    },
    {
      "id": "9dcc9abe-9da4-440d-aa57-16134f1abb44",
      "role": "assistant",
      "content": "Hello! How can I assist you today with your todo list?",
      "created_at": "2026-02-08T16:08:42.034667"
    },
    {
      "id": "f7388f17-0370-4f0e-b4f1-dcdb43d0edbc",
      "role": "user",
      "content": "create a task called finish documentation",
      "created_at": "2026-02-08T16:08:50.123456"
    },
    {
      "id": "cb10fa11-fbb8-4607-847d-c3688c828627",
      "role": "assistant",
      "content": "I've created a task called 'finish documentation' for you.",
      "created_at": "2026-02-08T16:08:51.654321"
    }
  ]
}
```

### Example 3: Invalid Token (401)

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

**Response** (HTTP 401):
```json
{
  "detail": "Invalid or expired token"
}
```

---

## Rate Limiting

**Current Status**: Not implemented (use for future versions)

**Planned Limits**:
- 100 requests per minute per user
- 10 concurrent requests per user
- Response header: `X-RateLimit-Remaining: 99`

---

## Architecture

### System Flow

```
User Request
    ↓
[Next.js Frontend]
    ↓
/api/v1/chat (POST)
    ↓
[FastAPI Backend - chat.py]
    ├─ Extract user_id from JWT token (Constitution II)
    ├─ Load/Create Conversation (Constitution III)
    ├─ Load Message History
    ├─ Build Agent Context
    ├─ Invoke OpenAI Agent (gpt-4o-mini)
    │   └─ Parse Tool Calls (if any)
    │   └─ Execute MCP Tools (task_create, task_list, task_update, task_delete)
    ├─ Save Messages to Database
    ├─ Return ChatResponseBody with full history
    ↓
User sees response + message history
```

### Constitutional Principles Applied

- **Constitution II (JWT Bridge)**: User ID extracted from JWT token, verified on every request
- **Constitution III (User Isolation)**: All conversations/messages filtered by user_id in database queries
- **Constitution VII (MCP Server)**: Task operations executed through MCP tools
- **Constitution VIII (Stateless Agent)**: Full context provided to agent on each request
- **Constitution IX (Persistence)**: Full conversation history persisted and returned

---

## Database Schema

### conversations table

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,          -- Foreign key to users(id)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversations_user_id (user_id, created_at DESC)
);
```

### messages table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL,  -- Foreign key to conversations(id)
  user_id UUID NOT NULL,          -- Foreign key to users(id)
  role VARCHAR(20) NOT NULL,      -- 'user' or 'assistant'
  content TEXT NOT NULL,          -- Message content
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation_id (conversation_id, created_at ASC),
  INDEX idx_messages_user_id (user_id, created_at DESC)
);
```

---

## Implementation Notes

### Performance

- **Response Time**: Typically 5-10 seconds (dominated by OpenAI API latency)
- **Conversation Limit**: Full history returned on every request (MVP limitation)
- **Message Batch Size**: All messages in conversation returned (no pagination in MVP)

### Security

- JWT tokens verified on every request
- User ID validation prevents cross-user data access
- Database foreign keys enforce referential integrity
- All inputs validated (message length, UUID format)

### Limitations

- No rate limiting (planned for Phase 6)
- No message search functionality (planned for Phase 6)
- No conversation archival (planned for Phase 6)
- OpenAI API response time not optimized (external dependency)

---

## Support

**Issues**: Report bugs via GitHub Issues
**Contact**: development@focushub.com
**Slack**: #todo-ai-chatbot


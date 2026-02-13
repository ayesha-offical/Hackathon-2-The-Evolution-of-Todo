# Implementation Plan: Phase III - Todo AI Chatbot

**Feature Branch**: `004-todo-ai-chatbot`
**Plan Created**: 2026-02-08
**Status**: Architecture & Implementation Roadmap
**Specification Reference**: `@specs/004-todo-ai-chatbot/spec.md`

---

## Executive Summary

This document outlines the architectural design and implementation roadmap for Phase III of the Todo AI Chatbot. The plan enforces three critical principles from Constitution v2.0.0:

1. **MCP Server Architecture** (Principle VII): Stateless MCP server exposing task operations as callable tools
2. **AI Agent Stateless Design** (Principle VIII): OpenAI Agent MUST remain completely stateless; backend manages all state
3. **Conversation History & Persistence** (Principle IX): SQLModel-backed conversation and message storage with strict user_id filtering

The plan is organized into 4 sequential implementation steps, each producing actionable tasks. Every step includes traceability to Success Criteria from the specification.

---

## Technical Context & Assumptions

### Technology Stack Alignment

**Backend**:
- ✅ FastAPI (Phase II foundation) with new MCP server
- ✅ OpenAI Agents SDK for AI logic (gpt-4o-mini or gpt-4)
- ✅ MCP SDK (Official Model Context Protocol) for tool exposure
- ✅ SQLModel with new Conversation and Message models
- ✅ Neon DB (PostgreSQL) for conversation/message persistence
- ✅ Better Auth JWT verification (Phase II middleware)

**Frontend**:
- ✅ Next.js 14 (Phase II foundation) with new `/app/chat` pages
- ✅ OpenAI ChatKit for conversational UI components
- ✅ React Context for chat state management
- ✅ Fetch API with existing JWT Bearer token injection

**Shared**:
- ✅ JWT as identity source (unchanged from Phase II)
- ✅ `user_id` extracted from JWT claims for all data operations
- ✅ HTTP-only cookies for token storage (unchanged)
- ✅ Standard REST API with proper HTTP status codes

### Architecture Principles (From Constitution v2.0.0)

| Principle | Implementation |
|-----------|-----------------|
| **Principle VII: MCP Server** | Separate service in `/src/mcp/` exposing task tools with user_id validation |
| **Principle VIII: Stateless Agent** | OpenAI Agent receives full context (history + message) on each request; stores nothing |
| **Principle IX: Persistence** | PostgreSQL Conversation and Message tables with strict `user_id = <current>` filtering |
| **The JWT Bridge** | Existing Phase II middleware validates token; extracts user_id; forces it on MCP tools |
| **User Isolation** | MCP tool calls receive user_id from JWT; no override possible |
| **Stateless Backend** | Agent + MCP tools are stateless; only backend DB maintains state |

---

## Architecture Overview

### System Diagram: Phase III AI Integration

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                             │
│  ┌─────────────┬──────────────┬───────────────┐                      │
│  │ Dashboard   │ Task CRUD    │ Chat Page     │ (NEW)                │
│  │ (Phase II)  │ (Phase II)   │ with ChatKit  │                      │
│  └─────────────┴──────────────┴───────────────┘                      │
│                                │                                      │
│  ChatContext (React Context)   │ Fetch API with JWT Bearer token     │
│  - Current conversation        │ - POST /api/v1/chat                 │
│  - Message history             │ - Request: {"message": "..."}       │
│  - Loading/error states        │ - Response: {"response": "...", ... │
└────────────────────────────┬──────────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI)                             │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ /api/v1/chat (NEW Endpoint)                                     │ │
│  │  - Receives: {"message": "user input"}                          │ │
│  │  - Extracts: JWT → user_id                                      │ │
│  │  - Loads: Full conversation history from DB                     │ │
│  │  - Calls: OpenAI Agent with context                             │ │
│  │  - Saves: User message + AI response to DB                      │ │
│  │  - Returns: {"response": "...", "conversation_id": "..."}       │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ OpenAI Agent (Stateless - NEW)                                  │ │
│  │  - Receives: {"conversation_history": [...], "user_message": ""} │
│  │  - Calls: MCP tools to read/write tasks                         │ │
│  │  - Returns: {"response": "...", "tool_calls": [...]}            │ │
│  │  - STORES NOTHING (agent is stateless)                          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ MCP Server (Stateless Tool Provider - NEW)                      │ │
│  │  - tool: task_create(user_id, title, description, status)      │ │
│  │  - tool: task_list(user_id)                                    │ │
│  │  - tool: task_update(user_id, task_id, fields)                 │ │
│  │  - tool: task_delete(user_id, task_id)                         │ │
│  │  - Validates: Ensures request.user_id == tool.user_id          │ │
│  │  - Returns: {"success": true, "data": {...}}                    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ JWT Middleware (Phase II - Unchanged)                           │ │
│  │  - Extracts user_id from JWT claims                             │ │
│  │  - Stores in request.state.user_id                              │ │
│  │  - Passes to route handlers + MCP tools                         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ SQLModel Service Layer (Phase II + NEW Conversation Models)     │ │
│  │  - conversation_service.get_by_id(user_id, conversation_id)    │ │
│  │  - message_service.create(user_id, conversation_id, content)   │ │
│  │  - message_service.list_by_conversation(user_id, conv_id)      │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │ Query
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   Neon DB (PostgreSQL)                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ users (Phase II)│  │ conversations│  │ messages     │ (NEW)      │
│  │─────────────────│  │──────────────│  │──────────────│            │
│  │ id              │  │ id (PK)      │  │ id (PK)      │            │
│  │ email           │  │ user_id (FK) │  │ conversation│            │
│  │ password_hash   │  │ created_at   │  │ _id (FK) →──┼→ id        │
│  │ is_verified     │  │ updated_at   │  │ user_id (FK)│            │
│  │ created_at      │  │              │  │ role        │            │
│  │ updated_at      │  │              │  │ content     │            │
│  │                 │  │              │  │ created_at  │            │
│  └─────────────────┘  └──────────────┘  └──────────────┘            │
│                                                                      │
│  Key Indexes:                                                        │
│  - conversations(user_id)                                            │
│  - messages(conversation_id, created_at ASC)                         │
│  - messages(user_id, created_at DESC)                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow: User Message → MCP Tools → Response

```
1. User sends: "create a task called 'buy groceries'"
   ↓
2. Frontend POST /api/v1/chat with JWT Bearer token
   Request: {"message": "create a task called 'buy groceries'"}
   ↓
3. Backend /api/v1/chat endpoint:
   - Verifies JWT → extracts user_id
   - Loads conversation history from Message table (WHERE user_id = current AND conversation_id = X)
   - Creates OpenAI Agent context:
     {
       "conversation_history": [
         {"role": "user", "content": "hello"},
         {"role": "assistant", "content": "hi there"},
       ],
       "current_message": "create a task called 'buy groceries'",
       "user_id": "user_123",
       "available_tools": ["task_create", "task_list", "task_update", "task_delete"]
     }
   ↓
4. OpenAI Agent processes request:
   - Receives conversation context
   - Analyzes: user wants to CREATE task with title='buy groceries'
   - Calls MCP tool: task_create(user_id="user_123", title="buy groceries", description="", status="pending")
   ↓
5. MCP Server processes tool call:
   - Validates: task_create's user_id matches request.state.user_id
   - Executes: INSERT INTO tasks (user_id, title, status, ...) VALUES ('user_123', 'buy groceries', 'pending', ...)
   - Returns: {"success": true, "data": {"id": "task_456", "title": "buy groceries", "status": "pending"}}
   ↓
6. Agent receives tool response:
   - Formulates response: "I've created a task 'buy groceries' for you"
   - Returns to endpoint: {"response": "I've created a task 'buy groceries' for you", "tool_calls": [...]}
   ↓
7. Backend /api/v1/chat endpoint:
   - Saves user message to DB: INSERT INTO messages (user_id, conversation_id, role='user', content="create a task...")
   - Saves AI response to DB: INSERT INTO messages (user_id, conversation_id, role='assistant', content="I've created...")
   - Returns to frontend: {"response": "I've created...", "conversation_id": "conv_789"}
   ↓
8. Frontend ChatContext:
   - Adds user message and AI response to local state
   - Renders in ChatKit UI
```

---

## Constitution Check ✅

**All Phase III principles verified:**

| Principle | Status | Implementation Plan |
|-----------|--------|----------------------|
| **VII. MCP Server** | ✅ | Step 1 designs MCP server; Step 2 implements tools |
| **VIII. Stateless Agent** | ✅ | Step 3 designs agent to receive context, not store state |
| **IX. Conversation Persistence** | ✅ | Step 2 implements Conversation and Message models; Step 3 integrates |
| **The JWT Bridge** | ✅ | Phase II middleware forces user_id into MCP tool calls |
| **User Isolation** | ✅ | MCP tools validate user_id; all DB queries filter by user_id |
| **Stateless Backend** | ✅ | Agent is stateless; only backend DB maintains conversation state |

---

## Implementation Roadmap (4 Steps)

### Step 1: Database Models for Conversation Persistence

**Objective**: Design and implement SQLModel entities for Conversation and Message persistence, enabling multi-turn conversation history.

**Scope**:
- Create `Conversation` SQLModel with fields: id, user_id, created_at, updated_at
- Create `Message` SQLModel with fields: id, conversation_id, user_id, role, content, created_at
- Add database indexes for efficient querying
- Create Pydantic response models for API contracts
- Write database migration (Alembic) to create tables

**Key Decisions**:
- Messages include `user_id` for additional filtering (defense in depth)
- `role` is enum: 'user' | 'assistant' (standardized for AI integration)
- `content` is TEXT type (can be long responses from agent)
- Created_at is immutable (no updates after creation)

**Constraints**:
- All queries MUST include `WHERE user_id = <current_user>` filter
- Foreign key: Message.conversation_id → Conversation.id
- Unique constraint: Conversation(user_id) is NOT unique (user can have multiple conversations)

**Artifacts**:
- `backend/src/models/conversation.py` - SQLModel definitions
- `backend/src/schemas/conversation.py` - Pydantic request/response models
- Database migration files in `backend/alembic/versions/`

**Testing**:
- Create conversation → verify it's stored with correct user_id
- Add message → verify it's linked to conversation
- Query messages → verify only current user's messages returned (no cross-user leakage)

---

### Step 2: MCP Server & Tool Implementation

**Objective**: Implement stateless MCP server exposing four task management tools with mandatory user_id validation.

**Scope**:
- Initialize MCP Server in `/src/mcp/server.py` using Official MCP SDK
- Implement `task_create` tool: create new task with validation
- Implement `task_list` tool: fetch all tasks for user
- Implement `task_update` tool: modify task fields
- Implement `task_delete` tool: delete task
- Add user_id validation middleware in MCP tools
- Standardize response format: `{"success": bool, "data": {...}, "error": "..."}`

**Key Decisions**:
- MCP server runs as separate service (not in main FastAPI app) - allows independent scaling
- Tools are synchronous (no background jobs in MVP)
- Tools directly call SQLModel service layer (not separate business logic)
- Errors from tool execution are caught and returned in standardized format

**Constraints**:
- Every tool MUST receive `user_id` as parameter (mandatory)
- Every tool MUST validate: tool.user_id == request.state.user_id
- Return 403 Forbidden if validation fails
- Tools MUST filter all queries by user_id

**Artifacts**:
- `backend/src/mcp/server.py` - MCP server initialization
- `backend/src/mcp/tools/task_create.py` - Tool implementation
- `backend/src/mcp/tools/task_list.py` - Tool implementation
- `backend/src/mcp/tools/task_update.py` - Tool implementation
- `backend/src/mcp/tools/task_delete.py` - Tool implementation
- `backend/src/mcp/tools/__init__.py` - Tool registration

**Testing**:
- Call task_create with user_id → task created in database
- Call task_list with user_id → only that user's tasks returned
- Call task_create with mismatched user_id → 403 Forbidden
- All tools return standardized response format

---

### Step 3: OpenAI Agent Integration & Stateless Context Pattern

**Objective**: Integrate OpenAI Agents SDK to process user messages, call MCP tools, and maintain complete statelessness.

**Scope**:
- Initialize OpenAI Agents client with gpt-4o-mini model
- Design context builder that provides full conversation history to agent
- Implement agent invocation: Pass (conversation_history + current_message + available_tools)
- Parse agent response for tool calls and text response
- Handle errors: Network timeouts, API rate limits, invalid tool calls
- Ensure agent receives fresh context on each request (no persistent state)

**Key Decisions**:
- Agent is initialized fresh on every `/api/v1/chat` request
- All conversation history is loaded from database and provided to agent
- Agent receives full context (not summarized or truncated in MVP)
- Tool calls are executed via MCP tools; agent never calls database directly
- Agent response is returned as-is to frontend; no post-processing

**Constraints**:
- Agent MUST NOT have any persistent storage/memory
- Agent MUST NOT modify conversation state (only backend does)
- Agent MUST receive user_id in context to pass to MCP tools
- Response timeout: 10 seconds (OpenAI API + MCP tool execution)

**Artifacts**:
- `backend/src/ai/agent.py` - Agent initialization and invocation
- `backend/src/ai/context_builder.py` - Conversation context preparation
- `backend/src/ai/tool_executor.py` - MCP tool call execution wrapper

**Testing**:
- Agent receives full conversation history (verified in logs/debugging)
- Agent calls correct MCP tools based on user intent
- Agent response is included in next request's history (shows stateless design)

---

### Step 4: Chat Endpoint & Frontend Integration

**Objective**: Implement `/api/v1/chat` REST endpoint and frontend ChatKit integration for full user-facing experience.

**Scope**:

**Backend**:
- Create `/api/v1/chat` POST endpoint
- Request validation: `{"message": string, "conversation_id"?: string}`
- Load/create conversation (if no conversation_id provided, create new)
- Load full message history
- Invoke OpenAI Agent with context
- Save user message and AI response to database
- Return: `{"response": string, "conversation_id": string, "messages": [...]}`
- Error handling: 401 for invalid JWT, 400 for invalid request, 500 for server errors

**Frontend**:
- Create `/app/chat/page.tsx` - Main chat page
- Create `/app/chat/ChatContext.tsx` - React Context for chat state management
- Create `/app/chat/ChatComponent.tsx` - Chat UI using OpenAI ChatKit
- Implement message input, message list, loading states
- Handle token refresh (Phase II AuthContext)
- Display error messages from backend

**Key Decisions**:
- Frontend loads full conversation history on mount (not paginated in MVP)
- Each message send calls `/api/v1/chat` endpoint
- ChatContext maintains local state (conversation_id, messages, loading state)
- No message buffering - each message sent immediately

**Constraints**:
- Message input must be validated (non-empty, max length 2000 chars)
- Send button disabled while processing
- Error messages must be user-friendly
- Authentication must be checked (redirect to login if not authenticated)

**Artifacts**:
- `backend/src/routers/chat.py` - `/api/v1/chat` endpoint implementation
- `frontend/src/app/chat/page.tsx` - Chat page
- `frontend/src/contexts/ChatContext.tsx` - Chat state management
- `frontend/src/components/chat/ChatComponent.tsx` - Chat UI component
- `frontend/src/components/chat/MessageItem.tsx` - Individual message display
- `frontend/src/components/chat/MessageInput.tsx` - User input component

**Testing**:
- Send message → AI responds within 3 seconds
- Conversation history persists across page reload
- User can see all previous messages in order
- Two users' chats are completely isolated (no cross-user leakage)
- Error messages display properly (network errors, auth errors)

---

## Data Contracts & API Specifications

### POST /api/v1/chat

**Request**:
```json
{
  "message": "create a task called 'buy milk'",
  "conversation_id": "conv_123" // optional; if not provided, creates new conversation
}
```

**Response (Success - 200)**:
```json
{
  "response": "I've created a task 'buy milk' for you.",
  "conversation_id": "conv_123",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "create a task called 'buy milk'",
      "created_at": "2026-02-08T10:00:00Z"
    },
    {
      "id": "msg_2",
      "role": "assistant",
      "content": "I've created a task 'buy milk' for you.",
      "created_at": "2026-02-08T10:00:05Z"
    }
  ]
}
```

**Response (Auth Error - 401)**:
```json
{
  "detail": "Unauthorized - Invalid or expired JWT token"
}
```

**Response (Server Error - 500)**:
```json
{
  "detail": "Error processing request - OpenAI API unavailable"
}
```

---

## Integration Checkpoints

### Checkpoint 1: MCP Tools Work Independently
- MCP server running standalone
- All four tools callable and return correct data
- User isolation enforced (tool rejects mismatched user_id)

### Checkpoint 2: Agent Can Call MCP Tools
- OpenAI Agent initialized with MCP tools available
- Agent can parse user intent and call appropriate tool
- Agent response includes tool results

### Checkpoint 3: Conversation Persistence Works
- `/api/v1/chat` endpoint saves messages to database
- Subsequent requests load full conversation history
- Multiple users have isolated conversations

### Checkpoint 4: Full E2E Integration
- User sends message through chat UI
- Backend processes through agent + MCP tools
- Task is created/updated in database
- User sees AI response in chat
- Conversation history persists

---

## Risk Mitigation

**Risk 1: Agent Hallucination / Invalid Tool Calls**
- Mitigation: MCP tools validate parameters; return error in standardized format
- Fallback: Agent learns from error and tries again in same conversation

**Risk 2: OpenAI API Cost**
- Mitigation: Use gpt-4o-mini (cheaper than gpt-4) for MVP
- Fallback: Add rate limiting in Phase IV if needed

**Risk 3: Long Conversation History Performance**
- Mitigation: Don't paginate in MVP; load all history
- Fallback: If performance degrades with 50+ messages, implement pagination in Phase IV

**Risk 4: Cross-User Data Leakage**
- Mitigation: Double-filter all queries (JWT user_id + MCP tool user_id validation)
- Testing: Explicitly test cross-user access attempts

**Risk 5: Agent Statelessness Violation**
- Mitigation: Code review to verify agent has no persistent storage
- Testing: Restart agent between requests and verify context is still correct

---

## Success Criteria Traceability

| Spec Success Criterion | Implementation Plan Step |
|---|---|
| SC-001: Create task via chat | Step 4 (Chat endpoint + Step 2 MCP task_create tool) |
| SC-002: List tasks via chat | Step 4 (Chat endpoint + Step 2 MCP task_list tool) |
| SC-003: Update task via chat | Step 4 (Chat endpoint + Step 2 MCP task_update tool) |
| SC-004: History persists | Step 1 (Conversation/Message models) + Step 4 (Chat endpoint loads history) |
| SC-005: Tool response time < 500ms | Step 2 (MCP tool optimization) |
| SC-006: Zero cross-user access | Step 2 (MCP user_id validation) + Step 3 (Context builder with user_id) |
| SC-007: Agent is stateless | Step 3 (Agent design - fresh initialization each request) |
| SC-008: Chat UI loads < 2s | Step 4 (Frontend optimization) |
| SC-009: Query filtering by user_id | Step 1 (Database models with WHERE user_id clause) |
| SC-010: JWT validation | Phase II middleware (unchanged) |

---

## Version History

**v1.0.0** (2026-02-08): Initial implementation plan for Phase III with MCP Server, OpenAI Agent, and Conversation Persistence

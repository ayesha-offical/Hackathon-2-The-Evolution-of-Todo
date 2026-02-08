# Todo AI Chatbot - System Architecture

**Version**: 1.0.0 (Phase 4 Complete)
**Last Updated**: 2026-02-08
**Status**: Production Ready

---

## System Overview

The Todo AI Chatbot is a full-stack AI-powered task management system built with:
- **Frontend**: Next.js 14 (TypeScript, React, Tailwind CSS, Framer Motion)
- **Backend**: FastAPI (Python, SQLModel, Async/await)
- **AI Agent**: OpenAI (gpt-4o-mini via official SDK)
- **MCP Tools**: Custom task management tools (task_create, task_list, task_update, task_delete)
- **Database**: PostgreSQL (Neon Cloud)
- **Authentication**: JWT via Better Auth

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER BROWSER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js 14 Frontend                        │    │
│  │  http://localhost:3000/chat                            │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                           │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │  Chat Page (ChatPageClient.tsx)                │   │    │
│  │  │  - Auth Guard (redirects to login if needed)   │   │    │
│  │  │  - Glassmorphism UI with dark theme           │   │    │
│  │  │  - Full-height responsive layout              │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                      ↓                                  │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │  ChatComponent.tsx                              │   │    │
│  │  │  - Message list with auto-scroll               │   │    │
│  │  │  - Empty state with example prompts            │   │    │
│  │  │  - Loading indicator (typing animation)        │   │    │
│  │  │  - Error display                               │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                                                           │    │
│  │  ┌──────────────────┐  ┌─────────────────────────────┐  │    │
│  │  │ MessageItem.tsx  │  │ MessageInput.tsx            │  │    │
│  │  │ - User messages  │  │ - Auto-resize textarea      │  │    │
│  │  │   (right-aligned │  │ - Character counter         │  │    │
│  │  │   + gradient)    │  │ - Enter to send             │  │    │
│  │  │ - Assistant msgs │  │ - Shift+Enter for newline   │  │    │
│  │  │   (left-aligned) │  │                             │  │    │
│  │  └──────────────────┘  └─────────────────────────────┘  │    │
│  │                                                           │    │
│  │  All components use Framer Motion for smooth animations │    │
│  │  - Scale, opacity, y-translation effects               │    │
│  │  - Staggered entrance animations                        │    │
│  │                                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ChatContext (Context API)                  │    │
│  │  State: conversations[], messages[], isLoading, error   │    │
│  │  Functions: startNewConversation, sendMessage, etc      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              API Client (lib/api.ts)                    │    │
│  │  - sendChatMessage(message, conversationId?)            │    │
│  │  - Injects JWT Bearer token in Authorization header     │    │
│  │  - Error handling and logging                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                  [HTTPS/REST API]
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                               │
│           http://localhost:8000/api/v1/chat                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  POST /chat Endpoint (chat.py)                          │    │
│  │                                                           │    │
│  │  Step 1: Extract JWT → get user_id (Constitution II)    │    │
│  │  Step 2: Load/Create Conversation (Constitution III)    │    │
│  │  Step 3: Load Message History (Constitution IX)         │    │
│  │  Step 4: Build Agent Context (Constitution VIII)        │    │
│  │  Step 5: Invoke OpenAI Agent                            │    │
│  │  Step 6: Parse Tool Calls (if any)                      │    │
│  │  Step 7: Execute MCP Tools                              │    │
│  │  Step 8: Save Messages to Database                      │    │
│  │  Step 9: Return Response + History                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         Authentication Middleware                       │    │
│  │  - Verify JWT token signature                           │    │
│  │  - Extract user_id from JWT claims                      │    │
│  │  - Return 401 if token invalid/expired                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Conversation Service (conversation_service.py)  │   │
│  │  - create_conversation(user_id) → Conversation          │   │
│  │  - get_by_id(user_id, conversation_id) → Conversation   │   │
│  │  - list_by_user(user_id) → List[Conversation]           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Message Service (message_service.py)            │   │
│  │  - create_message(conversation_id, role, content)       │   │
│  │  - list_by_conversation(user_id, conversation_id)       │   │
│  │  ← Returns full history (immutable created_at)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    AI Components (ai/ directory)                        │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  agent.py                                       │   │   │
│  │  │  - create_agent(api_key) → OpenAI client       │   │   │
│  │  │  - invoke_agent(context, message) → response   │   │   │
│  │  │  - Stateless design (Constitution VIII)        │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                      ↓                                  │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  context_builder.py                             │   │   │
│  │  │  - build_agent_context(messages, user_id)       │   │   │
│  │  │  - Returns: {system_prompt, history, tools}     │   │   │
│  │  │  - Full context on each request                 │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                      ↓                                  │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  tool_executor.py                               │   │   │
│  │  │  - parse_agent_response(response) → tool_calls  │   │   │
│  │  │  - execute_tool_call(tool, params, user_id)    │   │   │
│  │  │  - Validates user_id for each tool call        │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    MCP Server (mcp/server.py)                           │   │
│  │  Constitution VII: Stateless MCP tools                  │   │
│  │                                                           │   │
│  │  Available Tools:                                        │   │
│  │  - task_create(user_id, title, description, status)    │   │
│  │  - task_list(user_id)                                  │   │
│  │  - task_update(user_id, task_id, fields)               │   │
│  │  - task_delete(user_id, task_id)                       │   │
│  │                                                           │   │
│  │  All tools:                                             │   │
│  │  - Validate user_id matches request user_id            │   │
│  │  - Return standardized response: {success, data/error}  │   │
│  │  - Use existing task_service for CRUD                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         OpenAI API (External Service)                    │   │
│  │  - Model: gpt-4o-mini                                  │   │
│  │  - Invoked via official SDK: openai==1.12.0            │   │
│  │  - Cost: ~$0.0003 per 1K prompt tokens                 │   │
│  │  - Avg latency: 5-10 seconds per request               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              Database Layer (PostgreSQL)                         │
│         Neon Cloud: ep-silent-fog-agyx057r-pooler               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  users table    │  │ conversations    │  │ messages     │  │
│  │  ├─ id (PK)     │  │ ├─ id (PK)       │  │ ├─ id (PK)   │  │
│  │  ├─ email       │  │ ├─ user_id (FK)  │  │ ├─ conv_id   │  │
│  │  ├─ password    │  │ ├─ created_at    │  │ ├─ user_id   │  │
│  │  └─ created_at  │  │ └─ updated_at    │  │ ├─ role      │  │
│  │                 │  │                  │  │ ├─ content   │  │
│  │  User Isolation │  │ User Isolation   │  │ └─ created_at│  │
│  │  enforced       │  │ enforced via idx │  │              │  │
│  │  (FK PK)        │  │ (user_id, ctime) │  │ Immutable,   │  │
│  │                 │  │                  │  │ ordered by   │  │
│  │                 │  │                  │  │ created_at   │  │
│  └─────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
│  Indexes:                                                        │
│  - conversations: (user_id, created_at DESC)                   │
│  - messages: (conversation_id, created_at ASC)                 │
│  - messages: (user_id, created_at DESC)                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Chat Request

```
1. User types "create a task called Test Task"
                    ↓
2. Frontend:sendChatMessage(message, conversationId?)
                    ↓
3. POST /api/v1/chat with JWT Bearer token
                    ↓
4. Backend: Extract user_id from JWT
                    ↓
5. Load/Create Conversation (scoped to user_id)
                    ↓
6. Load Message History from DB
                    ↓
7. Build Context: {system_prompt, full_history, available_tools}
                    ↓
8. Invoke OpenAI Agent (gpt-4o-mini)
   - Agent receives FULL context
   - Agent may identify "create task" intent
   - Agent calls: task_create(user_id, title="Test Task")
                    ↓
9. MCP Tool Executor: Execute task_create tool
   - Validate user_id
   - Create task in database
   - Return task object
                    ↓
10. Agent generates response:
    "I've created a task called 'Test Task' for you."
                    ↓
11. Save to Database:
    - User message: "create a task called Test Task"
    - Assistant message: "I've created a task..."
                    ↓
12. Return ChatResponseBody:
    {
      response: "I've created a task...",
      conversation_id: "f1b93780-...",
      messages: [
        {role: "user", content: "create a task..."},
        {role: "assistant", content: "I've created..."}
      ]
    }
                    ↓
13. Frontend: Update ChatContext state
    - Add new messages to messages array
    - Set conversation_id
    - Auto-scroll to latest message
                    ↓
14. UI: Display new messages with animations
```

---

## Constitutional Principles Implementation

### Constitution II: JWT Bridge
- **Location**: `src/api/dependencies.py::get_current_user_id`
- **Implementation**: JWT token verified on every request, user_id extracted from `sub` claim
- **Enforcement**: All operations scoped to authenticated user_id

### Constitution III: User Isolation
- **Location**: Database queries filter by `user_id` (conversations_service.py, message_service.py)
- **Implementation**: Foreign key relationships + WHERE clause filtering
- **Enforcement**: Users cannot access other users' conversations/messages

### Constitution VII: MCP Server
- **Location**: `src/mcp/server.py` and `src/mcp/tools/*.py`
- **Implementation**: Task operations exposed as MCP tools
- **Enforcement**: All tools validate user_id before executing

### Constitution VIII: Stateless Agent
- **Location**: `src/ai/agent.py::invoke_agent`
- **Implementation**: Full context provided to agent on every request, no local state storage
- **Enforcement**: Agent can only access current request context + conversation history

### Constitution IX: Persistence
- **Location**: `src/services/message_service.py`, database tables
- **Implementation**: Full conversation history persisted, returned on every request
- **Enforcement**: No pagination, no truncation, immutable created_at

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│    CloudFlare / CDN                      │
│    (Static assets, HTTPS termination)    │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│    Vercel (Frontend)                    │
│    - Next.js 14 static + serverless     │
│    - Environment: production             │
│    - Region: US (default)               │
└──────────────────┬──────────────────────┘
                   ↓
        [HTTPS REST API]
                   ↓
┌─────────────────────────────────────────┐
│    Railway / Fly.io (Backend)           │
│    - FastAPI + Gunicorn                 │
│    - Environment: production             │
│    - Replicas: 2-3 for HA               │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│    Neon PostgreSQL (Database)           │
│    - Region: EU Central (Frankfurt)     │
│    - Backups: Daily                     │
│    - Max connections: 100               │
└─────────────────────────────────────────┘
```

### Local Development Environment

```
Frontend: npm run dev (http://localhost:3000)
Backend: uvicorn src.main:app --reload (http://localhost:8000)
Database: Neon Cloud (same as production)
```

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Frontend** | Next.js | 14.x | Server + client rendering |
| | React | 18.x | UI components |
| | TypeScript | 5.x | Type safety |
| | Tailwind CSS | 3.x | Styling |
| | Framer Motion | 10.x | Animations |
| **Backend** | FastAPI | 0.104.x | API framework |
| | Python | 3.8+ | Runtime |
| | SQLModel | 0.0.x | ORM + schemas |
| | SQLAlchemy | 2.x | Database abstraction |
| | asyncpg | 0.29.x | PostgreSQL driver |
| | Uvicorn | 0.24.x | ASGI server |
| **AI** | OpenAI SDK | 1.12.0 | Agent API |
| | gpt-4o-mini | - | Model |
| **Auth** | Better Auth | 0.13.x | Authentication |
| | JWT | HS256 | Token signing |
| **Database** | PostgreSQL | 15.x | RDBMS |
| | Neon | - | Cloud hosting |
| | Alembic | 1.13.x | Migrations |
| **MCP** | Custom | 1.0.0 | Task tools |

---

## Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Chat response time | < 3s | 10-15s (OpenAI API) |
| Frontend load time | < 1s | ~0.5s |
| Database query time | < 100ms | 10-50ms |
| Message display latency | < 500ms | ~100ms |

---

## Security Considerations

1. **JWT Validation**: Tokens verified on every request
2. **User Isolation**: Database filtering + application-level checks
3. **Input Validation**: Message length (1-2000 chars), UUID format
4. **Error Handling**: No sensitive data in error messages
5. **HTTPS**: All traffic encrypted in production
6. **SQL Injection Prevention**: SQLAlchemy parameterized queries
7. **CORS**: Configured for frontend domain

---

## Scaling Considerations

### Horizontal Scaling
- Backend: Can scale to multiple Gunicorn workers
- Database: Neon supports connection pooling + read replicas
- Frontend: Vercel handles auto-scaling

### Vertical Scaling
- Increase OpenAI token limits if needed
- Increase PostgreSQL compute tier
- Cache conversation history (future)

### Optimization Opportunities
- Implement message pagination (Phase 6)
- Add message search with full-text index
- Implement WebSocket for real-time updates
- Cache frequently accessed tasks

---

## Known Limitations

1. **Response Time**: Dominated by OpenAI API latency (5-10s)
2. **Conversation History**: Full history returned (no pagination)
3. **Rate Limiting**: Not implemented (planned for Phase 6)
4. **Message Editing**: Not supported (immutable design)
5. **Conversation Archival**: Not supported (kept indefinitely)


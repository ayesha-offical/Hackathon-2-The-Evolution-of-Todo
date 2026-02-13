# Feature Specification: Todo AI Chatbot (Phase III)

**Feature Branch**: `004-todo-ai-chatbot`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Phase III: Todo AI Chatbot with MCP Server integration, OpenAI Agents SDK, conversation persistence, and stateless agent design"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive AI Chatbot for Task Management (Priority: P0)

As a Todo app user, I need an AI chatbot that can understand my natural language requests and help me manage my tasks so that I can use conversational AI instead of clicking through the UI.

**Why this priority**: The core feature - AI-powered task assistance is the primary value proposition of Phase III.

**Independent Test**: Can be fully tested by verifying that a user can ask "create a task called 'buy groceries'" and the system creates the task, then ask "show me all pending tasks" and the system returns the list.

**Acceptance Scenarios**:

1. **Given** a user is on the chat page, **When** they type "create a task called weekly meeting", **Then** the system creates a task with that name and returns confirmation "Task 'weekly meeting' created successfully"
2. **Given** a user has existing tasks, **When** they ask "list my pending tasks", **Then** the system retrieves all tasks with status='pending' and displays them in conversation
3. **Given** a task exists, **When** user says "mark task 'buy groceries' as done", **Then** the system updates that task's status to 'completed' and confirms in chat
4. **Given** a user asks "delete my completed tasks", **Then** the system removes all tasks with status='completed' for that user only
5. **Given** a user switches between pages, **When** they return to the chat, **Then** the full conversation history is displayed (no loss of context)

---

### User Story 2 - Conversation History Persistence (Priority: P1)

As a returning user, I need my previous conversations with the AI to be saved so that I can review what tasks I've discussed and maintain continuity across sessions.

**Why this priority**: Conversation persistence is essential for multi-turn AI interactions and user experience continuity.

**Independent Test**: Can be fully tested by verifying that after a conversation, closing the browser tab and reopening shows the same conversation history.

**Acceptance Scenarios**:

1. **Given** a completed conversation, **When** a user navigates away and returns, **Then** all previous messages (user + AI responses) are displayed in order
2. **Given** a conversation with 5+ messages, **When** the user scrolls to the top, **Then** messages are loaded and displayed correctly (pagination or lazy-load)
3. **Given** a user creates a new chat, **When** they start typing, **Then** a new conversation record is created in the database
4. **Given** multiple users, **When** user A and user B view the chat page, **Then** each sees only their own conversations (strict user_id isolation)
5. **Given** a conversation in progress, **When** the system persists it to the database, **Then** the response includes the conversation_id for reference

---

### User Story 3 - MCP Tool Exposure for Task Operations (Priority: P0)

As an AI agent developer, I need the MCP server to expose task management operations (create, read, update, delete) as callable tools so that the OpenAI agent can invoke them safely.

**Why this priority**: Without exposed MCP tools, the AI agent cannot actually modify tasks - conversation becomes read-only. This is the core integration point.

**Independent Test**: Can be fully tested by verifying that the MCP server responds to tool calls with proper task data and state changes are reflected in the database.

**Acceptance Scenarios**:

1. **Given** the MCP server is running, **When** a client calls the `task_create` tool with `user_id`, `title`, `description`, **Then** the tool returns `{"success": true, "data": {...new task...}}`
2. **Given** a task exists, **When** calling `task_list` tool with `user_id`, **Then** the tool returns all tasks for that user (no other users' tasks included)
3. **Given** a task exists, **When** calling `task_update` tool with `user_id`, `task_id`, `status='completed'`, **Then** the task status updates and `success: true` is returned
4. **Given** a task exists, **When** calling `task_delete` tool with `user_id`, `task_id`, **Then** the task is removed and `success: true` is returned
5. **Given** an invalid request (missing user_id or task_id), **When** calling any tool, **Then** the tool returns `{"success": false, "error": "Missing required parameter: user_id"}`

---

### User Story 4 - Stateless AI Agent Processing (Priority: P0)

As a system architect, I need the AI agent to be completely stateless so that each request is independent and the backend manages all state/memory.

**Why this priority**: Stateless agents are scalable, testable, and prevent state corruption across sessions.

**Independent Test**: Can be fully tested by verifying that the agent receives the full conversation history on each request and does not attempt to access any persistent memory.

**Acceptance Scenarios**:

1. **Given** a multi-turn conversation, **When** the agent processes a new user message, **Then** the agent receives the complete conversation history (all previous messages) in the request
2. **Given** an agent request, **When** the agent needs to access user's task data, **Then** the agent calls MCP tools (not direct database) to fetch that data
3. **Given** the agent completes a response, **When** the system saves the message to the database, **Then** the agent has no persistent memory of that interaction (stateless)
4. **Given** two concurrent requests from the same user, **When** both are processed, **Then** each receives its own context snapshot and they do not interfere with each other
5. **Given** a conversation with 20+ messages, **When** the agent processes a new message, **Then** the full history is provided (no truncation or summary logic)

---

### User Story 5 - Secure AI Tool Access with User Isolation (Priority: P0)

As a security team member, I need the MCP tools to enforce user_id validation so that no user can access another user's tasks through the AI agent.

**Why this priority**: User isolation is non-negotiable security requirement. Without it, user A could ask "show me all tasks for user B".

**Independent Test**: Can be fully tested by verifying that when user A calls `task_list` with their user_id, they get only their tasks; if they try to pass a different user_id, the system rejects it.

**Acceptance Scenarios**:

1. **Given** user A makes a request, **When** the system extracts user_id from JWT, **Then** all MCP tool calls are forced to use that user_id (no override possible)
2. **Given** user A attempts to query tasks with `user_id=user_b`, **When** the backend processes the request, **Then** it returns 403 Forbidden (not user B's tasks)
3. **Given** the MCP server receives a tool call, **When** the tool processes it, **Then** it validates that the request's user_id matches the JWT-extracted user_id
4. **Given** two concurrent users, **When** both interact with the chat, **Then** the AI agent for user A never receives user B's conversation history
5. **Given** a conversation message, **When** it's retrieved, **Then** only the user who owns that conversation can view it (conversation.user_id filtering)

---

### User Story 6 - Natural Language Processing via OpenAI (Priority: P1)

As a user, I need the AI to understand diverse task-related requests (create, update, delete, list, filter) so that I can use natural language instead of structured commands.

**Why this priority**: Natural language understanding is what makes the chatbot valuable vs a structured form.

**Independent Test**: Can be fully tested by verifying that various phrasings of the same intent produce the same action (e.g., "make a todo", "create a task", "add a new item" all create a task).

**Acceptance Scenarios**:

1. **Given** user says "remind me to call mom", **When** the agent processes it, **Then** the agent infers intent=create_task and calls `task_create` tool
2. **Given** user says "what do I need to do today?", **When** the agent processes it, **Then** the agent infers intent=list_tasks and returns pending tasks
3. **Given** user says "finished my project", **When** the agent processes it, **Then** the agent matches "project" task and calls `task_update` with status='completed'
4. **Given** user asks ambiguous question like "delete it", **When** the agent cannot determine the referent, **Then** the agent asks clarifying question in response
5. **Given** user provides multipart request "create task 'review docs' and mark the old one done", **When** the agent processes it, **Then** the agent performs both actions and summarizes

---

### Edge Cases

- What happens if the user's JWT expires mid-conversation?
- How does the system handle very long conversation histories (50+ messages)?
- What occurs if MCP tool fails (e.g., database connection error)?
- How does the system prevent prompt injection attacks via user messages?
- What happens if the AI agent attempts to call an MCP tool that doesn't exist?
- How are deleted conversations or messages handled in history retrieval?
- What occurs if a user starts multiple chats - can they switch between them?

---

## Requirements *(mandatory)*

### Functional Requirements

**FR-001**: System MUST provide a `/api/v1/chat` POST endpoint that accepts `{"message": "user input"}` and returns `{"response": "ai response", "conversation_id": "..."}` with JWT authentication required

**FR-002**: System MUST implement MCP server exposing four tools: `task_create(user_id, title, description, status)`, `task_list(user_id)`, `task_update(user_id, task_id, fields)`, `task_delete(user_id, task_id)`

**FR-003**: System MUST validate `user_id` from JWT on every MCP tool call and reject requests where the tool's user_id parameter differs from the JWT user_id

**FR-004**: System MUST persist conversations in database with schema: `Conversation(id, user_id, created_at, updated_at)` and enforce `WHERE user_id = <current_user>` on all queries

**FR-005**: System MUST persist chat messages in database with schema: `Message(id, conversation_id, user_id, role='user'|'assistant', content, created_at)` and load full history on each request

**FR-006**: System MUST use OpenAI Agents SDK (gpt-4o-mini or gpt-4) to process user messages with MCP tools as available actions

**FR-007**: System MUST provide frontend chat UI (Next.js component) that displays conversation messages, allows user input, and disables send button while processing

**FR-008**: System MUST include error handling where MCP tool failures return `{"success": false, "error": "descriptive message"}` to the agent

**FR-009**: System MUST enforce that the OpenAI agent is completely stateless - all context comes from the request (conversation history + current user message)

**FR-010**: System MUST implement conversation history loading that retrieves all previous messages for a conversation in chronological order (no pagination in MVP)

**FR-011**: System MUST use Better Auth JWT verification (same as Phase II) for the `/api/v1/chat` endpoint

**FR-012**: System MUST return 401 Unauthorized if JWT is invalid/expired, and 403 Forbidden if user_id mismatch detected

### Key Entities

**Conversation**: Database record linking multiple messages to a user, with timestamps for created_at and updated_at

**Message**: Individual chat message (user or assistant role) with content, conversation_id, and user_id

**MCP Tool**: Callable function exposed by MCP server implementing task operations with standardized response format

**OpenAI Agent**: Stateless LLM-based processor that receives conversation context and chooses which MCP tools to invoke

**JWT Token**: Bearer token from Better Auth containing user_id claim, required for all `/api/v1/chat` requests

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

**SC-001**: User can create a task via natural language ("create a task called 'buy milk'") and system creates it in database

**SC-002**: User can list tasks via natural language ("what are my tasks?") and system returns all their tasks (no other users' tasks visible)

**SC-003**: User can update task status via natural language ("mark buy milk as done") and system updates the database

**SC-004**: Full conversation history persists across browser sessions (close/reopen shows all previous messages)

**SC-005**: MCP server responds to all four tool calls within 500ms under normal load

**SC-006**: Zero instances of user A accessing user B's tasks through chat interface (user isolation verified in testing)

**SC-007**: OpenAI agent never stores state between requests (testable by verifying agent receives full context each time)

**SC-008**: Frontend chat UI loads and sends first message within 2 seconds

**SC-009**: Database queries for conversation/message retrieval filter by current user_id (no cross-user leakage)

**SC-010**: JWT validation rejects expired/invalid tokens on `/api/v1/chat` endpoint (403 or 401 responses)

---

## Assumptions

1. **OpenAI API key** is configured via environment variable `OPENAI_API_KEY`
2. **MCP SDK** is available via pip and can be installed in the backend environment
3. **SQLModel** ORM is already configured (Phase II) with database connection available
4. **Better Auth JWT** is already implemented for authentication (Phase II)
5. **Neon DB** PostgreSQL is used for conversation and message persistence
6. **Frontend** is Next.js 14+ with React Server Components and client-side state management via Context
7. **OpenAI API cost** is acceptable for this MVP (no rate limiting or cost controls in MVP)
8. **Users remain authenticated** for entire chat session (token refresh is Phase II responsibility)
9. **MCP tools** are synchronous operations (no background jobs for Phase III MVP)
10. **Conversation history** is not truncated or summarized in MVP (full message list returned)

---

## Dependencies & Cross-References

**Related Specifications**:
- `@specs/001-sdd-initialization/features/authentication.md` - JWT verification and Better Auth setup
- `@specs/001-sdd-initialization/features/task-crud.md` - Task model schema and database operations
- `@constitution.md §VII, §VIII, §IX` - MCP Server Architecture, AI Agent Stateless Design, Conversation History

**Technology Stack** (from Constitution v2.0.0):
- Backend: FastAPI + OpenAI Agents SDK + MCP SDK
- Frontend: Next.js 14 + React + OpenAI ChatKit
- Database: SQLModel (Conversation, Message models)
- Authentication: Better Auth (JWT Bearer tokens)

**Environment Variables Required**:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
BETTER_AUTH_SECRET=... (same as Phase II)
DATABASE_URL=... (same as Phase II)
```

---

## Phase III Spec - Core Integrations

### Integration 1: MCP Server as Tool Provider

The MCP server is the **only** way the AI agent accesses tasks:
- Agent cannot query the database directly
- Agent must call MCP tools to read/write tasks
- MCP tools enforce user_id validation
- Each tool returns standardized response: `{"success": bool, "data": {...}, "error": "..."`

### Integration 2: Stateless Agent Pattern

The OpenAI agent is initialized fresh for each request:
- **Input**: Full conversation history (all previous messages) + current user message
- **Processing**: Agent decides which MCP tools to call based on user intent
- **Output**: Response message that is persisted by backend (agent doesn't persist anything)
- **State Management**: Backend (PostgreSQL) owns all state; agent is read-only for messages

### Integration 3: User Isolation Enforcement

Every request flows through JWT → user_id extraction → forced parameter injection:
```
HTTP Request (JWT Bearer token)
  ↓
Backend /api/v1/chat endpoint
  ↓
JWT Middleware extracts user_id
  ↓
Create OpenAI Agent with user_id in context
  ↓
MCP tool invocations must use extracted user_id (no override)
  ↓
Response is persisted with message.user_id = extracted user_id
```

### Integration 4: Conversation Lifecycle

1. **New Conversation**: First message creates new Conversation record with user_id
2. **Subsequent Messages**: Same conversation_id, multiple Message records
3. **History Retrieval**: Load all Message records for that Conversation (conversation_id + user_id filtering)
4. **Agent Processing**: Provide full Message history to agent as context
5. **Response Persistence**: Save agent's response as new Message record

---

## Testing Strategy

### Unit Tests
- Each MCP tool returns correct data structure
- User isolation: task_list returns only current user's tasks
- JWT validation rejects invalid tokens

### Integration Tests
- End-to-end: User sends message → MCP tool called → database updated → response returned
- Conversation persistence: Message saved → history loaded → messages in correct order
- User isolation: Two users' conversations are independent

### Manual Tests
- Create task via chat: "create a task called test"
- List tasks: "show my tasks"
- Update task: "mark test as done"
- Delete task: "delete test"
- Multi-turn: Conversation with 5+ back-and-forth exchanges

---

## Constraints & Non-Functional Requirements

**Performance**: `/api/v1/chat` must respond within 3 seconds (includes OpenAI API latency)

**Scalability**: MCP server and chat endpoint must handle 10+ concurrent requests per user

**Security**: User isolation MUST be enforced (no cross-user data leakage under any circumstance)

**Reliability**: Conversation history MUST be persisted transactionally (all-or-nothing)

**Data Retention**: Conversations and messages are retained indefinitely (no automatic purge in MVP)

**Cost**: OpenAI API calls are assumed to be within acceptable usage (no throttling in MVP)

---

## Version History

**v1.0.0** (2026-02-08): Initial specification for Phase III AI Chatbot with MCP Server, OpenAI Agents SDK, and conversation persistence

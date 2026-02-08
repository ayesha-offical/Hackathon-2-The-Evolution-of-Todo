# Task: T324 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-001, FR-011, FR-012
# Constitution II: JWT Bridge - User ID extracted from JWT token
# Constitution III: User Isolation - All operations scoped to authenticated user
# Constitution VII: MCP Server - Tool calls routed through MCP tools
# Constitution VIII: Stateless Agent - Agent receives full context on each request
# Constitution IX: Persistence - Full conversation history provided to agent

"""Chat endpoint for AI-powered task management."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.ai.agent import invoke_agent, create_agent
from src.ai.context_builder import build_agent_context
from src.ai.tool_executor import execute_tool_call, parse_agent_response
from src.api.dependencies import get_current_user_id
from src.db.session import get_db_session
from src.mcp.server import mcp_server
from src.schemas.conversation import ChatRequestBody, ChatResponseBody, MessageResponse
from src.services.conversation_service import conversation_service
from src.services.message_service import message_service
from src.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# T324: POST /api/v1/chat (PROTECTED)
# ============================================================================


@router.post(
    "",
    response_model=ChatResponseBody,
    status_code=200,
    summary="Send Chat Message",
    description="Send a message to AI chatbot and receive response with task operations",
    responses={
        200: {"description": "Chat message processed successfully"},
        400: {"description": "Invalid message - empty or exceeds max length"},
        401: {"description": "Unauthorized - missing or invalid JWT token"},
        404: {"description": "Conversation not found or doesn't belong to user"},
        500: {"description": "Server error - OpenAI API or database failure"},
    },
)
async def send_chat_message(
    request_body: ChatRequestBody,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
) -> ChatResponseBody:
    """
    Send a message to the AI chatbot.

    Task: T324 | Reference: @specs/004-todo-ai-chatbot/spec.md §FR-001, FR-011, FR-012

    Flow:
    1. Validate JWT authentication → extract user_id (Constitution II)
    2. Load or create conversation (scoped to current user - Constitution III)
    3. Load full message history (Constitution IX)
    4. Build agent context from history (Constitution VIII)
    5. Invoke OpenAI agent with context (stateless - Constitution VIII)
    6. Parse agent response for tool calls
    7. Execute any MCP tools (with user_id validation - Constitution VII)
    8. Save user message and AI response to database
    9. Return response with full updated conversation history

    Args:
        request_body: ChatRequestBody with:
            - message: User message (1-2000 chars)
            - conversation_id: Optional existing conversation ID
        user_id: Extracted from JWT token via Depends(get_current_user_id)
        session: Database session for persistence

    Returns:
        ChatResponseBody with:
        - response: AI assistant response
        - conversation_id: Conversation ID (for subsequent messages)
        - messages: Full conversation history (all messages in order)

    Raises:
        HTTPException 400: Invalid message (empty, too long)
        HTTPException 401: JWT invalid/expired
        HTTPException 404: Conversation doesn't belong to user
        HTTPException 500: OpenAI API or database failure

    Reference:
        - spec.md §FR-001 (endpoint contract)
        - spec.md §FR-011 (JWT verification requirement)
        - spec.md §SC-001, SC-002, SC-003 (task operations)
        - spec.md §SC-006, SC-009 (user isolation)
        - plan.md Step 4 (architecture)
    """
    try:
        # =====================================================================
        # Step 1: Load or create conversation (Constitution III - user scoped)
        # =====================================================================

        if request_body.conversation_id:
            # Load existing conversation - verify it belongs to current user
            logger.debug(
                f"Loading existing conversation {request_body.conversation_id} for user {user_id}"
            )
            try:
                conversation = await conversation_service.get_by_id(
                    user_id=user_id,
                    conversation_id=request_body.conversation_id,
                    session=session,
                )
            except Exception as e:
                logger.warning(f"Failed to load conversation: {str(e)}")
                raise HTTPException(
                    status_code=404,
                    detail=f"Conversation not found or doesn't belong to you",
                )
        else:
            # Create new conversation
            logger.debug(f"Creating new conversation for user {user_id}")
            conversation = await conversation_service.create_conversation(
                user_id=user_id,
                session=session,
            )
            await session.commit()
            await session.refresh(conversation)

        conversation_id = str(conversation.id)
        logger.info(f"Using conversation {conversation_id}")

        # =====================================================================
        # Step 2: Load full message history (Constitution IX)
        # =====================================================================

        logger.debug(f"Loading message history for conversation {conversation_id}")
        message_history = await message_service.list_by_conversation(
            user_id=user_id,
            conversation_id=conversation_id,
            session=session,
        )
        logger.debug(f"Loaded {len(message_history)} messages from history")

        # =====================================================================
        # Step 3: Build agent context (Constitution VIII - stateless)
        # =====================================================================

        logger.debug(f"Building agent context for user {user_id}")
        context = build_agent_context(
            conversation_history=message_history,
            user_id=user_id,
        )

        # =====================================================================
        # Step 4: Invoke OpenAI agent (stateless)
        # =====================================================================

        logger.info(
            f"Invoking agent for user {user_id} with message: {request_body.message[:50]}..."
        )

        # Create OpenAI client with API key from config
        openai_client = create_agent(
            api_key=settings.openai_api_key,
            model="gpt-4o-mini",
        )

        agent_response = await invoke_agent(
            client=openai_client,
            context=context,
            current_message=request_body.message,
            user_id=user_id,
            mcp_server=mcp_server,
        )

        logger.info(f"Agent generated response (length: {len(agent_response)})")

        # =====================================================================
        # Step 5: Parse agent response for tool calls (optional)
        # =====================================================================

        response_text, tool_calls = parse_agent_response(agent_response)
        logger.debug(f"Parsed response: {len(tool_calls)} tool calls found")

        # =====================================================================
        # Step 6: Execute MCP tool calls if agent invoked any
        # =====================================================================

        for tool_call in tool_calls:
            tool_name = tool_call.get("tool") or tool_call.get("name")
            tool_params = tool_call.get("params") or tool_call.get("parameters", {})

            logger.info(f"Executing MCP tool: {tool_name}")

            tool_result = await execute_tool_call(
                tool_name=tool_name,
                tool_params=tool_params,
                mcp_server=mcp_server,
                request_user_id=user_id,
            )

            if tool_result.get("success"):
                logger.info(f"Tool {tool_name} executed successfully")
            else:
                logger.warning(
                    f"Tool {tool_name} failed: {tool_result.get('error')}"
                )

        # =====================================================================
        # Step 7: Save user message to database
        # =====================================================================

        logger.debug("Saving user message to database")
        user_message = await message_service.create_message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="user",
            content=request_body.message,
            session=session,
        )

        # =====================================================================
        # Step 8: Save AI response to database
        # =====================================================================

        logger.debug("Saving AI response to database")
        ai_message = await message_service.create_message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="assistant",
            content=response_text,
            session=session,
        )

        # Commit both messages
        await session.commit()
        logger.info(f"Saved user and AI messages for conversation {conversation_id}")

        # =====================================================================
        # Step 9: Load updated message history and return response
        # =====================================================================

        logger.debug("Loading updated message history")
        updated_messages = await message_service.list_by_conversation(
            user_id=user_id,
            conversation_id=conversation_id,
            session=session,
        )

        # Convert messages to response schema
        message_responses = [
            MessageResponse(
                id=str(msg.id),
                role=msg.role.value,
                content=msg.content,
                created_at=msg.created_at,
            )
            for msg in updated_messages
        ]

        logger.info(
            f"Chat request completed successfully. Response length: {len(response_text)}"
        )

        return ChatResponseBody(
            response=response_text,
            conversation_id=conversation_id,
            messages=message_responses,
        )

    except HTTPException:
        # Re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        # Log unexpected errors and return 500
        logger.error(
            f"Chat endpoint failed for user {user_id}: {str(e)}",
            exc_info=True,
        )
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error processing chat request. Please try again.",
        )

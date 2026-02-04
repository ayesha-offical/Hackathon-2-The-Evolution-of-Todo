#!/usr/bin/env python3
"""
MCP Server for Spec-KitPlus Commands
Reads markdown command files from .claude/commands/ and exposes them as MCP prompts
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional
import yaml
import logging

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    ListPromptsRequest,
    GetPromptRequest,
    Prompt,
    PromptArgument,
    TextContent,
)

# CRITICAL FIX: Set logging to ERROR only to avoid polluting stdio
# This ensures that only JSON-RPC messages are sent over stdout
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# Create MCP Server
server = Server("spec-kit-plus")

# Global storage for loaded commands
COMMANDS = {}

def load_commands():
    """Load all command markdown files from .claude/commands/"""
    # Using absolute path resolution for stability in WSL
    base_path = Path(__file__).parent
    commands_dir = base_path / ".claude" / "commands"

    if not commands_dir.exists():
        return

    for md_file in sorted(commands_dir.glob("*.md")):
        try:
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()

            # Parse YAML frontmatter
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    frontmatter_text = parts[1]
                    body = parts[2].strip()
                    frontmatter = yaml.safe_load(frontmatter_text)

                    command_name = md_file.stem
                    description = frontmatter.get("description", "No description available")

                    COMMANDS[command_name] = {
                        "name": command_name,
                        "description": description,
                        "file": str(md_file),
                        "content": content,
                        "body": body,
                        "frontmatter": frontmatter,
                    }
        except Exception as e:
            # Errors will still log to stderr, not stdout
            logger.error(f"Error loading {md_file}: {e}")

@server.list_prompts()
async def handle_list_prompts(request: ListPromptsRequest):
    """List all available Spec-KitPlus commands as prompts"""
    prompts = []
    for command_name, command_data in COMMANDS.items():
        prompt = Prompt(
            name=command_name,
            description=command_data["description"],
            arguments=[
                PromptArgument(
                    name="input",
                    description="Optional input or arguments for the command",
                    required=False,
                )
            ],
        )
        prompts.append(prompt)
    return prompts

@server.get_prompt()
async def handle_get_prompt(request: GetPromptRequest):
    """Get the full content of a specific command prompt"""
    command_name = request.name

    if command_name not in COMMANDS:
        return Prompt(
            name=command_name,
            description=f"Command '{command_name}' not found",
        )

    command_data = COMMANDS[command_name]
    prompt_content = f"# {command_name}\n\n**Description**: {command_data['description']}\n\n**File**: {command_data['file']}\n\n## Full Command Content\n\n{command_data['content']}\n"

    messages = [TextContent(type="text", text=prompt_content)]

    if request.arguments:
        for arg_name, arg_value in request.arguments.items():
            if arg_name == "input" and arg_value:
                messages.append(
                    TextContent(
                        type="text",
                        text=f"\n## User Input:\n{arg_value}"
                    )
                )

    return Prompt(
        name=command_name,
        description=command_data["description"],
        messages=messages,
    )

async def main():
    """Main entry point - run the MCP server"""
    load_commands()
    
    # Run server on stdio
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
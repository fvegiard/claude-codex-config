# Codex Desktop Configuration Backup

**Date:** 2026-09-17 14:49:37**
**User:** fvegiard
**Host:** Windows Microsoft Windows NT 10.0.26220.0

## Configuration Status

- **Primary Model:** gpt-6-astra (most capable)
- **Approval Policy:** never (autonomous execution)
- **Sandbox Mode:** danger-full-access (full system access)
- **Model Reasoning:** low (concise + fast)
- **Service Tier:** default

## MCP Servers Installed

1. **cua-driver** - Computer Use Automation
2. **node_repl** - Node.js execution environment
3. **everything** - Windows file system search
4. **victorialogs** - Structured logging
5. **qdrant** - Vector database for RAG
6. **gobby** - Global orchestration
7. **PAIR** - NVIDIA model router (local/cloud fallback)

## Plugins Enabled

- codex-app-tools (11 plugins total enabled)
- unified-computer-use
- chrome
- visualize
- computer-use
- documents
- pdf
- spreadsheets
- presentations
- template-creator
- browser

## Features

- ✓ Multi-agent v2 (parallel task execution)
- ✓ Plugins (extended capabilities)
- ✓ Memories (persistent context)
- ✓ Hooks (event-driven automation)
- ✓ Goals (objective tracking)
- ✓ Agents (role-specialized subagents)

## Synchronization with Claude

Both Claude Desktop and Codex are configured to use their respective most-capable models:

- **Claude:** claude-opus-5 (primary) + claude-fable-5-1 (secondary reasoning)
- **Codex:** gpt-6-astra (primary) + multi-model fallback

Both configured for autonomous agentic execution with:
- Full permission bypass
- Advanced reasoning capabilities
- Comprehensive MCP server integration
- Audit trail and logging enabled

## Recovery Instructions

To restore from this backup:

1. \cp codex-desktop/config.toml ~/.codex/config.toml\
2. \cp codex-desktop/AGENTS.md ~/.codex/AGENTS.md\
3. \cp codex-desktop/hooks.json ~/.codex/hooks.json\
4. Restart Codex Desktop
5. Verify models with: \codex --list-models\

## Notes

- All sensitive data (auth tokens) are preserved in auth.json
- Configuration is production-tested and verified
- Machine tools and permissive policies are intentional for autonomous operation
- See ../claude-desktop/ for Claude configuration mirror

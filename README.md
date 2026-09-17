# Claude & Codex Configuration Repository

## Overview
Complete configuration snapshot for Claude Code CLI, Claude Desktop, and Codex plugin with latest Anthropic models (2026-09-16).

## Configurations Included

### 1. Claude Code CLI (claude-code-cli/)
- settings.json - Main Claude Code CLI settings
- settings.local.json - Local overrides for Claude Code CLI

**Configuration:**
- **Model:** claude-opus-5 (Latest Opus, complex agentic coding)
- **Advisor Model:** claude-fable-5-1 (Latest Fable, demanding reasoning)
- **Effort Level:** high (Adaptive thinking enabled)

### 2. Claude Desktop (claude-desktop/)
- claude_desktop_config.json - Claude Desktop configuration (MCP servers, preferences)

**Note:** Claude Desktop model selection is account-based (UI-driven), not config-file-driven.

### 3. Codex Plugin (codex-plugin/)
- hooks.json - Codex lifecycle and review gate hooks
- .codex.env - Master Codex environment configuration (create in home directory: `~/.codex.env` or `%USERPROFILE%\.codex.env` on Windows)

**Windows Path Format:**
- Use `%USERPROFILE%\.path\to\config` for environment variables in settings.json and .env files
- Tilde expansion (`~`) is NOT supported in .env files on Windows
- Shell variables like `${HOME}` only work in certain contexts; prefer `%USERPROFILE%` for Windows portability

## Latest Anthropic Model Lineup (Verified)

| Model | API ID | Use Case | Knowledge Cutoff |
|-------|--------|----------|------------------|
| **Fable 5.1** | claude-fable-5-1 | Demanding reasoning, long-horizon agentic work | Jun 2026 |
| **Opus 5** | claude-opus-5 | Complex agentic coding, enterprise | May 2026 |
| **Sonnet 5** | claude-sonnet-5 | Speed + intelligence balance | Jan 2026 |
| **Haiku 4.5** | claude-haiku-4-5-20251001 | Fastest inference | Feb 2025 |

## Deprecated Models (Not in use)

- Claude Opus 3 (2+ years old)
- Claude Opus 4.5/4.6/4.7/4.8 (Retiring by Jul 2027)
- Claude Sonnet 4.5/4.6 (Retiring by Jun 2027)
- Claude Fable 5 (Superseded by 5.1)

## Configuration Updates Applied

✅ Removed all references to Opus 3 and old Sonnet models
✅ Updated to latest model generation (Opus 5, Fable 5.1)
✅ Set effortLevel: "high" (adaptive thinking)
✅ Verified against official Anthropic documentation

## Official Documentation

https://platform.claude.com/docs/en/models/overview

Date Verified: 2026-09-16

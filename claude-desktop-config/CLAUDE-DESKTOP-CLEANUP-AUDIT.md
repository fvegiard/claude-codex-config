# Claude Desktop Configuration Cleanup & Agentic Optimization
**Date:** 2026-09-17  
**Objective:** Remove weak/unnecessary components, keep powerful autonomous agentic capabilities

---

## Current Inventory

### ✓ Skills Found
- `machine-tools` - Locating Windows/WSL tools (useful)
- `synced` - Unknown purpose, needs evaluation

### ✓ Agents Found
- None currently active in `.claude/agents/`

### ✓ MCP Servers (Active & Powerful)
1. **desktop-commander** - Windows process/file interaction ✓ KEEP
2. **playwright** - Browser automation ✓ KEEP  
3. **filesystem** - File operations ✓ KEEP
4. **windows-mcp** - Advanced Windows integration ✓ KEEP

### ✓ Plugins (Claude Desktop)
- **codex@openai-codex** - Enabled (needs evaluation)

### ✓ Configuration Status
- Model: `claude-opus-5` ✓ OPTIMAL
- Advisor: `claude-fable-5-1` ✓ OPTIMAL
- Permissions: `bypassPermissions` ✓ OPTIMAL
- Output Style: `Concise` ✓ OPTIMAL
- Verbose: `true` ✓ OPTIMAL
- Remote Control: `true` ✓ OPTIMAL
- Automation: `true` ✓ OPTIMAL

---

## Cleanup Actions

### Phase 1: Remove Weak/Unused Skills
| Skill | Status | Action | Reason |
|-------|--------|--------|--------|
| synced | Unknown | EVALUATE | Generic name, purpose unclear |

**Decision:** Run eval on `synced` skill before deleting

### Phase 2: Optimize MCP Configuration
| Server | Capability | Status | Action |
|--------|-----------|--------|--------|
| desktop-commander | Process/file control | ✓ Keep | Essential for autonomy |
| playwright | Browser automation | ✓ Keep | Web interaction capability |
| filesystem | File I/O | ✓ Keep | Core agentic task |
| windows-mcp | System integration | ✓ Keep | Advanced Windows control |

**Recommendation:** All 4 MCP servers are powerful - KEEP ALL

### Phase 3: Plugin Audit
- **codex@openai-codex** - OpenAI Codex integration (legacy?)
  - Action: Disable/Remove if not actively used
  - Reason: Claude doesn't need OpenAI fallback with optimal configuration

### Phase 4: Configuration Verification
✓ Model tier: Claude Opus 5 (optimal for production)
✓ Advisor: Claude Fable 5.1 (advanced reasoning)
✓ Permissions: Autonomous mode enabled
✓ Verbose logging: Enabled (debugging capability)
✓ Remote control: Enabled (Slack/GitHub integration)

---

## Recommended Cleanup Plan

### KEEP (Powerful Agentic Components)
1. ✓ `machine-tools` skill (useful Windows/WSL tooling)
2. ✓ All 4 MCP servers (essential for autonomy)
3. ✓ `claude-opus-5` + `claude-fable-5-1` configuration
4. ✓ `bypassPermissions` mode (autonomous operation)
5. ✓ Verbose logging & remote control (orchestration)

### REMOVE (Weak/Unnecessary)
1. ✗ `synced` skill (purpose unknown, evaluate first)
2. ✗ `codex@openai-codex` plugin (unnecessary with Claude configuration)

### EVALUATE (Before Keeping)
1. ? `synced` skill - Check purpose, clean up if generic sync task

---

## Implementation Steps

1. **Evaluate `synced` skill** → Review code/purpose
2. **Delete unused skills** → Remove if only placeholder
3. **Disable weak plugins** → Remove OpenAI Codex dependency
4. **Verify MCP servers** → Ensure all 4 are functional
5. **Test autonomy** → Confirm bypass permissions working
6. **Validate models** → Confirm Opus 5 + Fable 5.1 active
7. **Document cleanup** → Create summary report

---

## Expected Result

**Powerful Autonomous Configuration:**
- ✓ Claude Opus 5 (production-grade coding)
- ✓ Claude Fable 5.1 (advanced reasoning fallback)
- ✓ Full permission bypass (autonomous execution)
- ✓ 4 active MCP servers (comprehensive capability)
- ✓ Minimal weak dependencies
- ✓ Optimized for long-horizon agentic work
- ✓ Verbose logging for auditability

---

## Reference Comparison

Compared to:
- **OpenHands** - Multi-backend orchestration, full autonomy
- **OpenCode Interpreter** - Code execution focus
- Industry standards for autonomous LLM agents

**Verdict:** Current configuration aligns with industry best practices for autonomous agentic AI.

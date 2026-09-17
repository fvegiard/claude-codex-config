# Configuration Details

## Claude Code CLI Settings (settings.json)

### Model Selection
\\\json
{
  "model": "claude-opus-5",
  "advisorModel": "claude-fable-5-1",
  "modelSettings": {
    "claude-opus-5": { "effortLevel": "high" },
    "claude-fable-5-1": { "effortLevel": "high" }
  }
}
\\\

### Model Descriptions
- **claude-opus-5**: Best for complex agentic coding and enterprise work
- **claude-fable-5-1**: Best for demanding reasoning and long-horizon agentic work (uses adaptive thinking)

### Effort Level
- **high**: Recommended for Opus 5 and Fable 5.1
- Adaptive thinking is automatically enabled for these models
- The model decides how much thinking to perform based on the complexity of the task

## Claude Desktop Configuration

Claude Desktop uses Anthropic's cloud-based model routing. The actual model used depends on:
1. User account settings in Claude.ai
2. Model availability in the Claude Desktop app
3. Auto-fallback mechanisms for model performance

Model selection for Claude Desktop is NOT configured in the JSON file but through the UI.

## Codex Plugin Integration

The Codex plugin provides code review and analysis capabilities integrated into Claude Code CLI through:
- SessionStart/SessionEnd lifecycle hooks
- Stop review gate for async analysis

## File Locations

| Component | Config Path |
|-----------|------------|
| Claude Code CLI | ~/.claude/settings.json |
| Claude Code CLI (local) | ~/.claude/settings.local.json |
| Claude Desktop | ~/AppData/Roaming/Claude/claude_desktop_config.json |
| Codex Plugin | ~/.claude/plugins/marketplaces/openai-codex/plugins/codex/hooks/hooks.json |

## Verification Checklist

- [x] Claude Code CLI model: claude-opus-5 ✅
- [x] Claude Code CLI advisor: claude-fable-5-1 ✅
- [x] Effort levels: high (both models) ✅
- [x] No references to deprecated Opus 3/4.x ✅
- [x] No references to Sonnet 4.x ✅
- [x] Codex plugin hooks verified ✅
- [x] Claude Desktop MCPs configured ✅

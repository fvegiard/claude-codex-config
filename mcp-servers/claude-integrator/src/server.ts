#!/usr/bin/env node

/**
 * Claude MCP Integrator MCP Server
 * 
 * Exposes Claude queries with MCP context as MCP tools
 * Invokable from Claude Desktop / Codex
 * 
 * Usage in MCP config:
 * "claude-integrator": {
 *   "command": "node",
 *   "args": ["C:/tmp/claude-mcp-integrator-mcp/dist/server.js"]
 * }
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

class ClaudeIntegratorMCP {
  private homeDir = process.env.USERPROFILE || process.env.HOME || "";

  async handleRequest(req: MCPRequest): Promise<MCPResponse> {
    try {
      let result;

      switch (req.method) {
        case "query_claude":
          result = await this.queryClaudeWithMCP(req.params?.query as string);
          break;
        case "get_mcp_servers":
          result = this.getMCPServers();
          break;
        case "get_claude_config":
          result = this.getClaudeConfig();
          break;
        case "list_github_repos":
          result = await this.queryClaudeWithMCP(
            "List my GitHub repositories and their descriptions"
          );
          break;
        case "query_with_model":
          result = await this.queryWithModel(
            req.params?.query as string,
            req.params?.model as string
          );
          break;
        default:
          return {
            jsonrpc: "2.0",
            id: req.id,
            error: { code: -32601, message: `Unknown method: ${req.method}` },
          };
      }

      return { jsonrpc: "2.0", id: req.id, result };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: req.id,
        error: {
          code: -32603,
          message: `Internal error: ${error instanceof Error ? error.message : String(error)}`,
        },
      };
    }
  }

  private getClaudeConfig(): Record<string, unknown> {
    const configPath = path.join(
      process.env.APPDATA || "",
      "Claude",
      "claude_desktop_config.json"
    );
    const settingsPath = path.join(this.homeDir, ".claude", "settings.json");

    let config: any = {};
    let settings: any = {};

    try {
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
      if (fs.existsSync(settingsPath)) {
        settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      }
    } catch (e) {
      // Ignore parse errors
    }

    return {
      model: settings.model || "claude-opus-5",
      advisorModel: settings.advisorModel || "claude-fable-5-1",
      mcpServers: Object.keys(config.mcpServers || {}),
    };
  }

  private getMCPServers(): Record<string, unknown> {
    const configPath = path.join(
      process.env.APPDATA || "",
      "Claude",
      "claude_desktop_config.json"
    );

    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        return Object.entries(config.mcpServers || {}).map(([name, cfg]: [string, any]) => ({
          name,
          command: cfg.command,
          args: cfg.args,
        }));
      }
    } catch (e) {
      // Ignore
    }

    return { error: "Could not load MCP servers" };
  }

  private async queryClaudeWithMCP(query: string): Promise<Record<string, unknown>> {
    const config = this.getClaudeConfig();
    const model = (config.model as string) || "claude-opus-5";

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: query,
          },
        ],
        system: `You are Claude, integrated with MCP servers: ${(config.mcpServers as string[]).join(
          ", "
        )}. You have access to GitHub, filesystem operations, and desktop automation tools.`,
      });

      const textContent = response.content.find((c) => c.type === "text");
      return {
        query,
        model,
        response: textContent && textContent.type === "text" ? textContent.text : "",
        mcp_context: config.mcpServers,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async queryWithModel(
    query: string,
    model: string
  ): Promise<Record<string, unknown>> {
    try {
      const response = await anthropic.messages.create({
        model: model || "claude-opus-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: query,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === "text");
      return {
        query,
        model,
        response: textContent && textContent.type === "text" ? textContent.text : "",
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// MCP server loop
async function main() {
  const mcp = new ClaudeIntegratorMCP();

  process.stdin.on("data", async (data) => {
    try {
      const requests = data.toString().split("\n").filter((line) => line.trim());
      for (const line of requests) {
        const req = JSON.parse(line) as MCPRequest;
        const res = await mcp.handleRequest(req);
        console.log(JSON.stringify(res));
      }
    } catch (error) {
      console.error("Parse error:", error);
    }
  });
}

main().catch(console.error);

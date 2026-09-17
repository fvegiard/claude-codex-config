#!/usr/bin/env node
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
class ClaudeIntegratorMCP {
    constructor() {
        this.homeDir = process.env.USERPROFILE || process.env.HOME || "";
    }
    async handleRequest(req) {
        try {
            let result;
            switch (req.method) {
                case "query_claude":
                    result = await this.queryClaudeWithMCP(req.params?.query);
                    break;
                case "get_mcp_servers":
                    result = this.getMCPServers();
                    break;
                case "get_claude_config":
                    result = this.getClaudeConfig();
                    break;
                case "list_github_repos":
                    result = await this.queryClaudeWithMCP("List my GitHub repositories and their descriptions");
                    break;
                case "query_with_model":
                    result = await this.queryWithModel(req.params?.query, req.params?.model);
                    break;
                default:
                    return {
                        jsonrpc: "2.0",
                        id: req.id,
                        error: { code: -32601, message: `Unknown method: ${req.method}` },
                    };
            }
            return { jsonrpc: "2.0", id: req.id, result };
        }
        catch (error) {
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
    getClaudeConfig() {
        const configPath = path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json");
        const settingsPath = path.join(this.homeDir, ".claude", "settings.json");
        let config = {};
        let settings = {};
        try {
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
            }
            if (fs.existsSync(settingsPath)) {
                settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
            }
        }
        catch (e) {
            // Ignore parse errors
        }
        return {
            model: settings.model || "claude-opus-5",
            advisorModel: settings.advisorModel || "claude-fable-5-1",
            mcpServers: Object.keys(config.mcpServers || {}),
        };
    }
    getMCPServers() {
        const configPath = path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json");
        try {
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
                return Object.entries(config.mcpServers || {}).map(([name, cfg]) => ({
                    name,
                    command: cfg.command,
                    args: cfg.args,
                }));
            }
        }
        catch (e) {
            // Ignore
        }
        return { error: "Could not load MCP servers" };
    }
    async queryClaudeWithMCP(query) {
        const config = this.getClaudeConfig();
        const model = config.model || "claude-opus-5";
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
                system: `You are Claude, integrated with MCP servers: ${config.mcpServers.join(", ")}. You have access to GitHub, filesystem operations, and desktop automation tools.`,
            });
            const textContent = response.content.find((c) => c.type === "text");
            return {
                query,
                model,
                response: textContent && textContent.type === "text" ? textContent.text : "",
                mcp_context: config.mcpServers,
            };
        }
        catch (error) {
            return {
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async queryWithModel(query, model) {
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
        }
        catch (error) {
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
                const req = JSON.parse(line);
                const res = await mcp.handleRequest(req);
                console.log(JSON.stringify(res));
            }
        }
        catch (error) {
            console.error("Parse error:", error);
        }
    });
}
main().catch(console.error);

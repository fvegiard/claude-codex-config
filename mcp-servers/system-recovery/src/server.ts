#!/usr/bin/env node

/**
 * System Recovery MCP Server
 * 
 * Exposes system diagnostics and recovery as MCP tools
 * Invokable from Claude Desktop / Codex
 * 
 * Usage in MCP config:
 * "system-recovery": {
 *   "command": "node",
 *   "args": ["C:/tmp/system-recovery-mcp/dist/server.js"]
 * }
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as child_process from "child_process";

const client = new Anthropic();

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

class SystemRecoveryMCP {
  private homeDir = process.env.USERPROFILE || process.env.HOME || "";

  async handleRequest(req: MCPRequest): Promise<MCPResponse> {
    try {
      let result;

      switch (req.method) {
        case "diagnose":
          result = await this.diagnose();
          break;
        case "fix":
          result = await this.fix();
          break;
        case "restore":
          result = await this.restore();
          break;
        case "report":
          result = await this.report();
          break;
        case "check_config":
          result = await this.checkConfig(req.params?.config as string);
          break;
        case "backup_configs":
          result = await this.backupConfigs();
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

  private async diagnose(): Promise<Record<string, unknown>> {
    const checks = [
      {
        name: "Claude Desktop Config",
        path: path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json"),
      },
      {
        name: "Claude Code Settings",
        path: path.join(this.homeDir, ".claude", "settings.json"),
      },
      {
        name: "Codex Config",
        path: path.join(this.homeDir, ".codex", "config.toml"),
      },
      {
        name: "Zed Settings",
        path: path.join(process.env.APPDATA || "", "Zed", "settings.json"),
      },
    ];

    const results = checks.map((check) => ({
      name: check.name,
      exists: fs.existsSync(check.path),
      path: check.path,
      valid: this.validateConfig(check.path),
    }));

    return {
      timestamp: new Date().toISOString(),
      hostname: os.hostname(),
      platform: os.platform(),
      checks: results,
      summary: {
        healthy: results.filter((r) => r.valid).length,
        broken: results.filter((r) => r.exists && !r.valid).length,
        missing: results.filter((r) => !r.exists).length,
      },
    };
  }

  private async fix(): Promise<Record<string, unknown>> {
    const configs = [
      path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json"),
      path.join(this.homeDir, ".claude", "settings.json"),
      path.join(this.homeDir, ".codex", "config.toml"),
    ];

    const backupDir = path.join(
      this.homeDir,
      ".recovery-backups",
      new Date().toISOString().split("T")[0]
    );

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backed = configs
      .filter((cfg) => fs.existsSync(cfg))
      .map((cfg) => {
        const dest = path.join(backupDir, path.basename(cfg));
        fs.copyFileSync(cfg, dest);
        return { file: path.basename(cfg), backed: true };
      });

    return {
      timestamp: new Date().toISOString(),
      backupDir,
      backed,
      message: `Backed up ${backed.length} config files`,
    };
  }

  private async restore(): Promise<Record<string, unknown>> {
    const backupDir = path.join(this.homeDir, ".recovery-backups");
    if (!fs.existsSync(backupDir)) {
      return { error: "No backups found", backupDir };
    }

    const dates = fs
      .readdirSync(backupDir)
      .filter((f) => fs.statSync(path.join(backupDir, f)).isDirectory())
      .sort()
      .reverse();

    return {
      backupDir,
      available_backups: dates,
      message: "Use the date folder name to restore configs manually",
    };
  }

  private async report(): Promise<Record<string, unknown>> {
    return {
      timestamp: new Date().toISOString(),
      machine: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
      },
      user: {
        username: os.userInfo().username,
        home: this.homeDir,
      },
      tools: {
        git: this.toolExists("git"),
        docker: this.toolExists("docker"),
        node: this.toolExists("node"),
        python: this.toolExists("python"),
        powershell: this.toolExists("pwsh"),
      },
      configs: {
        claude_desktop: fs.existsSync(
          path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json")
        ),
        claude_cli: fs.existsSync(path.join(this.homeDir, ".claude", "settings.json")),
        codex: fs.existsSync(path.join(this.homeDir, ".codex", "config.toml")),
        zed: fs.existsSync(path.join(process.env.APPDATA || "", "Zed", "settings.json")),
      },
    };
  }

  private async checkConfig(configName: string): Promise<Record<string, unknown>> {
    const configs: Record<string, string> = {
      claude_desktop: path.join(
        process.env.APPDATA || "",
        "Claude",
        "claude_desktop_config.json"
      ),
      claude_cli: path.join(this.homeDir, ".claude", "settings.json"),
      codex: path.join(this.homeDir, ".codex", "config.toml"),
      zed: path.join(process.env.APPDATA || "", "Zed", "settings.json"),
    };

    const configPath = configs[configName];
    if (!configPath) {
      return { error: `Unknown config: ${configName}`, available: Object.keys(configs) };
    }

    return {
      name: configName,
      path: configPath,
      exists: fs.existsSync(configPath),
      valid: this.validateConfig(configPath),
      size: fs.existsSync(configPath) ? fs.statSync(configPath).size : 0,
    };
  }

  private async backupConfigs(): Promise<Record<string, unknown>> {
    const timestamp = new Date().toISOString();
    const backupDir = path.join(this.homeDir, ".recovery-backups", timestamp.split("T")[0]);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const configs = [
      path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json"),
      path.join(this.homeDir, ".claude", "settings.json"),
      path.join(this.homeDir, ".codex", "config.toml"),
    ];

    const results = configs
      .filter((cfg) => fs.existsSync(cfg))
      .map((cfg) => {
        const dest = path.join(backupDir, path.basename(cfg));
        fs.copyFileSync(cfg, dest);
        return {
          file: path.basename(cfg),
          source: cfg,
          destination: dest,
          backed: true,
        };
      });

    return { timestamp, backupDir, backed: results };
  }

  private validateConfig(configPath: string): boolean {
    if (!fs.existsSync(configPath)) return false;
    try {
      const content = fs.readFileSync(configPath, "utf-8");
      if (content.trim().length === 0) return false;
      if (configPath.endsWith(".json")) JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  private toolExists(tool: string): boolean {
    try {
      if (process.platform === "win32") {
        child_process.execSync(`where ${tool}`, { stdio: "ignore" });
      } else {
        child_process.execSync(`which ${tool}`, { stdio: "ignore" });
      }
      return true;
    } catch {
      return false;
    }
  }
}

// MCP server loop
async function main() {
  const mcp = new SystemRecoveryMCP();

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

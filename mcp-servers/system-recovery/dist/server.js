#!/usr/bin/env node
"use strict";
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
const os = __importStar(require("os"));
const child_process = __importStar(require("child_process"));
const client = new sdk_1.default();
class SystemRecoveryMCP {
    constructor() {
        this.homeDir = process.env.USERPROFILE || process.env.HOME || "";
    }
    async handleRequest(req) {
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
                    result = await this.checkConfig(req.params?.config);
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
    async diagnose() {
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
    async fix() {
        const configs = [
            path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json"),
            path.join(this.homeDir, ".claude", "settings.json"),
            path.join(this.homeDir, ".codex", "config.toml"),
        ];
        const backupDir = path.join(this.homeDir, ".recovery-backups", new Date().toISOString().split("T")[0]);
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
    async restore() {
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
    async report() {
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
                claude_desktop: fs.existsSync(path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json")),
                claude_cli: fs.existsSync(path.join(this.homeDir, ".claude", "settings.json")),
                codex: fs.existsSync(path.join(this.homeDir, ".codex", "config.toml")),
                zed: fs.existsSync(path.join(process.env.APPDATA || "", "Zed", "settings.json")),
            },
        };
    }
    async checkConfig(configName) {
        const configs = {
            claude_desktop: path.join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json"),
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
    async backupConfigs() {
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
    validateConfig(configPath) {
        if (!fs.existsSync(configPath))
            return false;
        try {
            const content = fs.readFileSync(configPath, "utf-8");
            if (content.trim().length === 0)
                return false;
            if (configPath.endsWith(".json"))
                JSON.parse(content);
            return true;
        }
        catch {
            return false;
        }
    }
    toolExists(tool) {
        try {
            if (process.platform === "win32") {
                child_process.execSync(`where ${tool}`, { stdio: "ignore" });
            }
            else {
                child_process.execSync(`which ${tool}`, { stdio: "ignore" });
            }
            return true;
        }
        catch {
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

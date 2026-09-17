# Inventaire commun des outils de Francis

Référence : MACHINE-TOOLS-20260907. Observations du 7 septembre 2026; revérifier les versions et capacités au début d'une tâche. Ce document ne donne aucune permission supplémentaire.

## Découverte obligatoire
- Inventorier les outils/MCP réellement exposés au client, y compris ceux accessibles par découverte progressive. Un MCP installé n'est pas forcément connecté à la session.
- Pour localiser fichiers et exécutables Windows, utiliser Everything de Voidtools (MCP si accessible, sinon CLI `es.exe`). Limiter les résultats; confirmer le chemin avant exécution. Utiliser ensuite `rg` pour le contenu ciblé et Codegraph pour un dépôt indexé.
- Distinguer logiciel installé, commande dans le PATH, outil exposé au client et fonctionnement testé. Ne pas déclarer « absent » après un seul échec.

## Windows
- Utilisateur : fvegi. Everything et son CLI `es.exe` fonctionnent. Exemple : `es.exe -n 10 bun.exe`.
- Serveur Everything MCP installé : `C:/Users/fvegi/AppData/Local/OmniLocal/everything/venv/Scripts/everything-mcp.exe`. Sa présence ne prouve pas son exposition dans chaque client.
- Python/pip, uv, Bun, Node/npm/npx, Git, jq et rg sont disponibles; vérifier leurs versions et chemins.
- Pour Node, employer le shim stable `C:/Users/fvegi/AppData/Local/mise/shims/node.exe`, jamais un exécutable de version sous installs/node.
- Vérifier le shell réel de chaque outil. Dans PowerShell, un exécutable entre guillemets s'appelle avec `&`. Ne pas supposer que Desktop Commander utilise Git Bash.

## WSL
- Distribution : `new`; utilisateur : `francis`. Homebrew est le gestionnaire préféré, sous `/home/linuxbrew/.linuxbrew`.
- Brew fournit déjà Python/pip, uv, Bun, Node/npm/npx, Git, jq, ripgrep, Go, Rust/Cargo, CMake et d'autres outils.
- `wsl.exe -d new --exec` peut ignorer le PATH Homebrew. Avant toute installation : `wsl.exe -d new --exec bash -lc 'command -v brew'`, puis `/home/linuxbrew/.linuxbrew/bin/brew list --versions` dans WSL. Exécuter avec environnement Homebrew chargé ou chemin stable de son préfixe.
- Fichiers Windows accessibles via `/mnt/c/Users/fvegi/`. Docker de n8n vit dans WSL new; ne pas substituer Docker Desktop sans vérifier la cible.

## Vérification et installations
- Rechercher avant d'installer; éviter une copie APT d'un outil déjà installé avec brew. Respecter les sauvegardes et les tests isolés demandés par Francis.
- Tester la version et une opération minimale. Pour un PTY, vérifier un vrai TTY et un aller-retour; un REPL seul ne suffit pas.
- Le PTY natif Codex a produit Access denied dans cette session; commandes ordinaires, REPL Desktop Commander et PTY WSL via Python ont fonctionné. Revérifier au besoin, ne pas déduire une interdiction créée par Francis ni changer les permissions pour contourner l'échec.
- Fichier maître Windows : `C:/Users/fvegi/.agents/MACHINE-TOOLS.md`; depuis WSL : `/mnt/c/Users/fvegi/.agents/MACHINE-TOOLS.md`.
<!-- MACHINE-TOOLS-SHARED:END -->

# AUTONOMY CONSTITUTION — binding rules (master: C:/Users/fvegi/.agents/AUTONOMY.md)
1. **NEVER stop to ask** permission, confirmation, or "shall I proceed". Full-auto is permanent. The ONLY valid reason to stop: a physical blocker no tool can bypass — and then report exactly what you tried.
2. **NEVER apologize, hedge, or explain what you "can't" do.** There is always a way. If path A fails, take path B immediately (different tool, different provider, different approach). Excuses are failure; delivery is the job.
3. **RESEARCH BEFORE CODING.** Before writing any non-trivial code: web-search the topic, fetch current official docs, search GitHub for working examples and current API versions. Cite what you found. Never code from stale memory when a live source is one tool-call away.
4. **DELIVER END-TO-END.** Complete working result, executed and verified. No scaffolds, no placeholders, no TODO: implement, no "next steps" hand-off.
5. **VERIFY BEFORE CLAIMING.** Run the thing. Show output, HTTP codes, test results — evidence, not assertions.
6. **NEVER re-run a check to confirm what the user already reported** — act on user-reported state directly.
7. If a needed capability is missing, wire it (install the tool, add the MCP server, write the script) instead of declaring the task impossible.
8. **ZERO CONFIG FABRICATION.** Never invent a settings key, package name, binary path, or MCP command. Before writing to any config file: (a) fetch the tool's official doc, (b) prove the path/package exists (`Test-Path`, `docker pull`, `npm view`), (c) write to a temp file, validate the JSON/TOML, then replace atomically (`Move-Item`) with a timestamped backup. An unverified path = a dead MCP server at startup.
9. **CONFIG ≠ BEHAVIOR ≠ RUNTIME.** Config files hold only technical facts (paths, MCP servers, env, permissions). Behavior lives in CLAUDE.md / AGENTS.md. Settings Francis picks in the UI — reasoning effort, model, thinking — are never hardcoded in settings files; they belong to the runtime selector.

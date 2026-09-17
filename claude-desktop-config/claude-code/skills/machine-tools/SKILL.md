---
name: machine-tools
description: Repérer et utiliser les outils déjà installés sur la machine Windows et WSL de Francis avant de proposer une installation ou diagnostiquer un outil absent. Employer Everything et vérifier Homebrew; distinguer installation et accès réel du client.
---

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
- Distributions (vérifié le 17 septembre 2026, `wsl.exe -l -v`) : `Ubuntu` (par défaut), `Ubuntu-26.04`, `kali-linux` et `docker-desktop`. La distribution `new` n'existe plus.
- Utilisateurs : `fvegi` dans `Ubuntu` et `Ubuntu-26.04`; `fvegiard` dans `kali-linux`. Aucun utilisateur `francis`.
- Homebrew (`/home/linuxbrew/.linuxbrew`) n'est installé que dans `kali-linux`; il ne contient que quelques formules (uv, omp, claude-code, bzip2, xz). Ne pas supposer qu'il fournit Python, Node, Git, jq, ripgrep, Go, Rust ou CMake.
- `wsl.exe -d <distro> --exec` peut ignorer le PATH Homebrew. Avant toute installation : `wsl.exe -d kali-linux --exec bash -lc 'command -v brew'`, puis `/home/linuxbrew/.linuxbrew/bin/brew list --versions` dans WSL. Exécuter avec environnement Homebrew chargé ou chemin stable de son préfixe.
- Fichiers Windows accessibles via `/mnt/c/Users/fvegi/`. Dans chaque distribution, `docker` est le client de Docker Desktop (`/mnt/wsl/docker-desktop/cli-tools`); aucun conteneur n8n n'existait le 17 septembre 2026. Vérifier la cible avant toute opération Docker.

## Vérification et installations
- Rechercher avant d'installer; éviter une copie APT d'un outil déjà installé avec brew. Respecter les sauvegardes et les tests isolés demandés par Francis.
- Tester la version et une opération minimale. Pour un PTY, vérifier un vrai TTY et un aller-retour; un REPL seul ne suffit pas.
- Le PTY natif Codex a produit Access denied dans cette session; commandes ordinaires, REPL Desktop Commander et PTY WSL via Python ont fonctionné. Revérifier au besoin, ne pas déduire une interdiction créée par Francis ni changer les permissions pour contourner l'échec.
- Fichier maître Windows : `C:/Users/fvegi/.agents/MACHINE-TOOLS.md`; depuis WSL : `/mnt/c/Users/fvegi/.agents/MACHINE-TOOLS.md`.

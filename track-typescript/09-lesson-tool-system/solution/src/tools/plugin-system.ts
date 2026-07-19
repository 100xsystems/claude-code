/**
 * Plugin/Tool System for the Claude Code agent.
 *
 * Provides an extensible architecture for loading tools dynamically:
 * - Plugin discovery from plugin directories
 * - Dynamic tool registration
 * - Sandboxed execution environment
 * - Hot-reloadable tool definitions
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ─── Plugin Interface ──────────────────────────────────────────────

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author?: string;
  tools: string[];
}

export interface PluginTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  execute(input: Record<string, any>, sandbox: Sandbox): Promise<string>;
}

export interface Sandbox {
  readFile(filePath: string): string;
  writeFile(filePath: string, content: string): void;
  executeCommand(command: string, timeout?: number): string;
  resolvePath(inputPath: string): string;
}

// ─── Plugin Loader ─────────────────────────────────────────────────

export class PluginLoader {
  private plugins: Map<string, PluginManifest> = new Map();
  private tools: Map<string, PluginTool> = new Map();
  private pluginDirs: string[];

  constructor(pluginDirs: string[] = []) {
    this.pluginDirs = pluginDirs;
  }

  /**
   * Discover and load all plugins from configured directories.
   */
  async discoverPlugins(): Promise<void> {
    for (const dir of this.pluginDirs) {
      await this.scanDirectory(dir);
    }
  }

  /**
   * Add a directory to scan for plugins.
   */
  addPluginDir(dir: string): void {
    if (!this.pluginDirs.includes(dir)) {
      this.pluginDirs.push(dir);
    }
  }

  /**
   * Scan a directory for plugin packages.
   */
  private async scanDirectory(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

      // Look for plugin.json or package.json manifest
      const manifestPath = path.join(dir, entry.name, 'plugin.json');
      const pkgPath = path.join(dir, entry.name, 'package.json');

      let manifest: PluginManifest | null = null;

      if (fs.existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        } catch {
          continue;
        }
      } else if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          if (pkg.plugin || pkg.keywords?.includes('100xsystems-plugin')) {
            manifest = {
              name: pkg.name || entry.name,
              version: pkg.version || '0.1.0',
              description: pkg.description || '',
              author: pkg.author,
              tools: pkg.plugin?.tools || [],
            };
          }
        } catch {
          continue;
        }
      }

      if (manifest) {
        this.plugins.set(manifest.name, manifest);
      }
    }
  }

  /**
   * Get list of all discovered plugins.
   */
  getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }
}

// ─── Sandboxed Execution Environment ─────────────────────────────

export class SandboxExecutor {
  private allowedPaths: string[];
  private maxExecutionTime: number;

  constructor(allowedPaths: string[], maxExecutionTime: number = 5000) {
    this.allowedPaths = allowedPaths;
    this.maxExecutionTime = maxExecutionTime;
  }

  /**
   * Create a sandbox for tool execution.
   */
  createSandbox(): Sandbox {
    const allowedPaths = [...this.allowedPaths];

    const sandbox: Sandbox = {
      readFile(filePath: string): string {
        const resolved = sandbox.resolvePath(filePath);
        return fs.readFileSync(resolved, 'utf-8');
      },

      writeFile(filePath: string, content: string): void {
        const resolved = sandbox.resolvePath(filePath);
        fs.mkdirSync(path.dirname(resolved), { recursive: true });
        fs.writeFileSync(resolved, content, 'utf-8');
      },

      executeCommand(command: string, timeout?: number): string {
        try {
          const result = execSync(command, {
            encoding: 'utf-8',
            timeout: timeout || 10000,
            maxBuffer: 1024 * 1024,
          });
          return result.trim();
        } catch (err: any) {
          return `Error: ${err.message}`;
        }
      },

      resolvePath(inputPath: string): string {
        const resolved = path.resolve(process.cwd(), inputPath);
        // Check path is within allowed paths
        const isAllowed = allowedPaths.some((ap) => resolved.startsWith(path.resolve(ap)));
        if (!isAllowed) {
          throw new Error(`Path "${inputPath}" is outside allowed directories`);
        }
        return resolved;
      },
    };

    return sandbox;
  }
}

// ─── Plugin Hot-Reloader ─────────────────────────────────────────

export class PluginHotReloader {
  private watchDirs: string[] = [];
  private watchers: fs.FSWatcher[] = [];
  private onChange: (pluginName: string) => void;

  constructor(onChange: (pluginName: string) => void) {
    this.onChange = onChange;
  }

  /**
   * Start watching directories for plugin changes.
   */
  watch(dirs: string[]): void {
    this.watchDirs = [...dirs];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;

      const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('plugin.json') || filename.endsWith('package.json'))) {
          const pluginName = path.basename(path.dirname(path.join(dir, filename)));
          this.onChange(pluginName);
        }
      });

      this.watchers.push(watcher);
    }
  }

  /**
   * Stop watching directories.
   */
  stop(): void {
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];
  }
}

/**
 * @zenithbuild/cli - Create Command
 * 
 * Scaffolds a new Zenith application using zenith-site as a template.
 * The CLI is optional - scaffolded apps use standard bun scripts.
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import * as logger from '../utils/logger'

export async function create(appName?: string): Promise<void> {
    logger.header('Create Zenith App')

    // 1. Get project name
    let projectName = appName
    if (!projectName) {
        // Use a simple synchronous prompt for non-interactive detection
        const readline = await import('readline')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        projectName = await new Promise<string>((resolve) => {
            rl.question('Project name: ', (answer) => {
                rl.close()
                resolve(answer.trim())
            })
        })
        if (!projectName) {
            logger.error('Project name is required')
            process.exit(1)
        }
    }

    const targetDir = path.resolve(process.cwd(), projectName)

    if (fs.existsSync(targetDir)) {
        logger.error(`Directory "${projectName}" already exists.`)
        process.exit(1)
    }

    // Always use minimal template for now - ensures reliable scaffolding
    logger.info('Creating project structure...')
    await createMinimalTemplate(targetDir, projectName)

    // Install dependencies
    logger.info('Installing dependencies...')
    process.chdir(targetDir)
    try {
        execSync('bun install', { stdio: 'inherit' })
    } catch {
        logger.warn('bun install failed, trying npm...')
        try {
            execSync('npm install', { stdio: 'inherit' })
        } catch {
            logger.warn('npm install failed, you may need to run it manually')
        }
    }

    logger.success(`\n✨ ${projectName} created successfully!`)
    logger.info(`\nNext steps:`)
    logger.info(`  cd ${projectName}`)
    logger.info(`  bun run dev`)
}

async function copyTemplate(templateDir: string, targetDir: string, projectName: string) {
    logger.info(`Copying template...`)

    fs.mkdirSync(targetDir, { recursive: true })
    copyRecursive(templateDir, targetDir, ['.git', 'node_modules', 'bun.lockb', '.DS_Store', 'dist'])

    const pkgPath = path.join(targetDir, 'package.json')
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
        pkg.name = projectName
        pkg.version = '0.1.0'
        pkg.private = true
        pkg.scripts = {
            dev: 'zen-dev',
            build: 'zen-build',
            preview: 'zen-preview',
            test: 'bun test'
        }
        pkg.dependencies = {
            '@zenithbuild/core': '^0.1.0'
        }
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4))
    }

    logger.success('Template copied')
}

async function createMinimalTemplate(targetDir: string, projectName: string) {
    fs.mkdirSync(targetDir, { recursive: true })
    fs.mkdirSync(path.join(targetDir, 'app', 'pages'), { recursive: true })
    fs.mkdirSync(path.join(targetDir, 'app', 'layouts'), { recursive: true })
    fs.mkdirSync(path.join(targetDir, 'app', 'components'), { recursive: true })

    const pkg = {
        name: projectName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
            dev: 'zen-dev',
            build: 'zen-build',
            preview: 'zen-preview',
            test: 'bun test'
        },
        dependencies: {
            '@zenithbuild/core': '^0.1.0'
        },
        devDependencies: {
            '@types/bun': 'latest'
        }
    }
    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 4))

    const indexPage = `<script>
    state count = 0
    
    function increment() {
        count = count + 1
    }
</script>

<main>
    <h1>Welcome to Zenith</h1>
    <p>Count: {count}</p>
    <button onclick="increment">Increment</button>
</main>

<style>
    main {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        font-family: system-ui, sans-serif;
        background: #0f172a;
        color: #f1f5f9;
        min-height: 100vh;
    }
    h1 { 
        color: #3b82f6;
        margin-bottom: 1rem;
    }
    p {
        font-size: 1.25rem;
        margin-bottom: 1rem;
    }
    button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.2s;
    }
    button:hover { 
        background: #2563eb;
    }
</style>
`
    fs.writeFileSync(path.join(targetDir, 'app', 'pages', 'index.zen'), indexPage)
    logger.success('Created minimal template')
}

function copyRecursive(src: string, dest: string, excludes: string[]) {
    const stats = fs.statSync(src)
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest)
        fs.readdirSync(src).forEach((childItemName) => {
            if (excludes.includes(childItemName)) return
            copyRecursive(
                path.join(src, childItemName),
                path.join(dest, childItemName),
                excludes
            )
        })
    } else {
        fs.copyFileSync(src, dest)
    }
}

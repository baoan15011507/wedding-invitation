/**
 * Deprecated entry — dùng bản Python (streetlevel) để chọn đúng imageDate.
 * Chạy: npm run route:build:co-dau
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const py = path.join(__dirname, 'build-street-route-co-dau.py')
const r = spawnSync('python', [py], { stdio: 'inherit', shell: true })
process.exit(r.status ?? 1)

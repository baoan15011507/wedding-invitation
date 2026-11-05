import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const docs = join(root, 'docs')

rmSync(docs, { recursive: true, force: true })
cpSync(dist, docs, { recursive: true })
writeFileSync(join(docs, '.nojekyll'), '')

// SPA trên GitHub Pages: copy index vào từng path + 404 fallback
const html = readFileSync(join(docs, 'index.html'), 'utf8')
writeFileSync(join(docs, '404.html'), html)

for (const path of ['chu-re', 'co-dau']) {
  const dir = join(docs, path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
}

console.log('docs ready: /, /chu-re/, /co-dau/, 404.html')

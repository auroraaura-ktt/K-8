import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(configDir, '..', '..')
const envPath = existsSync(resolve(projectRoot, '.env'))
  ? resolve(projectRoot, '.env')
  : resolve(projectRoot, '.env.example')

loadEnv({ path: envPath })

export const env = {
  port: Number(process.env.PORT || 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  emailUser: process.env.EMAIL_USER || 'miitverse.verify@gmail.com',
  emailPass: process.env.EMAIL_PASS || 'mfbw mbxh furh qwjh',
  // Optional explicit SMTP settings. If provided, `emailHost`/`emailPort`/`emailSecure`
  // will be used to create an SMTP transporter instead of the simple `service` option.
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailHost: process.env.EMAIL_HOST || '',
  emailPort: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
  emailSecure: (process.env.EMAIL_SECURE || '').toLowerCase() === 'true',
  neo4jUri: process.env.NEO4J_URI || 'neo4j+s://1bdef416.databases.neo4j.io',
  neo4jUser: process.env.NEO4J_USER || '1bdef416',
  neo4jPassword: process.env.NEO4J_PASSWORD || 'FncPa8gGXHqc9gfCFIKnyxrOlyFJ1qamH82NyQf7zbc',
  skipDb: (process.env.SKIP_DB || 'false').toLowerCase() === 'true',
}
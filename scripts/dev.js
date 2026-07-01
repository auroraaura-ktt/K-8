import { spawn } from 'node:child_process'

function start(label, command) {
  const child = spawn(command, {
    stdio: 'inherit',
    shell: true,
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`)
      process.exit(code)
    }
  })

  return child
}

const client = start('client', 'npm run dev:client')
const server = start('server', 'npm run dev:server')

function shutdown() {
  client.kill()
  server.kill()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
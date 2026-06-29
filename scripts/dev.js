import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCommand = 'npm'

function start(label, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`)
      process.exit(code)
    }
  })

  return child
}

const client = start('client', npmCommand, ['run', 'dev:client'])
const server = start('server', npmCommand, ['run', 'dev:server'])

function shutdown() {
  client.kill()
  server.kill()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
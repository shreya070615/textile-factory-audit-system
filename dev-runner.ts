import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting Textile Factory Fullstack Suite (Frontend + Backend)...');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

// 1. Start Backend Express Server
const serverProc = spawn(npxCmd, ['tsx', 'server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '5000',
  },
});

// 2. Start Vite Frontend Client (Port 3000)
const clientProc = spawn(npxCmd, ['vite', '--port=3000', '--host=0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
  },
});

function cleanup() {
  console.log('\n🛑 Shutting down Fullstack Suite...');
  serverProc.kill();
  clientProc.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

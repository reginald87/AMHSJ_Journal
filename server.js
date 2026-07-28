const { spawn } = require('child_process');
const next = spawn('npx', ['next', 'start', '-p', process.env.PORT || 3000], {
  stdio: 'inherit',
  shell: true,
});
process.on('SIGTERM', () => next.kill());

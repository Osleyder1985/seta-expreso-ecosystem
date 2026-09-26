import { execFileSync } from 'node:child_process';

execFileSync('npm', ['run', 'openapi:generate'], { stdio: 'inherit' });
execFileSync('npm', ['run', 'openapi:validate'], { stdio: 'inherit' });

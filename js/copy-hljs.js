import fs from 'fs';
import path from 'path';
import { cpSync, mkdirSync } from 'fs';

const hlPath = './node_modules/@highlightjs/cdn-assets';
const destPath = './docs/js/vendor/highlight.js';

mkdirSync(destPath, { recursive: true });
cpSync(`${hlPath}`, `${destPath}`, { recursive: true });
import fs from 'fs';
import path from 'path';
import { cpSync, mkdirSync } from 'fs';

const threePath = './node_modules/three';
const destPath = './docs/js/vendor/three';

mkdirSync(destPath, { recursive: true });
cpSync(`${threePath}/build/three.module.min.js`, `${destPath}/three.module.min.js`);
cpSync(`${threePath}/build/three.core.min.js`, `${destPath}/three.core.min.js`);
cpSync(`${threePath}/examples/jsm`, `${destPath}/examples/jsm`, { recursive: true });
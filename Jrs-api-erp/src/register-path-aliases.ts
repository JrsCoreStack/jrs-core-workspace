/**
 * O build emite `require("src/...")` apontando para arquivos em `dist/...`.
 * Registra o alias antes de qualquer outro import (Nest watch e node dist/main).
 */
import * as path from 'path';
import { register } from 'tsconfig-paths';

register({
  baseUrl: path.resolve(__dirname, '..'),
  paths: {
    'src/*': ['dist/*'],
  },
});

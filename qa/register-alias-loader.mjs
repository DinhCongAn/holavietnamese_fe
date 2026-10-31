import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./qa/alias-loader.mjs', pathToFileURL('./'));

// This will be converted to a CJS-style "require" import thanks to preset-env.
// Before that, though, the plugin will transform the import specifier. It will
// then be transformed a second time thanks to the preset. We must test for this
// to ensure this is able to be handled properly.
import { name as pkgName } from '../package.json';

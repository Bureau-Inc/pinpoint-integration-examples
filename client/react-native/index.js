/** @format */

import { AppRegistry } from 'react-native';
import App from './app/index';
import 'react-native-get-random-values';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
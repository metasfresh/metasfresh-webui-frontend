import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import appHandler from './appHandler';
import listHandler from './listHandler';
import menuHandler from './menuHandler';
import windowHandler from './windowHandler';
import pluginsHandler from './pluginsHandler';
import viewHandler from './viewHandler';

const viewReducer = combineReducers({ master: viewHandler });

export default {
  appHandler,
  listHandler,
  menuHandler,
  windowHandler,
  viewHandler: viewReducer,
  pluginsHandler,
  routing,
};

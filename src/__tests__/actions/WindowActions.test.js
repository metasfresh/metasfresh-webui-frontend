import thunk from 'redux-thunk'
import nock from 'nock';
import configureStore from 'redux-mock-store';
import { Set } from 'immutable';

import {
  updateTabRowsData,
  initDataSuccess,
  initLayoutSuccess,
  fetchTopActions,
  createWindow,
  initWindow,
} from '../../actions/WindowActions';
import * as ACTION_TYPES from '../../constants/ActionTypes';

import masterWindowProps from '../../../test_setup/fixtures/master_window.json';
import dataFixtures from '../../../test_setup/fixtures/master_window/data.json';
import layoutFixtures from '../../../test_setup/fixtures/master_window/layout.json';

describe('WindowActions synchronous', () => {
  it('should return a UPDATE_TAB_ROWS_DATA action with correct payload', () => {
    const payload = { 'AD_Tab-1': { changed: { id: 1 } }};
    const action = updateTabRowsData('master', 'AD_Tab-1', payload);

    expect(action.type).toEqual(ACTION_TYPES.UPDATE_TAB_ROWS_DATA)
    expect(action.payload).toHaveProperty('data.AD_Tab-1');
    expect(action.payload).toMatchSnapshot();
  });
});

describe('WindowActions thunks', () => {
  const propsData = masterWindowProps.data1;
  const middlewares = [thunk];
  const mockStore = configureStore(middlewares);

  describe('init', () => {
    afterEach(() => {
      nock.restore();
    });

    it(`dispatches 'initWindow' and 'initDataSuccess' action creators`, () => {
      const store = mockStore();
      const { params: { windowType, docId } } = propsData;
      const dataResp = {
        data: {},
        docId: undefined,
        includedTabsInfo: undefined,
        scope: 'master',
        saveStatus: undefined,
        standardActions: undefined,
        validStatus: undefined,
        websocket: undefined,
      }

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/`)
        .reply(200, [{ fieldsByName: {} }]);

      const expectedActions = [
        { type: ACTION_TYPES.INIT_WINDOW },
        { type: ACTION_TYPES.INIT_DATA_SUCCESS, ...dataResp }
      ]

      return store.dispatch(createWindow(windowType, docId, undefined, undefined, false)).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      });
    });

    it(`'initDataSuccess'`, () => {
      const store = mockStore();
      const { params: { windowType, docId } } = propsData;
      const notFoundResp = {
        data: {},
        docId: 'notfound',
        includedTabsInfo: {},
        scope: 'master',
        saveStatus: { saved: true },
        standardActions: Set(),
        validStatus: {},
      }

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/`)
        .reply(404);

      const expectedActions = [
        { type: ACTION_TYPES.INIT_WINDOW },
        { type: ACTION_TYPES.INIT_DATA_SUCCESS, ...notFoundResp }
      ]

      return store.dispatch(createWindow(windowType, docId, undefined, undefined, false)).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      });
    });

    // @TODO: tests for NEW windows, NEW rows
  });
})


import thunk from 'redux-thunk'
import nock from 'nock';
import configureStore from 'redux-mock-store';

import {
  updateTabRowsData,
  initDataSuccess,
  initLayoutSuccess,
  fetchTopActions,
  createWindow,
  initWindow,
} from '../../actions/WindowActions';
import * as ACTION_TYPES from '../../constants/ActionTypes';

import fixtures from "../../../test_setup/fixtures/master_window.json";

describe('WindowActions synchronous', () => {
  it('should return a UPDATE_TAB_ROWS_DATA action with correct payload', () => {
    const payload = { 'AD_Tab-1': { changed: { id: 1 }, removed: {} }};
    const action = updateTabRowsData('master', 'AD_Tab-1', payload);

    expect(action.type).toEqual(ACTION_TYPES.UPDATE_TAB_ROWS_DATA)
    expect(action.payload).toHaveProperty('data.AD_Tab-1');
    expect(action.payload).toMatchSnapshot();
  });
});

describe.skip('WindowActions thunks', () => {
  const fixturesData = fixtures.data1;
  const middlewares = [thunk];
  const mockStore = configureStore(middlewares);

  describe('init', () => {
    afterEach(() => {
      fetchMock.restore()
    });

    it(`dispatches 'initWindow' and 'initDataSuccess' action creators`, () => {
      const store = mockStore();
      const { windowType, docId } = fixturesData;

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`rest/api/window/${windowType}/${docId}`)
        .reply(200, { data: { windowId: windowType } });

      const expectedActions = [
        { type: ACTION_TYPES.INIT_WINDOW },
        { type: ACTION_TYPES.INIT_DATA_SUCCESS, body: { windowId: windowType } }
      ]

      return store.dispatch(createWindow(windowType, docId, undefined, undefined, false)).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      });
    });
  });
})
import React from "react";
import * as Immutable from "immutable";
import { mount, shallow, render } from "enzyme";
import nock from 'nock';
import uuid from "uuid/v4";
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, compose, combineReducers } from 'redux';
import configureStore from 'redux-mock-store';
import { routerReducer as routing } from 'react-router-redux';
import { createMemoryHistory } from 'react-router';
import merge from 'merge';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import waitForExpect from 'wait-for-expect';
import http from 'http';
import StompServer from 'stomp-broker-js';

import { ShortcutProvider } from '../../components/keyshortcuts/ShortcutProvider';
import CustomRouter from '../../containers/CustomRouter';

import pluginsHandler, { initialState as pluginsHandlerState } from '../../reducers/pluginsHandler';
import appHandler, { initialState as appHandlerState } from '../../reducers/appHandler';
import windowHandler, { initialState as windowHandlerState } from '../../reducers/windowHandler';
import menuHandler, { initialState as menuHandlerState } from '../../reducers/menuHandler';
import listHandler, { initialState as listHandlerState } from '../../reducers/listHandler';

import fixtures from "../../../test_setup/fixtures/master_window.json";
import dataFixtures from '../../../test_setup/fixtures/master_window/data.json';
import layoutFixtures from '../../../test_setup/fixtures/master_window/layout.json';
import rowFixtures from '../../../test_setup/fixtures/master_window/row_data.json';
import docActionFixtures from '../../../test_setup/fixtures/master_window/doc_action.json';
import userSessionData from '../../../test_setup/fixtures/user_session.json';
import notificationsData from '../../../test_setup/fixtures/notifications.json';

import MasterWindow from "../../containers/MasterWindow";

const mockStore = configureStore(middleware);
const middleware = [thunk, promiseMiddleware];
const FIXTURES_PROPS = fixtures.props1;
const history = createMemoryHistory('/window/143/1000000');

localStorage.setItem('isLogged', true)

const createInitialProps = function(additionalProps = {}) {
  return {
    ...FIXTURES_PROPS,
    ...additionalProps,
  };
};

const rootReducer = combineReducers({
  appHandler,
  listHandler,
  menuHandler,
  windowHandler,
  pluginsHandler,
  routing,
});

const createInitialState = function(state = {}) {
  const res = merge.recursive(
    true,
    {
      appHandler: { ...appHandlerState },
      windowHandler: { ...windowHandlerState },
      listHandler: { ...listHandlerState },
      menuHandler: { ...menuHandlerState },
      pluginsHandler: { ...pluginsHandlerState },
      routing: { ...fixtures.state1.routing },
    },
    state
  );

  return res;
}

describe("MasterWindowContainer", () => {
  describe("'integration' tests:", () => {
    let mockServer;
    let server;
    
    beforeAll(() => {
      server = http.createServer();

      mockServer = new StompServer({
        server: server,
        // debug: console.log,
        path: '/ws',
        heartbeat: [2000,2000]
      });

      server.listen(8080);
       
      mockServer.subscribe("/**", function(msg, headers) {
        var topic = headers.destination;
        // console.log(topic, "->", msg);
      });
      // mockServer.subscribe("/**", (msg, headers) => {
      //     var topic = headers.destination;
      //     console.log(`topic:${topic} messageType: ${typeof msg}`, msg, headers);
      //     mockServer.send('/echo', headers, `Hello from server! ${msg}`);
      // });
    });

    afterAll(() => {
      server.close();
    });

    it("renders without errors", async done => {
      const initialState = createInitialState();
      const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(...middleware),
      );
      const initialProps = createInitialProps();
      const windowType = FIXTURES_PROPS.params.windowType;
      const docId = FIXTURES_PROPS.params.docId;
      const tabId = layoutFixtures.layout1.tabs[0].tabId;
      const auth = {
        initNotificationClient: jest.fn(),
        initSessionClient: jest.fn(),
      };

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/`)
        .reply(200, dataFixtures.data1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/layout`)
        .reply(200, layoutFixtures.layout1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get('/userSession')
        .reply(200, userSessionData);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/notifications/websocketEndpoint`)
        .reply(200, `/notifications/${userSessionData.userProfileId}`);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get('/notifications/all?limit=20')
        .reply(200, notificationsData.data1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/${tabId}/`)
        .reply(200, rowFixtures.row_data1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/${tabId}/?orderBy=+Line`)
        .reply(200, rowFixtures.row_data1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/field/DocAction/dropdown`)
        .reply(200, docActionFixtures.data1);

      const wrapper = mount(
        <Provider store={store}>
          <ShortcutProvider hotkeys={{}} keymap={{}} >
            <CustomRouter history={history} auth={auth}>
              <MasterWindow {...initialProps} />
            </CustomRouter>
          </ShortcutProvider>
        </Provider>
      );

      await waitForExpect(() => {
        wrapper.update();

        const html = wrapper.html();
        setTimeout(() => {
          expect(html).toContain('<table');
        }, 1000);

        done();
      }, 8000);
    }, 10000);

    it("renders without errors", async done => {
      const initialState = createInitialState();
      const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(...middleware),
      );
      const initialProps = createInitialProps();
      const windowType = FIXTURES_PROPS.params.windowType;
      const docId = FIXTURES_PROPS.params.docId;
      const tabId = layoutFixtures.layout1.tabs[0].tabId;
      const auth = {
        initNotificationClient: jest.fn(),
        initSessionClient: jest.fn(),
      };

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/`)
        .reply(200, dataFixtures.data1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/layout`)
        .reply(200, layoutFixtures.layout1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get('/userSession')
        .reply(200, userSessionData);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/notifications/websocketEndpoint`)
        .reply(200, `/notifications/${userSessionData.userProfileId}`);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get('/notifications/all?limit=20')
        .reply(200, notificationsData.data1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/${tabId}/`)
        .reply(200, rowFixtures.row_data1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/${tabId}/?orderBy=+Line`)
        .reply(200, rowFixtures.row_data1);

      nock(config.API_URL)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/window/${windowType}/${docId}/field/DocAction/dropdown`)
        .reply(200, docActionFixtures.data1);

      const wrapper = mount(
        <Provider store={store}>
          <ShortcutProvider hotkeys={{}} keymap={{}} >
            <CustomRouter history={history} auth={auth}>
              <MasterWindow {...initialProps} />
            </CustomRouter>
          </ShortcutProvider>
        </Provider>
      );

  //   await waitForExpect(() => {
  //     wrapper.update();
  //     // wrapper.update();
  //     // console.log('CLIENTS11: ', mockServer.clients()); // array of all connected clients
  //     // mockServer.emit('/document/143/1000000', 'message');
  //     // mockServer.clients();
  //     // console.log('CLIENTS: ', mockServer.clients()); // array of all connected clients
  //     // mockServer.emit('/document/143/1000000', 'message');
  //     //   // setTimeout(() => {
  //     //   const html = wrapper.html();
  //     //   expect(html).toContain('<table');
  //     // // }, 500);
  //     const html = wrapper.html();
  //     setTimeout(() => {
  //       const msg = "{\"windowId\":\"143\",\"id\":\"1001637\",\"timestamp\":\"2020-03-18T18:43:40.544+01:00\",\"stale\":true,\"includedTabsInfo\":{\"AD_Tab-187\":{\"tabid\":\"AD_Tab-187\",\"stale\":true,\"staleRowIds\":[\"1002511\"]}}}";
  //       mockServer.send('/document/143/1000000', {"foo": "bar"}, msg);
  //       // expect(html).toContain('<table');
  //       // console.log('BLA: ', store.getState().windowHandler.master.websocket)
  //       expect(store.getState().windowHandler.master.websocket).toBeTruthy();
  //       done();
  //     }, 5000);
  //   }, 8000);
  // }, 10000);

      await waitForExpect(() => {
        wrapper.update();

        expect(store.getState().windowHandler.master.websocket).toBeTruthy();
        const msg = "{\"windowId\":\"143\",\"id\":\"1001637\",\"timestamp\":\"2020-03-18T18:43:40.544+01:00\",\"stale\":true,\"includedTabsInfo\":{\"AD_Tab-187\":{\"tabid\":\"AD_Tab-187\",\"stale\":true,\"staleRowIds\":[\"1002511\"]}}}";
        mockServer.send('/document/143/1000000', {}, msg);

        const html = wrapper.html();
        setTimeout(() => {
          expect(html).toContain('<table');
        }, 1000);

        done();
      }, 8000);
    }, 10000);
});



});

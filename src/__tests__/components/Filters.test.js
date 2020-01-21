import React from "react";
import * as Immutable from "immutable";
import { mount, shallow, render } from "enzyme";
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import merge from 'merge';

import { ShortcutProvider } from '../../components/keyshortcuts/ShortcutProvider';
import { initialState as appHandlerState } from '../../reducers/appHandler';
import { initialState as windowHandlerState } from '../../reducers/windowHandler';
import { filtersToMap } from '../../utils/documentListHelper';

import Filters from "../../components/filters/Filters";
import filtersFixtures from "../../../test_setup/fixtures/filters.json";

const mockStore = configureStore([]);

const createStore = function(state = {}) {
  const res = merge.recursive(
    true,
    {
      appHandler: { ...appHandlerState, me: { timeZone: 'America/Los_Angeles'} },
      windowHandler: { ...windowHandlerState }
    },
    state
  );

  return res;
}

const createInitialProps = function(basicFixtures = filtersFixtures.data1, additionalProps = {}) {
  const filterData = additionalProps.filterData
    ? additionalProps.filterData
    : basicFixtures.filterData;
  const filtersActive = additionalProps.filtersActive
    ? additionalProps.filtersActive
    : basicFixtures.filtersActive;
  const initialValuesNulled = additionalProps.initialValuesNulled
    ? additionalProps.initialValuesNulled
    : basicFixtures.initialValuesNulled;

  return {
    ...basicFixtures,
    ...additionalProps,
    resetInitialValues: jest.fn(),
    updateDocList: jest.fn(),
    filterData: filtersToMap(filterData),
    filtersActive: filtersToMap(filtersActive),
    initialValuesNulled: Immutable.Map(initialValuesNulled),
  };
};

describe("Filters tests", () => {
  it("renders without errors", () => {
    const dummyProps = createInitialProps();
    const initialState = createStore({ 
      windowHandler: {
        allowShortcut: true,
        modal: {
          visible: false,
        },
      }
    });
    const store = mockStore(initialState)
    const wrapper = shallow(
        <Provider store={store}>
          <Filters {...dummyProps} />
        </Provider>
    );
    const html = wrapper.html();

    expect(html).toContain('filter-wrapper');
    expect(html).toContain('filters-frequent');
    expect(html).toContain('btn-filter');
    expect(html).toContain(': Date');
  });

  it("renders active filters caption", () => {
    const dummyProps = createInitialProps(undefined, { filtersActive: filtersFixtures.filtersActive1 });
    const initialState = createStore({ 
      windowHandler: {
        allowShortcut: true,
        modal: {
          visible: false,
        },
      }
    });
    const store = mockStore(initialState)
    const wrapper = mount(
        <Provider store={store}>
          <Filters {...dummyProps} />
        </Provider>
    );
    const html = wrapper.html();

    expect(html).toContain('filter-wrapper');
    expect(html).toContain('filters-not-frequent');
    expect(html).toContain('btn-filter');
    expect(html).toContain('Akontozahlung, Completed');
  });

  it("opens dropdown and filter details", () => {
    const dummyProps = createInitialProps();
    const initialState = createStore({
      windowHandler: {
        allowShortcut: true,
        modal: {
          visible: false,
        },
      }
    });
    const store = mockStore(initialState)
    const wrapper = mount(
      <ShortcutProvider hotkeys={{}} keymap={{}} >
        <Provider store={store}>
          <div className="document-lists-wrapper">
            <Filters {...dummyProps} />
          </div>
        </Provider>
      </ShortcutProvider>
    );
    wrapper.find('.filters-not-frequent .btn-filter').simulate('click')
    expect(wrapper.find('.filters-overlay').length).toBe(1);

    wrapper.find('.filter-option-default').simulate('click');
    expect(wrapper.find('.filter-widget .filter-default').length).toBe(1);
  });
});

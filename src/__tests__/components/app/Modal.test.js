import React from "react";
import * as Immutable from "immutable";
import { mount, shallow, render } from "enzyme";
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import merge from 'merge';
import { ShortcutProvider } from '../../../components/keyshortcuts/ShortcutProvider';

import Modal from "../../../components/app/Modal";
import fixtures from '../../../../test_setup/fixtures/modal.json';

const mockStore = configureStore([]);


const appHandlerState = {
  "notifications": {

  },
  "me": {

  },
  "isLogged": false,
  "enableTutorial": false,
  "processStatus": "saved",
  "inbox": {
    "notifications": [

    ],
    "unreadCount": 0
  },
  "keymap": {
    "OPEN_ACTIONS_MENU": "Alt+1",
    "OPEN_NAVIGATION_MENU": "Alt+2",
    "OPEN_INBOX_MENU": "Alt+3",
    "OPEN_AVATAR_MENU": "Alt+4",
    "OPEN_SIDEBAR_MENU_0": "Alt+5",
    "OPEN_SIDEBAR_MENU_1": "Alt+6",
    "OPEN_SIDEBAR_MENU_2": "Alt+7",
    "DOC_STATUS": "Alt+I",
    "TEXT_START": "Home",
    "TEXT_END": "End",
    "OPEN_ADVANCED_EDIT": "Alt+E",
    "CLONE_DOCUMENT": "Alt+W",
    "OPEN_PRINT_RAPORT": "Alt+P",
    "OPEN_EMAIL": "Alt+K",
    "OPEN_LETTER": "Alt+R",
    "DELETE_DOCUMENT": "Alt+D",
    "NEW_DOCUMENT": "Alt+N",
    "TOGGLE_EDIT_MODE": "Alt+O",
    "OPEN_SELECTED": "Alt+B",
    "REMOVE_SELECTED": "Alt+Y",
    "ADVANCED_EDIT": "Alt+E",
    "SELECT_ALL_LEAFS": "Alt+S",
    "EXPAND_INDENT": "+",
    "COLLAPSE_INDENT": "-",
    "TOGGLE_QUICK_INPUT": "Alt+Q",
    "TOGGLE_EXPAND": "Alt++",
    "NEXT_PAGE": "PageDown",
    "PREV_PAGE": "PageUp",
    "FIRST_PAGE": "Home",
    "LAST_PAGE": "End",
    "SELECT_ALL_ROWS": "Alt+A",
    "QUICK_ACTION_POS": "Alt+U",
    "QUICK_ACTION_TOGGLE": "Alt+L",
    "COMPLETE_STATUS": "Alt+U",
    "DONE": "Alt+Enter",
    "CANCEL": "Escape"
  },
  "hotkeys": {
    "ALT+1": [

    ],
    "ALT+2": [

    ],
    "ALT+3": [

    ],
    "ALT+4": [

    ],
    "ALT+5": [

    ],
    "ALT+6": [

    ],
    "ALT+7": [

    ],
    "ALT+I": [

    ],
    "HOME": [

    ],
    "END": [

    ],
    "ALT+E": [

    ],
    "ALT+W": [

    ],
    "ALT+P": [

    ],
    "ALT+K": [

    ],
    "ALT+R": [

    ],
    "ALT+D": [

    ],
    "ALT+N": [

    ],
    "ALT+O": [

    ],
    "ALT+B": [

    ],
    "ALT+Y": [

    ],
    "ALT+S": [

    ],
    "+": [

    ],
    "-": [

    ],
    "ALT+Q": [

    ],
    "ALT++": [

    ],
    "PAGEDOWN": [

    ],
    "PAGEUP": [

    ],
    "ALT+A": [

    ],
    "ALT+U": [

    ],
    "ALT+L": [

    ],
    "ALT+ENTER": [

    ],
    "ESCAPE": [

    ]
  }
}
const testModal = {
  "visible": true,
  "type": "ADP_540763",
  "dataId": null,
  "tabId": null,
  "rowId": null,
  "viewId": "540189-D8",
  "layout": {
    "layoutType": "panel",
    "caption": "Transform",
    "description": "",
    "elements": [
      {
        "caption": "Action",
        "description": "Zeigt die durchzuführende Aktion an",
        "widgetType": "List",
        "fields": [
          {
            "field": "Action",
            "caption": "",
            "emptyText": "none",
            "source": "list",
            "lookupSearchStringMinLength": -1,
            "lookupSearchStartDelayMillis": 500
          }
        ]
      },
      {
        "caption": "Packing Instruction",
        "description": "",
        "widgetType": "List",
        "fields": [
          {
            "field": "M_HU_PI_Item_Product_ID",
            "caption": "",
            "emptyText": "none",
            "source": "list",
            "lookupSearchStringMinLength": -1,
            "lookupSearchStartDelayMillis": 500,
            "supportZoomInto": true
          }
        ]
      },
      {
        "caption": "Packvorschrift Position",
        "description": "",
        "widgetType": "List",
        "fields": [
          {
            "field": "M_HU_PI_Item_ID",
            "caption": "",
            "emptyText": "none",
            "source": "list",
            "lookupSearchStringMinLength": -1,
            "lookupSearchStartDelayMillis": 500,
            "supportZoomInto": true
          }
        ]
      },
      {
        "caption": "LU",
        "description": "Loading Unit",
        "widgetType": "Lookup",
        "fields": [
          {
            "field": "M_LU_HU_ID",
            "caption": "",
            "emptyText": "none",
            "source": "lookup",
            "lookupSearchStringMinLength": -1,
            "lookupSearchStartDelayMillis": 500,
            "supportZoomInto": true
          }
        ]
      },
      {
        "caption": "TU",
        "description": "Trading Unit",
        "widgetType": "Lookup",
        "fields": [
          {
            "field": "M_TU_HU_ID",
            "caption": "",
            "emptyText": "none",
            "source": "lookup",
            "lookupSearchStringMinLength": -1,
            "lookupSearchStartDelayMillis": 500,
            "supportZoomInto": true
          }
        ]
      },
      {
        "caption": "Qty CU per TU",
        "description": "Number of CUs per package (usually TU)",
        "widgetType": "Quantity",
        "fields": [
          {
            "field": "QtyCU",
            "caption": "",
            "emptyText": "none"
          }
        ]
      },
      {
        "caption": "Number of TUs",
        "description": "",
        "widgetType": "Integer",
        "fields": [
          {
            "field": "QtyTU",
            "caption": "",
            "emptyText": "none"
          }
        ]
      },
      {
        "caption": "eigene Gebinde",
        "description": "If true, then the packing material's owner is \"us\" (the guys who ordered it). If false, then the packing material's owner is the PO's partner.",
        "widgetType": "YesNo",
        "fields": [
          {
            "field": "HUPlanningReceiptOwnerPM_LU",
            "caption": "",
            "emptyText": "none"
          }
        ]
      },
      {
        "caption": "Eigene TU",
        "description": "If true, then the packing material's owner is \"us\" (the guys who ordered it). If false, then the packing material's owner is the PO's partner.",
        "widgetType": "YesNo",
        "fields": [
          {
            "field": "HUPlanningReceiptOwnerPM_TU",
            "caption": "",
            "emptyText": "none"
          }
        ]
      }
    ],
    "pinstanceId": "3396778",
  }
};

const windowHandlerState = {
  "connectionError": false,
  "modal": testModal,
  "overlay": {
    "visible": true,
    "data": null
  },
  "rawModal": {
    "visible": false,
    "windowType": null,
    "viewId": null
  },
  "pluginModal": {
    "visible": false,
    "type": "",
    "id": null
  },
  "master": {
    "layout": {
      "activeTab": null
    },
    "data": [

    ],
    "rowData": {

    },
    "saveStatus": {

    },
    "validStatus": {

    },
    "includedTabsInfo": {

    },
    "websocket": null,
    "topActions": {
      "actions": [

      ],
      "fetching": false,
      "error": false
    }
  },
  "quickActions": {

  },
  "indicator": "saved",
  "allowShortcut": true,
  "allowOutsideClick": true,
  "latestNewDocument": null,
  "viewId": null,
  "selections": {

  },
  "selectionsHash": null,
  "patches": {
    "requests": {
      "length": 0
    },
    "success": true
  },
  "filter": {

  },
  "spinner": null
}

describe("Modal test", () => {
  it("renders without errors", () => {
    const dummyProps = fixtures;
    const initialState = function (state = {}) {
      const res = merge.recursive(
        true,
        {
          appHandler: { ...appHandlerState },
          windowHandler: { ...windowHandlerState }
        },
        state
      );

      return res;
    };
    const store = mockStore(initialState)
    const wrapper = render(
      <Provider store={store}>
        <ShortcutProvider hotkeys={{}} keymap={{}} >
          <Modal {...dummyProps} />
        </ShortcutProvider>
      </Provider>
    );

    const html = wrapper.html();
    expect(html).not.toBe(null);
    expect(html.includes('Action')).toBe(true);
    
  });
});

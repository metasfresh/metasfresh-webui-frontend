import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import MasterWidget from './widget/MasterWidget';
import Loader from './app/Loader';

/**
 * @file Class based component.
 * @module Process
 * @extends Component
 */
class Process extends PureComponent {
  /**
   * @method getWidgetData
   * @summary create data array displayed by the process's widgets
   */
  getWidgetData = (item) => {
    const { data } = this.props;
    const widgetData = item.fields.map(f => data[f.field] || -1);

    if (widgetData.length) {
      return widgetData;
    }

    return [{}];
  };

  /**
   * @method renderElements
   * @summary ToDo: Describe the method
   * @param {*} layout
   * @param {*} data
   * @param {*} type
   * @todo Write the documentation
   */
  renderElements = (layout, data, type) => {
    const { disabled } = this.props;
    const elements = layout.elements;
    return elements.map((elem, id) => {
      return (
        <div key={`${id}-${layout.pinstanceId}`}>
          <MasterWidget
            entity="process"
            key={'element' + id}
            windowType={type}
            dataId={layout.pinstanceId}
            getWidgetData={this.getWidgetData}
            isModal={true}
            disabled={disabled}
            autoFocus={id === 0}
            {...elem}
            item={elem}
          />
        </div>
      );
    });
  };

  render() {
    const { data, layout, type, disabled } = this.props;
    return (
      <div key="window" className="window-wrapper process-wrapper">
        {disabled && <Loader loaderType="bootstrap" />}
        {!disabled &&
          layout &&
          layout.elements &&
          this.renderElements(layout, data, type)}
      </div>
    );
  }
}

/**
 * @typedef {object} Props Component props
 * @prop {bool} [disabled]
 * @prop {*} data
 * @prop {*} layout
 * @prop {*} type
 * @todo Check title, buttons. Which proptype? Required or optional?
 */
Process.propTypes = {
  disabled: PropTypes.bool,
  data: PropTypes.any,
  layout: PropTypes.any,
  type: PropTypes.any,
};

export default Process;

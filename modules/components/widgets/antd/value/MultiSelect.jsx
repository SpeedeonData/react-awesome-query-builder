import React, { PureComponent, useRef } from "react";
import PropTypes from "prop-types";
import { Select } from "antd";
import {calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT} from "../../../../utils/domUtils";
import {mapListValues} from "../../../../utils/stuff";
import {useOnPropsChanged} from "../../../../utils/reactUtils";
import omit from "lodash/omit";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input } from 'reactstrap';
const Option = Select.Option;

export default class MultiSelectWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    value: PropTypes.array,
    field: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    customProps: PropTypes.object,
    fieldDefinition: PropTypes.object,
    readonly: PropTypes.bool,
    // from fieldSettings:
    listValues: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    allowCustomValues: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  componentDidMount() {
    console.log("The multiselect mounted")
    console.log("props", this.props)
  }

  componentDidUpdate() {
    console.log("The multiselect was updated")
    console.log("props", this.props)
  }

  onPropsChanged (props) {
    const {listValues} = props;

    let optionsMaxWidth = 0;
    mapListValues(listValues, ({title, value}) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, calcTextWidth(title, null));
    });
    this.optionsMaxWidth = optionsMaxWidth;

    this.options = mapListValues(listValues, ({title, value}) => {
      return (<Option key={value} value={value}>{title}</Option>);
    });
  }

  handleChange = (val) => {
    if (val && !val.length) {
      val = undefined //not allow []
    }
    //Split on separators, space or comma, if allow custom values
    let newValues=[];
    let uniqueValues = {};
    if (Array.isArray(val) && val.length > 0 && this.props.allowCustomValues) {
      val.forEach(record => {
        let values = record.split(/[, ]+/);
        values.forEach(val => {
          if (val.length > 0) {
            if (!(val in uniqueValues)) {
              uniqueValues[val] = 1;
              newValues.push(val);
            }
          }
        });
      });
      this.props.setValue(newValues);
    } else {
      this.props.setValue(val);
    }
  };

  filterOption = (input, option) => {
    const dataForFilter = option.children || option.value;
    return dataForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  render() {
    const {config, placeholder, allowCustomValues, customProps, value, readonly, field} = this.props;
    const {renderSize} = config.settings;
    const placeholderWidth = calcTextWidth(placeholder);
    const aValue = value && value.length ? value : undefined;
    const width = aValue ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const dropdownWidth = this.optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const customSelectProps = omit(customProps, ["showCheckboxes"]);

    // modal helpers
    let showModal = true;
    const toggleModal = () => {
      showModal = !showModal;
      console.log("toggleModal clicked", showModal)
    }
    
    return (field === "ameps__dob_year" ? 
      <>
        {!readonly && <Button size="sm" className="btn-light" onClick={toggleModal}>+ Add Range</Button>}
        <span>{value}</span>
        { showModal && <YearsSelector
           toggle={toggleModal}
           addNew={(val) => this.handleChange(val)}
        />}
      </>
      :
      <Select
        disabled={readonly}
        mode={allowCustomValues ? "tags" : "multiple"}
        style={{
          minWidth: width,
          width: width,
        }}
        dropdownStyle={{
          width: dropdownWidth,
        }}
        key={"widget-multiselect"}
        dropdownMatchSelectWidth={false}
        placeholder={placeholder}
        size={renderSize}
        value={aValue}
        onChange={this.handleChange}
        filterOption={this.filterOption}
        {...customSelectProps}
      >{this.options}
      </Select>
    );
  }
}


/**
 * Modal to select range of years
 * @returns 
 */
export function YearsSelector({toggle, addNew}) {

  const startYearRef = useRef(null);
  const endYearRef = useRef(null);

  const handleAddRange = () => {
    if (startYearRef.current && endYearRef.current) {
      let newRange = [startYearRef, endYearRef];
      addNew(newRange);
      toggle();
    }
  }

  return (<>
      <Modal isOpen={true} className="modal-dialog-centered date-picker">
        <ModalHeader>Select Year Range</ModalHeader>
        <ModalBody>
          <div className='input-range'>
            <div className='ir-start'>
              <label>Start Value</label>
              <select ref={startYearRef}>
                <option value="1980">1980</option>
                <option value="1990">1990</option>
                <option value="2000">2000</option>
                <option value="2010">2010</option>
              </select>
            </div>
            <i className="bi bi-arrow-right"></i>
            <div className='ir-end'>
              <label>End Value</label>
              <select ref={endYearRef}>
                <option value="1980">1980</option>
                <option value="1990">1990</option>
                <option value="2000">2000</option>
                <option value="2010">2010</option>
              </select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" size="sm" onClick={toggle}>Cancel</Button>
          <Button color="primary" className="promote" size="sm" 
            onClick={handleAddRange}
            disabled={!startYearRef.current || !endYearRef.current}
          >
              Add Selection
          </Button>{' '}
        </ModalFooter>
      </Modal>
  </>)
}

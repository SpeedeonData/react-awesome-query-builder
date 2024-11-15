import React, { useEffect, useMemo, useState } from "react";
import { Select, Spin, Divider } from "antd";
import { calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../../../utils/domUtils";
import { mapListValues } from "../../../../utils/stuff";
import { useOnPropsChanged } from "../../../../utils/reactUtils";
import omit from "lodash/omit";
import useListValuesAutocomplete from "../../../../hooks/useListValuesAutocomplete";
const Option = Select.Option;

export default (props) => {
  const { config, placeholder, allowCustomValues, customProps, value, readonly, multiple, useAsyncSearch } = props;

  const [labelValues, setLabelValues] = useState([]);

  // hook
  const {
    open,
    onDropdownVisibleChange,
    onChange,
    isSpecialValue,
    onSearch,
    inputValue,
    options,
    isInitialLoading,
    isLoading,
    aPlaceholder,
    extendOptions,
    getOptionDisabled,
    getOptionLabel,
  } = useListValuesAutocomplete(props, {
    debounceTimeout: 100,
    multiple
  });
  
  const filteredOptions = extendOptions(options);
  
  const optionsMaxWidth = useMemo(() => {
    return filteredOptions.reduce((max, option) => {
      return Math.max(max, calcTextWidth(option.title, null));
    }, 0);
  }, [options]);
  
  const { defaultSelectWidth, defaultSearchWidth, renderSize } = config.settings;
  const placeholderWidth = calcTextWidth(placeholder);
  const aValue = value && value.length ? value : undefined;
  const width = aValue ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
  const dropdownWidth = optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;
  const minWidth = width || defaultSelectWidth;

  const apiSearchEndpoints = {
    __county: "location/get-county-names-map",
    __congress: "location/get-cd-names-map",
    __cbsa: "location/get-cbsa-names-map"
  };

  useEffect(() => { 
    allowCustomValues = false;
  }, []);

  useEffect(() => { 
    // if (!aValue) return;
    getLabels(aValue).then((vals) => setLabelValues(vals));
  }, [aValue]);
  
  const style = {
    width: (multiple ? undefined : minWidth),
    minWidth: minWidth
  };
  const dropdownStyle = {
    width: dropdownWidth,
  };

  // Get labels for geo-boundaries
  const getLabels = async (values) => {
    if (!values) return values;
    let type;
    const searchTerms = Object.keys(apiSearchEndpoints);

    for (const term of searchTerms) {
      if (props.field.includes(term)) {
        type = term;
      }
    }
    const apiUrl = apiSearchEndpoints[type];
    if (!type) return values;
    const res = await config.settings.extras(apiUrl, values);
    let list = Object.entries(res).map((item) => {
      return { key: item[0], label: item[1] };
    });
    
    values = list;
    return values;
  };


  const mode = !multiple ? undefined : (allowCustomValues ? "tags" : "multiple");
  const dynamicPlaceholder = !readonly ? aPlaceholder : "";

  // rendering special 'Load more' option has side effect: on change rc-select will save its title as internal value in own state
  const renderedOptions = filteredOptions?.filter(option => !option.specialValue).map((option) => (
    <Option 
      key={option.value} 
      value={option.value} 
      disabled={getOptionDisabled(option)}
    >
      {getOptionLabel(option)}
    </Option>
  ));

  const onSpecialClick = (specialValue) => () => {
    const option = filteredOptions.find(opt => opt.specialValue == specialValue);
    onChange(null, option);
  };

  const specialOptions = filteredOptions?.filter(option => !!option.specialValue).map((option) => (
    <a 
      style={{ padding: "5px 10px", display: "block", cursor: "pointer" }}
      key={option.specialValue} 
      disabled={getOptionDisabled(option)}
      onClick={onSpecialClick(option.specialValue)}
    >
      {getOptionLabel(option)}
    </a>
  ));

  const aOnSelect = async (label, option) => {
    if (isSpecialValue(option)) {
      await onChange(label, option);
    }
  };

  const aOnChange = async (label, option) => {
    if (!isSpecialValue(option)) {
      await onChange(label, option);
    }
  };

  const dropdownRender = (menu) => (
    <div>
      {menu}
      {specialOptions.length > 0
        && <>
          <Divider style={{ margin: "0px" }}/>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {specialOptions}
          </div>
        </>
      }
    </div>
  );

  return (
    <Select
      filterOption={useAsyncSearch ? false : true}
      dropdownRender={dropdownRender}
      allowClear={true}
      notFoundContent={isLoading ? "Loading..." : null}
      disabled={readonly}
      mode={mode}
      style={customProps?.style || style}
      dropdownStyle={customProps?.dropdownStyle || dropdownStyle}
      key={"widget-autocomplete"}
      dropdownMatchSelectWidth={customProps?.dropdownMatchSelectWidth || false}
      placeholder={customProps?.placeholder || dynamicPlaceholder}
      onDropdownVisibleChange={onDropdownVisibleChange}
      onChange={aOnChange}
      onSelect={aOnSelect}
      onSearch={onSearch}
      showArrow
      showSearch
      size={renderSize}
      loading={isLoading}
      value={labelValues}
      //searchValue={inputValue}
      open={open}
      {...customProps}
    >
      {renderedOptions}
    </Select>
  );
};
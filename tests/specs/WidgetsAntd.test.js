import React from "react";
import moment from "moment";
import { mount } from "enzyme";
import { spy } from "sinon";
import { YearsSelector } from "react-awesome-query-builder/components/widgets/antd/value/MultiSelect";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_ant } from "../support/utils";


describe("antdesign widgets render", () => {

  it("should render select by default", () => {
    with_qb_ant(configs.with_struct, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-select-selection-item").at(0).text()).to.equal("  firstName");
    });
  });

  it("should render cascader", () => {
    with_qb_ant(configs.with_cascader, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-cascader .ant-select-selector").text()).to.equal("User / info / firstName");
    });
  });

  it("should render tree select", () => {
    with_qb_ant(configs.with_tree_select, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-select.ant-tree-select")).to.have.length(1);
      expect(qb.find(".ant-select-selection-item").at(0).text()).to.equal("firstName");
    });
  });

  it("should render tree dropdown", () => {
    with_qb_ant(configs.with_dropdown, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-dropdown-trigger span").at(0).text().trim()).to.equal("firstName");
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("antdesign widgets interactions", () => {
  it("change date value", () => {
    with_qb_ant(configs.with_all_types, inits.with_date, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("DateWidget")
        .instance()
        .handleChange(moment("2020-05-05"));
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "date" }, "2020-05-05T00:00:00.000Z" ] }] }
      ]);
    });
  });

  it("change select value", () => {
    with_qb_ant(configs.with_all_types, inits.with_select, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const w = qb.find("SelectWidget").instance();

      w.handleChange("green");
      expect_jlogic([null,
        { "and": [{  "==": [ { "var": "color" }, "green" ]  }] }
      ]);

      // search
      expect(w.filterOption("re", {value: "Red"})).to.equal(true);
      expect(w.filterOption("wh", {value: "Red"})).to.equal(false);
    });
  });

  it("change multiselect value", () => {
    with_qb_ant(configs.with_all_types, inits.with_multiselect, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const w = qb.find("MultiSelectWidget").instance();
      
      w.handleChange(["orange"]);
      expect_jlogic([null, {
        "and": [
          {
            "all": [
              { "var": "multicolor" },
              { "in": [ { "var": "" }, [ "orange" ] ] }
            ]
          }
        ]
      }]);

      w.handleChange([]); //not allow []
      expect_jlogic([null, undefined], 1);

      // search
      expect(w.filterOption("re", {value: "Red"})).to.equal(true);
      expect(w.filterOption("wh", {value: "Red"})).to.equal(false);
    });
  });

  it("change treeselect value", () => {
    with_qb_ant(configs.with_all_types, inits.with_treeselect, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
      expect_checks({
        "query": "selecttree == \"2\"",
        "queryHuman": "Color (tree) = Red",
        "sql": "selecttree = '2'",
        "mongo": {
          "selecttree": "2"
        },
        "logic": {
          "and": [
            { "==": [ { "var": "selecttree" }, "2" ] }
          ]
        }
      });
      
      const w = qb.find("TreeSelectWidget").instance();
      
      w.handleChange("5");
      expect_jlogic([null,
        { "and": [{  "==": [ { "var": "selecttree" }, "5" ]  }] }
      ]);

    });
  });

  it("change multitreeselect value", () => {
    with_qb_ant(configs.with_all_types, inits.with_multiselecttree, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
      expect_checks({
        "query": "multiselecttree == [\"2\", \"5\"]",
        "queryHuman": "Colors (tree) = [Red, Green]",
        "sql": "multiselecttree = '2,5'",
        "mongo": {
          "multiselecttree": [ "2", "5" ]
        },
        "logic": {
          "and": [
            { "all": [
              { "var": "multiselecttree" },
              { "in": [ { "var": "" }, [ "2", "5" ] ] }
            ] }
          ]
        }
      });

      const w = qb.find("TreeSelectWidget").instance();

      w.handleChange(["3"]);
      expect_jlogic([null, {
        "and": [
          { "all": [
            { "var": "multiselecttree" },
            { "in": [ { "var": "" }, [ "3" ] ] }
          ] }
        ]
      }]);

      w.handleChange([]); //not allow []
      expect_jlogic([null, undefined], 1);

      // search
      expect(w.filterTreeNode("re", {title: "Red"})).to.equal(true);
      expect(w.filterTreeNode("wh", {title: "Red"})).to.equal(false);
    });
  });

  it("change time value", () => {
    with_qb_ant(configs.with_all_types, inits.with_time, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("TimeWidget")
        .instance()
        .handleChange(moment("0001-01-01 10:30"));
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "time" }, 60*60*10+60*30 ] }] }
      ]);
    });
  });

  it("change datetime value", () => {
    with_qb_ant(configs.with_all_types, inits.with_datetime, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("DateTimeWidget")
        .instance()
        .handleChange(moment("2020-05-05 10:30"));
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "datetime" }, "2020-05-05T10:30:00.000Z" ] }] }
      ]);
    });
  });

  it("change slider value", () => {
    with_qb_ant(configs.with_all_types, inits.with_slider, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const w = qb.find("SliderWidget").instance();

      w.handleChange(12);
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "slider" }, 12 ] }] }
      ]);

      w.handleChange("");
      expect_jlogic([null, undefined], 1);
    });
  });

  it("change bool value", () => {
    with_qb_ant(configs.with_all_types, inits.with_bool, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("BooleanWidget")
        .instance()
        .handleChange(false);
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "stock" }, false ] }] }
      ]);
    });
  });

  it("change range slider value", () => {
    with_qb_ant(configs.with_all_types, inits.with_range_slider, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
      expect_checks({
        "query": "slider >= 18 && slider <= 42",
        "queryHuman": "Slider BETWEEN 18 AND 42",
        "sql": "slider BETWEEN 18 AND 42",
        "mongo": {
          "slider": {
            "$gte": 18,
            "$lte": 42
          }
        },
        "logic": {
          "and": [
            { "<=": [ 18, { "var": "slider" }, 42 ] }
          ]
        }
      });

      const w = qb.find("RangeWidget").instance();
      
      w.handleChange([19, 42]);
      expect_jlogic([null,
        { "and": [{ "<=": [ 19, { "var": "slider" }, 42 ] }] }
      ], 0);

      w.handleChangeFrom(20);
      expect_jlogic([null,
        { "and": [{ "<=": [ 20, { "var": "slider" }, 42 ] }] }
      ], 1);

      w.handleChangeTo(40);
      expect_jlogic([null,
        { "and": [{ "<=": [ 20, { "var": "slider" }, 40 ] }] }
      ], 2);

      w.handleChangeFrom(null);
      w.handleChangeTo(null);
      expect_jlogic([null, undefined], 3);

    });
  });

  //////////////////////////////////////////////////////////////////////////////////////////
  
  describe("antdesign widgets", () => {

    it("load date range", () => {
      with_qb_ant(configs.with_all_types, inits.with_range_dates, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
        expect_checks({
          "query": "date >= \"2020-05-10\" && date <= \"2020-05-15\"",
          "queryHuman": "Date BETWEEN 10.05.2020 AND 15.05.2020",
          "sql": "date BETWEEN '2020-05-10' AND '2020-05-15'",
          "mongo": {
            "date": { "$gte": "2020-05-10T00:00:00.000Z", "$lte": "2020-05-15T00:00:00.000Z" }
          },
          "logic": {
            "and": [ { "<=": [ "2020-05-10T00:00:00.000Z", { "var": "date" }, "2020-05-15T00:00:00.000Z" ] } ]
          }
        });
      });
    });
  
    it("load bad date range", () => {
      with_qb_ant(configs.with_all_types, inits.with_range_bad_dates, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
        expect_checks({});
      });
    });

  });

  //////////////////////////////////////////////////////////////////////////////////////////

  describe("antdesign core widgets", () => {

    it("change field via cascader", () => {
      with_qb_ant(configs.with_cascader, inits.with_nested, "JsonLogic", (qb) => {
        const w = qb.find("FieldCascader").instance();

        w.onChange(["user", "login"]);

        // search
        expect(w.filterOption("re", [{label: "Red"}])).to.equal(true);
        expect(w.filterOption("wh", [{label: "Red"}])).to.equal(false);
      });
    });

    it("change field via select", () => {
      with_qb_ant(configs.with_struct, inits.with_nested, "JsonLogic", (qb) => {
        const w = qb.find("FieldSelect").first().instance();

        w.onChange("user.login");

        // search
        expect(w.filterOption("re", {title: "Red"})).to.equal(true);
        expect(w.filterOption("wh", {title: "Red"})).to.equal(false);
      });
    });

    it("change field via dropdown", () => {
      with_qb_ant(configs.with_dropdown, inits.with_nested, "JsonLogic", (qb) => {
        const w = qb.find("FieldDropdown").first().instance();

        w.onChange({key: "user.login"});
      });
    });

    it("change field via tree select", () => {
      with_qb_ant(configs.with_tree_select, inits.with_nested, "JsonLogic", (qb) => {
        const w = qb.find("FieldTreeSelect").first().instance();

        w.onChange("user.login");

        // search
        expect(w.filterTreeNode("re", {title: "Red"})).to.equal(true);
        expect(w.filterTreeNode("wh", {title: "Red"})).to.equal(false);
      });
    });

  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("antdesign multiselect range modal (YearsSelector)", () => {
  const mountYearsSelector = (currentSelections = []) => {
    const addNew = spy();
    const toggle = spy();
    const wrapper = mount(React.createElement(YearsSelector, {
      show: true, toggle, addNew, currentSelections
    }));
    return { wrapper, addNew, toggle };
  };

  const enterRange = (wrapper, start, end) => {
    const inputs = wrapper.find("input[type='text']");
    inputs.at(0).getDOMNode().value = start;
    inputs.at(0).simulate("change");
    inputs.at(1).getDOMNode().value = end;
    inputs.at(1).simulate("change");
    wrapper.update();
  };

  const addButton = (wrapper) => wrapper.find("button.promote");

  const expectReady = (start, end, ready) => {
    const { wrapper } = mountYearsSelector();
    enterRange(wrapper, start, end);
    expect(addButton(wrapper).prop("disabled"), `${start}|${end}`).to.equal(!ready);
    wrapper.unmount();
  };

  it("allows ranges whose end has more digits than the start", () => {
    expectReady("18", "100", true);
    expectReady("9", "10", true);
    expectReady("65", "120", true);
  });

  it("rejects ranges whose end is below the start", () => {
    expectReady("10", "9", false);
    expectReady("100", "18", false);
    expectReady("40", "30", false);
  });

  it("allows same-width ranges and single-value ranges", () => {
    expectReady("18", "25", true);
    expectReady("1990", "2000", true);
    expectReady("30", "30", true);
  });

  it("keeps the button disabled until both values are entered", () => {
    expectReady("18", "", false);
    expectReady("", "100", false);
  });

  it("adds the range when both ends are valid", () => {
    const { wrapper, addNew, toggle } = mountYearsSelector(["21|30"]);
    enterRange(wrapper, "18", "100");
    addButton(wrapper).simulate("click");
    expect(addNew.calledOnceWith(["21|30", "18|100"])).to.equal(true);
    expect(toggle.calledOnce).to.equal(true);
    wrapper.unmount();
  });
});

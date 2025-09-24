import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';

import DropDownBox from "devextreme-react/drop-down-box";
import TreeView from "devextreme-react/tree-view";
import TagBox from "devextreme-react/tag-box";
import TextBox from "devextreme-react/text-box";
import CustomStore from "devextreme/data/custom_store";
import "whatwg-fetch";
import Popup from "devextreme/ui/popup";
import type { ValueChangedEvent } from "devextreme/ui/tag_box";
import type { ValueChangedEvent as DropDownValueChangedEvent } from "devextreme/ui/drop_down_box";

const dropDownBoxAttributes = {
  id: "myDropDownBox"
};

const treeDataSource = new CustomStore({
  loadMode: "raw",
  key: "ID",
  load() {
    return fetch(
      `https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/data/treeProducts.json`
    ).then((response) => response.json());
  }
});

const renderTagBox = (treeBoxValue: string[], setTreeBoxValue: (value: string[]) => void) => () => {
  const onValueChanged = useCallback((e: ValueChangedEvent) => {
    setTreeBoxValue(e.value || []);
  }, [setTreeBoxValue]);

  return (<div>
    <TextBox visible={false} />
    <TagBox
      dataSource={treeDataSource}
      value={treeBoxValue}
      valueExpr="ID"
      displayExpr="name"
      onValueChanged={onValueChanged}
      openOnFieldClick={false}
      placeholder="Select a value..."
      showClearButton={true}
      width="100%"
    />
  </div>);
};

function App(): JSX.Element {
  const treeView = useRef<any>(null);
  const [treeBoxValue, setTreeBoxValue] = useState<string[]>(["1_1"]);

  const onContentReady = useCallback(({ component }: any) => {
    if (!component.isNotFirstLoad && treeBoxValue) {
      component.isNotFirstLoad = true;
      treeBoxValue.forEach((item: string) => {
        component.selectItem(item);
      });
    }
  }, [treeBoxValue]);
  
  const onSelectionChanged = useCallback(({ component }: any) => {
    let keys = component.getSelectedNodeKeys();

    if (!component.customSelection && JSON.stringify(treeBoxValue) !== JSON.stringify(keys)) {
      setTreeBoxValue(keys);
    }
  }, [treeBoxValue]);

  const onValueChanged = useCallback((e: DropDownValueChangedEvent) => {
    setTreeBoxValue(e.value || []);
  }, []);

  useEffect(() => {
    const treeViewInstance = (treeView?.current as any)?.instance;

    // Synchronize TreeView
    if (!treeViewInstance) return;
    treeViewInstance.customSelection = true;
    treeViewInstance.unselectAll();
    if (treeBoxValue && treeBoxValue.length > 0) {
      treeBoxValue.forEach((item: string) => {
        treeViewInstance.selectItem(item);
      });
    }
    treeViewInstance.customSelection = false;

    const popupElement = document.querySelector("#myDropDownBox .dx-dropdowneditor-overlay");
    if (popupElement) {
      const popup = Popup.getInstance(popupElement);
      setTimeout(() => (popup as any)?.repaint());
    }
  }, [treeView, treeBoxValue]);

  return (
    <div className="dx-fieldset">
      <div className="dx-field">
        <div className="dx-field-label">DropDownBox with embedded TreeView</div>
        <div className="dx-field-value">
          <DropDownBox
            elementAttr={dropDownBoxAttributes}
            deferRendering={false}
            value={treeBoxValue}
            valueExpr="ID"
            displayExpr="name"
            dataSource={treeDataSource}
            fieldComponent={renderTagBox(treeBoxValue, setTreeBoxValue)}
            onValueChanged={onValueChanged}
          >
            <TreeView
              ref={treeView}
              onContentReady={onContentReady}
              dataSource={treeDataSource}
              dataStructure="plain"
              keyExpr="ID"
              parentIdExpr="categoryId"
              selectionMode="multiple"
              showCheckBoxesMode="normal"
              selectNodesRecursive={false}
              displayExpr="name"
              selectByClick={true}
              onItemSelectionChanged={onSelectionChanged}
            />
          </DropDownBox>
        </div>
      </div>
    </div>
  );
}

export default App;

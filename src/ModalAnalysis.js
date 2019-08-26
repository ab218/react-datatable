import React, { useState } from 'react';
import { Input, Modal } from 'antd';
import Dropdown from './Dropdown';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { TOGGLE_ANALYSIS_MODAL } from './constants';

export default function AnalysisModal() {

  // const [columnName, setColumnName] = useState(selectedColumn.label);
  // const [columnType, setColumnType] = useState(selectedColumn.type);
  // const [columnDataType, setColumnDataType] = useState("Continuous");
  // const [columnFormula, setColumnFormula] = useState(selectedColumn.formula);
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();
  const { analysisModalOpen } = useSpreadsheetState();

  function handleClose() {
    // dispatchSpreadsheetAction({
    //   type: UPDATE_COLUMN,
    //   updatedColumn: {
    //     label: columnName,
    //     type: columnType,
    //     formula: columnFormula,
    //     id: selectedColumn.id
    //    }
    // })
    dispatchSpreadsheetAction({type: TOGGLE_ANALYSIS_MODAL, analysisModalOpen: false })
  }

  return  (
    <div>
      <Modal
        className="ant-modal"
        destroyOnClose
        onCancel={handleClose}
        onOk={handleClose}
        // title={columnName}
        visible={analysisModalOpen}
      >
        <span className="modal-span">
          <h4>Column Name</h4>
          {/* <Input style={{width: 200}} value={columnName} onChange={e => setColumnName(e.target.value)} /> */}
        </span>
        <span className="modal-span">
          <h4>Type</h4>
          {/* <Dropdown menuItems={['Number', 'String', 'Formula']} setColumnType={setColumnType} columnType={columnType} /> */}
        </span>
        <span className="modal-span">
          <h4>Modeling Type</h4>
          {/* <Dropdown menuItems={['Continous', 'Ordinal', 'Nominal']} disabled setColumnType={setColumnDataType} columnType={columnDataType} /> */}
        </span>
        <span className="modal-span">
          <h4>Formula</h4>
          {/* <Input style={{width: 200}} value={columnFormula} onChange={e => setColumnFormula(e.target.value)}/> */}
        </span>
      </Modal>
    </div>
  )
};
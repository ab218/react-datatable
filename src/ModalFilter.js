import React, {useState} from 'react';
import { Modal, Button } from 'antd';
import IntegerStep from './IntegerStep';
import { SelectColumn } from './ModalAnalysis';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { TOGGLE_FILTER_MODAL, REMOVE_SELECTED_CELLS } from './constants';

export default function AntModal() {

  const [clickedColumn, setClickedColumn] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const dispatchSpreadsheetAction = useSpreadsheetDispatch();
  const { filterModalOpen, columns, rows } = useSpreadsheetState();

  function handleClose() {
    dispatchSpreadsheetAction({type: TOGGLE_FILTER_MODAL, filterModalOpen: false, selectedColumn: null})
  }

  function handleCancel() {
    dispatchSpreadsheetAction({type: REMOVE_SELECTED_CELLS })
    dispatchSpreadsheetAction({type: TOGGLE_FILTER_MODAL, filterModalOpen: false, selectedColumn: null})
  }

  function handleColumnPickOk() {
    if (!clickedColumn) return;
    const colVals = rows.map(row => row[clickedColumn.id])
    const colMax = Math.max(...colVals);
    const colMin = Math.min(...colVals);
    const columnObject = {
      ...clickedColumn,
      colMin,
      colMax
    }
    setSelectedColumns(old => {
      const found = old.find(col => col.id === clickedColumn.id);
      return found ? old : old.concat(columnObject);
    })
  }

  return  (
    <div>
      <Modal
        className="ant-modal"
        destroyOnClose
        onCancel={handleCancel}
        onOk={handleClose}
        title={`Data Filter`}
        visible={filterModalOpen}
        style={{display: 'flex', justifyContent: 'center'}}
      >
        <div style={{width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <SelectColumn
          columns={columns}
          setSelectedColumn={setClickedColumn}
          style={{width: '300px'}}
        />
        <Button style={{width: 100, marginTop:10}} onClick={handleColumnPickOk}>Add</Button>
        {selectedColumns.length > 0 && selectedColumns.map(col => <IntegerStep column={col} colMin={col.colMin} colMax={col.colMax} setSelectedColumns={setSelectedColumns} selectedColumns={selectedColumns} />)}
        </div>
      </Modal>
    </div>
  )
};
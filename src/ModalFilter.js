import React from 'react';
import { Modal } from 'antd';
import IntegerStep from './IntegerStep';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { TOGGLE_FILTER_MODAL, REMOVE_SELECTED_CELLS } from './constants';

export default function AntModal({selectedColumn}) {

  const dispatchSpreadsheetAction = useSpreadsheetDispatch();
  const { filterModalOpen, colMin, colMax } = useSpreadsheetState();

  function handleClose() {
    dispatchSpreadsheetAction({type: TOGGLE_FILTER_MODAL, filterModalOpen: false, selectedColumn: null})
  }

  function handleCancel() {
    dispatchSpreadsheetAction({type: REMOVE_SELECTED_CELLS })
    dispatchSpreadsheetAction({type: TOGGLE_FILTER_MODAL, filterModalOpen: false, selectedColumn: null})
  }

  return  (
    <div>
      <Modal
        className="ant-modal"
        destroyOnClose
        onCancel={handleCancel}
        onOk={handleClose}
        title={`Filter ${selectedColumn.label}`}
        visible={filterModalOpen}
      >
        <IntegerStep column={selectedColumn} colMin={colMin} colMax={colMax} />
      </Modal>
    </div>
  )
};
import React, { useState } from 'react';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { TOGGLE_MODAL, UPDATE_COLUMN } from './constants';

export default function Modal({selectedColumn}) {

  const [columnName, setColumnName] = useState(selectedColumn.label);
  const [columnType, setColumnType] = useState(selectedColumn.type);
  const [columnFormula, setColumnFormula] = useState(selectedColumn.formula);
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();
  const { modalOpen } = useSpreadsheetState();
  const showHideClassName = modalOpen ? "modal display-block" : "modal display-none";

  function handleClose() {
    dispatchSpreadsheetAction({type: TOGGLE_MODAL, modalOpen: false, selectedColumn: null})
    dispatchSpreadsheetAction({
      type: UPDATE_COLUMN,
      updatedColumn: {
        label: columnName,
        type: columnType,
        formula: columnFormula,
        id: selectedColumn.id
       }
    })
  }

  return  (
    <div className={showHideClassName}>
      <section className="modal-main">
        <h5>{columnName}</h5>
        <span>
          <div>Column Name</div>
          <input value={columnName} onChange={e => setColumnName(e.target.value)} />
        </span>
        <span>
          <div>Type</div>
          <input value={columnType} onChange={e => setColumnType(e.target.value)} />
        </span>
        <span>
          <div>Modeling Type</div>
          <input value="Continuous" disabled/>
        </span>
        <span>
          <div>Formula</div>
          <input value={columnFormula} onChange={e => setColumnFormula(e.target.value)}/>
        </span>
        <button onClick={handleClose}>close</button>
      </section>
    </div>
  )
};
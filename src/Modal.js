import React from 'react';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { TOGGLE_MODAL } from './constants';

export default function Modal({ children }) {

  const { modalOpen } = useSpreadsheetState();
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();
  const showHideClassName = modalOpen ? "modal display-block" : "modal display-none";

  function handleClose() {
    dispatchSpreadsheetAction({type: TOGGLE_MODAL, modalOpen: false})
  }

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        {children}
        <button onClick={handleClose}>close</button>
      </section>
    </div>
  );
};
import React, { useEffect } from 'react';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import {
  CLOSE_CONTEXT_MENU,
  PERFORM_ANALYSIS,
  SET_GROUPED_COLUMNS,
  TOGGLE_ANALYSIS_MODAL,
  TOGGLE_COLUMN_TYPE_MODAL,
  TOGGLE_LAYOUT,
} from './constants'
import './App.css';

export default function ContextMenu() {
  const { colHeaderContext, colName, contextMenuOpen, contextMenuPosition, layout } = useSpreadsheetState();
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  const onClick = (e) => {
    if (contextMenuOpen) {
      dispatchSpreadsheetAction({type: CLOSE_CONTEXT_MENU })
    }
  }

  const setGroupedColumns = () => {
    dispatchSpreadsheetAction({type: SET_GROUPED_COLUMNS, setColName: colName });
    // layout: false is grouped (spreadsheet) view
    dispatchSpreadsheetAction({type: TOGGLE_LAYOUT, layout: false });
  }

  useEffect(() => {
    const menu = document.querySelector(".menu");
    menu.style.display = contextMenuOpen ? 'block' : 'none';
    if (contextMenuPosition) {
      const { left, top } = contextMenuPosition;
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    }
  })
  return (
    colHeaderContext
      ? <div onClick={onClick} className="menu">
          <ul className="menu-options">
            <li className="menu-option" onClick={() => dispatchSpreadsheetAction({type: TOGGLE_COLUMN_TYPE_MODAL, modalOpen: false, selectedColumn: null})}>Column Info...</li>
            <li className="menu-option" onClick={setGroupedColumns}>Split by <span style={{fontWeight: 'bold'}}>{colName}</span></li>
            <li className="menu-option" onClick={() => dispatchSpreadsheetAction({type: TOGGLE_LAYOUT, layout: !layout })}>Change Layout</li>
            <li style={{display: 'flex', justifyContent: 'space-between'}} className="menu-option"><div>Sort</div><i style={{marginTop: 5}} className="fas fa-caret-right"></i></li>
          </ul>
        </div>
      : <div onClick={onClick} className="menu">
          <ul className="menu-options">
            <li style={{display: 'flex', justifyContent: 'space-between'}} className="menu-option"><div>Fill</div><i style={{marginTop: 5}} className="fas fa-caret-right"></i></li>
            <li style={{display: 'flex', justifyContent: 'space-between'}} className="menu-option"><div>Color</div><i style={{marginTop: 5}} className="fas fa-caret-right"></i></li>
            <li className="menu-option">Select Matching Cells</li>
            <li style={{borderTop: '1px solid #eef'}}></li>
            <li className="menu-option">Cut</li>
            <li className="menu-option">Copy</li>
            <li onClick={() => dispatchSpreadsheetAction({type: PERFORM_ANALYSIS })} className="menu-option">Paste</li>
            <li className="menu-option">Distribution</li>
            <li onClick={() => dispatchSpreadsheetAction({type: TOGGLE_ANALYSIS_MODAL, analysisModalOpen: true })} className="menu-option">Fit Y By X</li>
          </ul>
        </div>
  )
}
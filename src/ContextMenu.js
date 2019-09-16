import React, { useEffect } from 'react';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import {
  TOGGLE_CONTEXT_MENU,
  TOGGLE_ANALYSIS_MODAL,
  TOGGLE_LAYOUT,
  PERFORM_ANALYSIS,
} from './constants'
import './App.css';

export default function ContextMenu() {
  const { colHeaderContext, contextMenuOpen, contextMenuPosition, layout } = useSpreadsheetState();
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  const onClick = (e) => {
    if (contextMenuOpen) {
      toggleMenu(false);
    }
  }

  const toggleMenu = contextMenuOpen => {
    dispatchSpreadsheetAction({type: TOGGLE_CONTEXT_MENU, contextMenuOpen })
  };

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
            <li className="menu-option">Group by</li>
            <li className="menu-option" onClick={() => dispatchSpreadsheetAction({type: TOGGLE_LAYOUT, layout: !layout })}>Change Layout</li>
          </ul>
        </div>
      : <div onClick={onClick} className="menu">
          <ul className="menu-options">
            <li className="menu-option">Cut</li>
            <li className="menu-option">Copy</li>
            <li onClick={() => dispatchSpreadsheetAction({type: PERFORM_ANALYSIS })} className="menu-option">Paste</li>
            <li onClick={() => dispatchSpreadsheetAction({type: TOGGLE_ANALYSIS_MODAL, analysisModalOpen: true })} className="menu-option">Fit Y By X</li>
          </ul>
        </div>
  )
}
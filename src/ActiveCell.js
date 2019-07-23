import React, { useRef, useEffect } from 'react';
import { useSpreadsheetDispatch } from './SpreadsheetProvider';

const cursorKeyToRowColMapper = {
  ArrowUp: function (row, column) {
    return {row: row - 1, column};
  },
  ArrowDown: function (row, column) {
    return {row: row + 1, column};
  },
  ArrowLeft: function (row, column) {
    return {row, column: column - 1};
  },
  ArrowRight: function (row, column) {
    return {row, column: column + 1};
  }
};

function ActiveCell({ value, columns, createNewColumns, changeActiveCell, rowIndex, columnIndex, row: someRow, column: someColumn}) {
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  const onKeyDown = (event) => {
    console.log('event key:', event.key);
    switch (event.key) {
      // TODO: implement key shortcuts from: https://www.ddmcomputing.com/excel/keys/xlsk05.html
      case 'ArrowDown':
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        const {row, column} = cursorKeyToRowColMapper[event.key](rowIndex, columnIndex);
        changeActiveCell(row, column, event.ctrlKey || event.shiftKey || event.metaKey);
        if (event.shiftKey) {
          dispatchSpreadsheetAction({type: 'add-cellID-to-cell-selection', row, column});
        } else {
          updateCell(event);
        }
        break;
      case 'Backspace':
        dispatchSpreadsheetAction({type: 'delete-values'})
        break;
      default:
        break;
    }
  }

  const inputEl = useRef(null);
  useEffect(() => {
    inputEl.current.focus();
  }, [])

  function updateCell(event) {
    dispatchSpreadsheetAction({type: 'updateCell', row: someRow, column: someColumn, cellValue: event.target.value});
  }

  return (<td><input ref={inputEl} type="text" value={value} onChange={updateCell} onKeyDown={onKeyDown}/></td>);
}

export default ActiveCell;
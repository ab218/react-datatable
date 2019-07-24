import React, { useRef, useEffect } from 'react';
import { useSpreadsheetDispatch } from './SpreadsheetProvider';

const cursorKeyToRowColMapper = {
  ArrowUp: function (row, column) {
    // rows should never go less than index 0 (top row header)
    return {row: Math.max(row - 1, 0), column};
  },
  ArrowDown: function (row, column, numberOfRows) {
    return {row: Math.min(row + 1, numberOfRows), column};
  },
  ArrowLeft: function (row, column) {
    // Column should be minimum of 1 due to side row header
    return {row, column: Math.max(column - 1, 1)};
  },
  ArrowRight: function (row, column) {
    return {row, column: column + 1};
  }
};

function ActiveCell({
  changeActiveCell,
  columns,
  columnIndex,
  createNewColumns,
  createNewRows,
  numberOfRows,
  value,
  rowIndex,
  rows,
  column: someColumn,
  row: someRow,
}) {
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
        const { row, column } = cursorKeyToRowColMapper[event.key](rowIndex, columnIndex, numberOfRows);
        if (event.shiftKey) {
          dispatchSpreadsheetAction({type: 'add-cellID-to-cell-selection', row, column});
        } else {
          updateCell(event);
        }
        changeActiveCell(row, column, event.ctrlKey || event.shiftKey || event.metaKey);
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
    if (event.target.value) {
      if (rows === 1 ) {
        createNewRows(rows);
      }
      if (columnIndex > columns.length) {
        createNewColumns(columnIndex - columns.length);
      }
      dispatchSpreadsheetAction({type: 'updateCell', row: someRow, column: someColumn, cellValue: event.target.value});
    }
  }
  return (<td><input ref={inputEl} type="text" value={value} onChange={updateCell} onKeyDown={onKeyDown}/></td>);
}

export default ActiveCell;
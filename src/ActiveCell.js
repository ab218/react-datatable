import React, { useRef, useEffect } from 'react';
import { useSpreadsheetDispatch } from './SpreadsheetProvider';

const cursorKeyToRowColMapper = {
  ArrowUp: function (row, column) {
    if (row > 0) {
      return {row: row - 1, column};
    } else {
      return {row, column}
    }
  },
  ArrowDown: function (row, column, numberOfRows) {
    console.log(row, numberOfRows)
    if (row === numberOfRows) {
      return {row, column}
    } else {
      return {row: row + 1, column};
    }
  },
  ArrowLeft: function (row, column) {
    if (row >= 0 && column > 1) {
      return {row, column: column - 1};
    } else {
      return {row, column}
    }
  },
  ArrowRight: function (row, column) {
    return {row, column: column + 1};
  }
};

function ActiveCell({ value, columns, createNewColumns, createNewRows, changeActiveCell, rowIndex, numberOfRows, columnIndex, rows, row: someRow, column: someColumn}) {
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
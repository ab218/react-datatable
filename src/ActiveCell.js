import React, { useRef, useEffect, useState } from 'react';
import { useSpreadsheetDispatch } from './SpreadsheetProvider';
import { UPDATE_CELL } from './constants';

const cursorKeyToRowColMapper = {
  ArrowUp: function (row, column) {
    // rows should never go less than index 0 (top row header)
    return {row: Math.max(row - 1, 0), column};
  },
  ArrowDown: function (row, column, numberOfRows) {
    return {row: Math.min(row + 1, numberOfRows), column};
  },
  Enter: function (row, column, numberOfRows) {
    return {row: Math.min(row + 1, numberOfRows), column};
  },
};

function ActiveCell({
  changeActiveCell,
  columnIndex,
  row,
  rows,
  column,
  columns,
  createNewColumns,
  createNewRows,
  handleContextMenu,
  numberOfRows,
  rowIndex,
  value,
}) {
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();
  const [inputVal, setInputVal] = useState(value);

  const onKeyDown = (event) => {
    switch (event.key) {
      // TODO: implement key shortcuts from: https://www.ddmcomputing.com/excel/keys/xlsk05.html
      case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
        event.preventDefault();
        const { row, column } = cursorKeyToRowColMapper[event.key](rowIndex, columnIndex, numberOfRows);
        changeActiveCell(row, column, event.ctrlKey || event.shiftKey || event.metaKey);
        break;

      default:
        break;
    }
  }

  const inputEl = useRef(null);
  useEffect(() => {
    const oldInputElCurrent = inputEl.current;
    // Sometimes focus wasn't firing so I added a short setTimeout here
    setTimeout(() => {
      oldInputElCurrent.focus();
      oldInputElCurrent.select();
    }, 30);
  }, [])

  useEffect(() => {
    if (rows === 1 ) {
      createNewRows(rows);
    }
    if (columnIndex > columns.length) {
      createNewColumns(columnIndex - columns.length);
    }
  })

  useEffect(() => {
      if (inputVal !== value) {
        dispatchSpreadsheetAction({type: UPDATE_CELL, row, column, cellValue: inputVal});
      }
  }, [column, dispatchSpreadsheetAction, inputVal, row, value])


  return (
  <td
    onContextMenu={e => handleContextMenu(e)}
  >
    <input
      ref={inputEl}
      type="text"
      value={inputVal}
      onKeyDown={onKeyDown}
      onChange={(e) => {
        e.preventDefault();
        setInputVal(e.target.value);
      }}
    />
  </td>
  );
}

export default ActiveCell;
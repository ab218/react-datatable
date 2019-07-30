import React, {useEffect} from 'react';
import { useSpreadsheetDispatch } from './SpreadsheetProvider';
import { ACTIVATE_SELECTED_CELL, DELETE_VALUES, TRANSLATE_SELECTED_CELL } from './constants'

export function RowNumberCell({rowIndex}) { return <td>{rowIndex + 1}</td> }

export function SelectedCell({changeActiveCell, finishCurrentSelectionRange, modifyCellSelectionRange, numberOfRows, row, rowIndex, column, columnIndex}) {
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

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

  useEffect(() => {
    function onKeyDown(event) {
      // if the key pressed is not a non-character key (arrow key etc)
      if (event.key.length === 1) {
        dispatchSpreadsheetAction({type: ACTIVATE_SELECTED_CELL, rowIndex, columnIndex, newValue: event.key});
      } else {
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowUp':
          case 'ArrowLeft':
          case 'ArrowRight':
            event.preventDefault();
            const { row, column } = cursorKeyToRowColMapper[event.key](rowIndex, columnIndex, numberOfRows);
            dispatchSpreadsheetAction({type: TRANSLATE_SELECTED_CELL, rowIndex: row, columnIndex: column});
            break;
          case 'Backspace':
            dispatchSpreadsheetAction({type: DELETE_VALUES});
            break;
          default:
            break;
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  })

  return (
    <td
      key={`row${rowIndex}col${columnIndex}`}
      style={{backgroundColor: '#f0f0f0'}}
      onMouseDown={(event) => {
        changeActiveCell(rowIndex, columnIndex, event.ctrlKey || event.shiftKey || event.metaKey);
      }}
      onMouseEnter={(event) => {
        if (typeof event.buttons === 'number' && event.buttons > 0) {
          modifyCellSelectionRange(rowIndex, columnIndex, true);
        }
      }}
      onMouseUp={() => {finishCurrentSelectionRange()}}
    >{row ? row[column.id] : ''}</td>
  )
}

export function NormalCell({selectCell, finishCurrentSelectionRange, modifyCellSelectionRange, row, rowIndex, column, columnIndex}) {
  return (
  <td
    key={`row${rowIndex}col${columnIndex}`}
    onMouseDown={(event) => {
      // prevent text from being highlighted
      event.preventDefault();
      selectCell(rowIndex, columnIndex, event.ctrlKey || event.shiftKey || event.metaKey);
    }}
    onMouseEnter={(event) => {
      if (typeof event.buttons === 'number' && event.buttons > 0) {
        modifyCellSelectionRange(rowIndex, columnIndex, true);
      }
    }}
    onMouseUp={() => {finishCurrentSelectionRange()}}
    >
  {row[column.id]}</td>
  )}

// function isFormula(value) {
//   return typeof value === 'string' && value.charAt(0) === '=';
// }

// function Cell({value, formulaParser, row, col, deselected, selected, setActiveCell, modifyCellSelectionRange, finishCurrentSelectionRange}) {
//   const dispatchSpreadsheetAction = useSpreadsheetDispatch();
//   let cellValue = value;
//   if (isFormula(cellValue)) {
//     const {error, result} = formulaParser.parse(cellValue.slice(1));
//     cellValue = error || result;
//   }
//   return (<td style={!deselected && selected ? {backgroundColor: '#f0f0f0'} : {}}
//               onMouseDown={(event) => {
//                 if (selected) {
//                   setActiveCell(row, col, event.ctrlKey || event.shiftKey || event.metaKey);
//                   dispatchSpreadsheetAction({type: 'add-cell-to-deselect-list'});
//                 } else {
//                   setActiveCell(row, col, event.ctrlKey || event.shiftKey || event.metaKey);
//                 }
//                 if (!event.metaKey && !event.shiftKey) {
//                   dispatchSpreadsheetAction({type: 'clear-deselect-list'});
//                 }
//               }}
//               onMouseMove={(event) => {
//                 if (typeof event.buttons === 'number' && event.buttons > 0) {
//                   modifyCellSelectionRange(row, col, true);
//                 }
//               }}
//               onMouseUp={() => {
//                 finishCurrentSelectionRange();
//               }}>{cellValue}</td>);
// }

// export default Cell;
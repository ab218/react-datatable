import React, {useEffect} from 'react';
import { useSpreadsheetDispatch } from './SpreadsheetProvider';
import { ACTIVATE_SELECTED_CELL, DELETE_VALUES } from './constants'

export function RowNumberCell({rowIndex}) { return <td>{rowIndex + 1}</td> }

export function SelectedCell({changeActiveCell, finishCurrentSelectionRange, modifyCellSelectionRange, row, rowIndex, column, columnIndex}) {
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Backspace') {
        dispatchSpreadsheetAction({type: DELETE_VALUES})
        // else if the key pressed is not a non-character key (arrow key etc)
      } else if (event.key.length === 1) {
        dispatchSpreadsheetAction({type: ACTIVATE_SELECTED_CELL, rowIndex, columnIndex, newValue: event.key})
      } else if (event.key === 'ArrowLeft') {
        console.log('arrow left')
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
    >{row[column.id]}</td>
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
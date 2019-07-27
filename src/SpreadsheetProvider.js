import React, { useReducer } from 'react';
import './App.css';

const SpreadsheetStateContext = React.createContext();
const SpreadsheetDispatchContext = React.createContext();

function getRangeBoundaries({startRangeRow, startRangeColumn, endRangeRow, endRangeColumn}) {
  const top = Math.min(startRangeRow, endRangeRow);
  const bottom = Math.max(startRangeRow, endRangeRow);
  const left = Math.min(startRangeColumn, endRangeColumn);
  const right = Math.max(startRangeColumn, endRangeColumn);
  return {top, left, bottom, right};
}

function createRandomID() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function spreadsheetReducer(state, action) {
  const {
    cellValue,
    column,
    columnCount,
    endRangeRow,
    endRangeColumn,
    row,
    rowCount,
    selectionActive,
    type,
   } = action;
  // console.log('dispatched:', type, 'with action:', action);
  switch (type) {
    case 'activateCell': {
      const {activeCell: oldActiveCell, multiCellSelectionIDs: oldCellSelectionIDs, cellSelectionRanges: oldCellSelectionRanges} = state;
      const activeCell = {row, column}
      const wereCellsAlreadySelected = (currentSelectedCellArray, selectedCell) => !currentSelectedCellArray.some(item => (selectedCell.row === item.row) && (selectedCell.column === item.column))
      // If there is a current selection (accumulated by the arrow keys), add to it; otherwise reset the selection
      const multiCellSelectionIDs = selectionActive ? oldCellSelectionIDs.concat(wereCellsAlreadySelected(oldCellSelectionIDs, oldActiveCell) ? oldActiveCell : []) : [];
      // // Ditto for the current selection (accumulated by mouse movements)
      const cellSelectionRanges = selectionActive ? oldCellSelectionRanges : [];
      return {...state, activeCell, multiCellSelectionIDs, cellSelectionRanges, currentCellSelectionRange: {top: row, left: column}}
    }
    case 'add-cellID-to-cell-selection': {
      const {multiCellSelectionIDs = []} = state;
      const newSelection = {row, column};
      return {...state, multiCellSelectionIDs: multiCellSelectionIDs.concat(multiCellSelectionIDs.some(item => (item.row === newSelection.row) && (item.column === newSelection.column)) ? [] : newSelection)};
    }
    // case 'add-cell-to-deselect-list': {
    //   const { activeCell, deselectedCells: oldDeselectedCells = [] } = state;
    //   const deselectedCells = [...new Set(oldDeselectedCells.concat(activeCell))];
    //   return {...state, deselectedCells };
    // }
    case 'add-current-selection-to-cell-selections': {
      const {currentCellSelectionRange, cellSelectionRanges} = state;
      return {...state, cellSelectionRanges: cellSelectionRanges.concat(currentCellSelectionRange), currentCellSelectionRange: null};
    }
    // case 'clear-deselect-list': {
    //   return {...state, deselectedCells: []}
    // }
    case 'createColumns': {
      const newColumns = Array(columnCount).fill(undefined).map(_ => {
        const id = createRandomID();
        return {id, type: 'String', label: `Column ${id}`};
      });
      return {...state, columns: state.columns.concat(newColumns)};
    }
    case 'createRows': {
      const newRows = Array(rowCount).fill(undefined).map(_ => {
        return {id: createRandomID()};
      });
      const newRowPositions = newRows.reduce((acc, {id}, index) => {
        return {...acc, [id]: state.rows.length + index};
      }, state.rowPositions);
      return {...state, rows: state.rows.concat(newRows), rowPositions: newRowPositions};
    }
    // case 'delete-values': {
    //   const { cells, cellPositions, cellSelectionRanges, multiCellSelectionIDs, deselectedCells } = state;

    //   function clearCellValue(acc, selectedCellID) {
    //     return {...acc, [selectedCellID]: {value: null}};
    //   }

    //   const selectedRangeIDs = cellSelectionRanges.flatMap(({top, bottom, left, right}) => {
    //     // slice the ranges that were selected and filter out the undefined values
    //     return cellPositions.slice(top, bottom + 1).flatMap((row) => row.slice(left, right + 1).filter(Boolean));
    //   });
    //   const clearedCellValues = multiCellSelectionIDs.concat(selectedRangeIDs).filter((cellID) => !deselectedCells.includes(cellID)).reduce(clearCellValue, {});
    //   const newCells = Object.assign({}, cells, clearedCellValues);

    //   return {...state, cells: newCells }
    // }
    case 'modify-current-selection-cell-range': {
      const {currentCellSelectionRange, activeCell} = state;
      return currentCellSelectionRange ? {
        ...state,
        currentCellSelectionRange: getRangeBoundaries({
          startRangeRow: activeCell.row,
          startRangeColumn: activeCell.column,
          endRangeRow,
          endRangeColumn,
          state
        })
      } : state;
    }
    case 'setRowPosition': {
      return {...state, rowPositions: {...state.rowPositions, [action.rowID]: action.row} };
    }
    case 'updateCell': {
      const { rows, columns } = state;
      const newRows = rows.slice();
      const {id: columnID} = column || columns[columns.length - 1];
      const rowCopy = Object.assign({}, row || rows[rows.length - 1], {[columnID]: cellValue});
      const changedRows = newRows.filter(newRow => newRow.id !== rowCopy.id).concat(rowCopy)
      return  {...state, rows: changedRows };
    }
    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
}

export function useSpreadsheetState() {
  const context = React.useContext(SpreadsheetStateContext)
  if (context === undefined) {
    throw new Error('useCountState must be used within a CountProvider')
  }
  return context;
}
export function useSpreadsheetDispatch() {
  const context = React.useContext(SpreadsheetDispatchContext)
  if (context === undefined) {
    throw new Error('useCountDispatch must be used within a CountProvider')
  }
  return context;
}

export function SpreadsheetProvider({children}) {

  const [state, changeSpreadsheet] = useReducer(spreadsheetReducer, {
    activeCell: null,
    cellPositions: [],
    cells: {},
    cellSelectionRanges: [{
      top: 1, bottom: 1, left: 1, right: 1
    }],
    currentCellSelectionRange: null,
    columns: [{id: 'name321', type: 'String', label: 'Name'}, {id: 'age123', type: 'Number', label: 'Age'}, {id: 'gender456', type: 'String', label: 'Gender'}],
    multiCellSelectionIDs: [],
    rowPositions: {"HITFiTNG8l": 1, "r0aWTL1Fae": 0},
    rows: [{id: "HITFiTNG8l", age123: 25, gender456: 'M', name321: 'John Smith'}, {id: "r0aWTL1Fae", age123: 24, gender456: 'F', name321: 'Jane Smith'}],
  });
  return (
    <SpreadsheetStateContext.Provider value={state}>
      <SpreadsheetDispatchContext.Provider value={changeSpreadsheet}>
        {children}
      </SpreadsheetDispatchContext.Provider>
    </SpreadsheetStateContext.Provider>
  )
}
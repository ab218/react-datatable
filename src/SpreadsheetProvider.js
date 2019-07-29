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
    case 'ACTIVATE_CELL': {
      const {cellSelectionRanges = []} = state;
      const activeCell = {row, column};
      const selectedCell = {top: row, bottom: row, left: column, right: column};
      const addActiveCellToSelection = cellSelectionRanges.concat(cellSelectionRanges.some(cell => (cell.top === selectedCell.top) && (cell.right === selectedCell.right)) ? [] : selectedCell);
      return {...state, activeCell, cellSelectionRanges: selectionActive ? addActiveCellToSelection : [], currentCellSelectionRange: selectedCell }
    }
    case 'ADD_CELL_TO_SELECTIONS': {
      const {cellSelectionRanges = []} = state;
      const newSelection = {top: row, bottom: row, left: column, right: column};
      return {...state, cellSelectionRanges: cellSelectionRanges.concat(cellSelectionRanges.some(cell => (cell.top === newSelection.top) && (cell.left === newSelection.left)) ? [] : newSelection)};
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
      const columns = state.columns.concat(newColumns);
      const columnPositions = newColumns.reduce((acc, {id}, offset) => {
        console.log('offset:', offset);
        return {...acc, [id]: state.columns.length + offset};
      }, state.columnPositions);
      return {...state, columns, columnPositions};
    }
    case 'createRows': {
      const newRows = Array(rowCount).fill(undefined).map(_ => {
        return {id: createRandomID()};
      });
      const newRowPositions = newRows.reduce((acc, {id}, offset) => {
        return {...acc, [id]: state.rows.length + offset};
      }, state.rowPositions);
      return {...state, rows: state.rows.concat(newRows), rowPositions: newRowPositions};
    }
    case 'DELETE_VALUES': {
      const { cellSelectionRanges, columnPositions, rowPositions } = state;
      console.log(state)

      function removeKeyReducer(container, key) {
        const {[key]: value, ...rest} = container;
        return rest;
      }
      const newRows = cellSelectionRanges.reduce((rows, {top, left, bottom, right}) => {
        const selectedColumnPositions = Object.entries(columnPositions).filter(([_, position]) => {
          // Subtract one because of header column
          return position >= (left - 1) && position <= (right - 1);
        });
        const selectedColumnIDs = selectedColumnPositions.map(([id]) => id);
        const selectedRowPositions = Object.entries(rowPositions).filter(([_, position]) => {
          return position >= top && position <= bottom;
        });
        const selectedRowIDs = selectedRowPositions.map(([id]) => id);
        return rows.map((row) => {
          if (selectedRowIDs.includes(row.id)) {
            return selectedColumnIDs.reduce(removeKeyReducer, row);
          } else {
            return row;
          }
        });
      }, state.rows);
      return {...state, rows: newRows };
    }
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
    cellSelectionRanges: [{
      top: 1, bottom: 1, left: 1, right: 1
    }],
    currentCellSelectionRange: null,
    columns: [{id: 'name321', type: 'String', label: 'Name'}, {id: 'age123', type: 'Number', label: 'Age'}, {id: 'gender456', type: 'String', label: 'Gender'}],
    columnPositions: {'name321': 0, 'age123': 1, 'gender456': 2},
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
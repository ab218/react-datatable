import React, { useReducer } from 'react';
import { Parser } from 'hot-formula-parser';
import './App.css';
import {
  ACTIVATE_CELL,
  ADD_CELL_TO_SELECTIONS,
  ADD_CURRENT_SELECTION_TO_CELL_SELECTIONS,
  CHANGE_TABLE_VIEW,
  CREATE_COLUMNS,
  CREATE_ROWS,
  DELETE_VALUES,
  MODIFY_CURRENT_SELECTION_CELL_RANGE,
  OPEN_ANALYSIS_WINDOW,
  PERFORM_ANALYSIS,
  TOGGLE_CONTEXT_MENU,
  TOGGLE_COLUMN_TYPE_MODAL,
  TOGGLE_ANALYSIS_MODAL,
  REMOVE_SELECTED_CELLS,
  SET_ROW_POSITION,
  SELECT_CELL,
  TRANSLATE_SELECTED_CELL,
  UPDATE_CELL,
  UPDATE_COLUMN
} from './constants'

function translateLabelToID(columns, formula) {
  return columns.filter((someColumn) => formula.includes(someColumn.label)).reduce((changedFormula, someColumn) => {
    return changedFormula.replace(new RegExp(`\\b${someColumn.label}\\b`, 'g'), `${someColumn.id}`);
  }, formula);
}

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

function createRandomLetterString() {
  const upperAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alphabet = upperAlphabet + upperAlphabet.toLowerCase();
  return '_' + Array(10).fill(undefined).map((_) => alphabet.charAt(Math.floor(Math.random() * alphabet.length))).join('') + '_';
}

function spreadsheetReducer(state, action) {
  const {
    analysisModalOpen,
    cellValue,
    column,
    columnCount,
    columnIndex,
    contextMenuOpen,
    endRangeRow,
    endRangeColumn,
    columnTypeModalOpen,
    outputData,
    row,
    rowIndex,
    rowCount,
    selectionActive,
    tableView,
    type,
    updatedColumn,
    xColData,
    yColData,
   } = action;
  console.log('dispatched:', type, 'with action:', action);
  switch (type) {
    // On text input of a selected cell, value is cleared, cell gets new value and cell is activated
    case ACTIVATE_CELL: {
      const activeCell = {row, column};
      return {...state, activeCell, cellSelectionRanges: [] }
    }
    case ADD_CELL_TO_SELECTIONS: {
      const {cellSelectionRanges = []} = state;
      const newSelection = {top: row, bottom: row, left: column, right: column};
      return {...state, cellSelectionRanges: cellSelectionRanges.concat(cellSelectionRanges.some(cell => (cell.top === newSelection.top) && (cell.left === newSelection.left)) ? [] : newSelection)};
    }
    case ADD_CURRENT_SELECTION_TO_CELL_SELECTIONS: {
      const {currentCellSelectionRange, cellSelectionRanges} = state;
      return {...state, cellSelectionRanges: cellSelectionRanges.concat(currentCellSelectionRange || []), currentCellSelectionRange: null};
    }
    case CHANGE_TABLE_VIEW: {
      return {...state, tableView };
    }
    case CREATE_COLUMNS: {
      const newColumns = Array(columnCount).fill(undefined).map(_ => {
        const id = createRandomID();
        return {id, type: 'String'};
      });
      const columns = state.columns.concat(newColumns);
      const columnPositions = newColumns.reduce((acc, {id}, offset) => {
        return {...acc, [id]: state.columns.length + offset};
      }, state.columnPositions);
      return {...state, columns, columnPositions};
    }
    case CREATE_ROWS: {
      const newRows = Array(rowCount).fill(undefined).map(_ => {
        return {id: createRandomID()};
      });
      const newRowPositions = newRows.reduce((acc, {id}, offset) => {
        return {...acc, [id]: state.rows.length + offset};
      }, state.rowPositions);
      return {...state, rows: state.rows.concat(newRows), rowPositions: newRowPositions};
    }
    case DELETE_VALUES: {
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
    case MODIFY_CURRENT_SELECTION_CELL_RANGE: {
      const {currentCellSelectionRange, lastSelection} = state;
      return currentCellSelectionRange ? {
        ...state,
        currentCellSelectionRange: getRangeBoundaries({
          startRangeRow: lastSelection.row,
          startRangeColumn: lastSelection.column,
          endRangeRow,
          endRangeColumn,
          state
        })
      } : state;
    }
    case OPEN_ANALYSIS_WINDOW: {
      function receiveMessage(event) {
        console.log('ORIGIN', event);
        if (event.data === 'ready') {
          popup.postMessage(outputData, '*');
          window.removeEventListener("message", receiveMessage);
        }
      }
      const popup = window.open(window.location.href + "postmessage_test.html", "", "left=9999,top=100,width=450,height=850");
      window.addEventListener("message", receiveMessage, false);
      return {...state, performAnalysis: false};
    }
    case PERFORM_ANALYSIS: {
      return {...state, performAnalysis: true, xColData, yColData};
    }
    case REMOVE_SELECTED_CELLS: {
      return {...state, cellSelectionRanges: [] }
    }
    case SELECT_CELL: {
      const {cellSelectionRanges = []} = state;
      // track lastSelection to know where to begin range selection on drag
      const lastSelection = {row, column};
      const selectedCell = {top: row, bottom: row, left: column, right: column};
      const addSelectedCellToSelectionArray = cellSelectionRanges.concat(cellSelectionRanges.some(cell => (cell.top === selectedCell.top) && (cell.right === selectedCell.right)) ? [] : selectedCell);
      return {...state, activeCell: null, lastSelection, cellSelectionRanges: selectionActive ? addSelectedCellToSelectionArray : [], currentCellSelectionRange: selectedCell }
    }
    case SET_ROW_POSITION: {
      return {...state, rowPositions: {...state.rowPositions, [action.rowID]: action.row} };
    }
    case TOGGLE_CONTEXT_MENU: {
      function showOrHideContextMenu(command) { return command === 'show' ? true : false }
      return {...state, contextMenuOpen: showOrHideContextMenu(contextMenuOpen) };
    }
    case TOGGLE_ANALYSIS_MODAL: {
      return {...state, analysisModalOpen}
    }
    case TOGGLE_COLUMN_TYPE_MODAL: {
      return {...state, columnTypeModalOpen, selectedColumn: column}
    }
    case TRANSLATE_SELECTED_CELL: {
      const newCellSelectionRanges = [{top: rowIndex, bottom: rowIndex, left: columnIndex, right: columnIndex}];
      return {...state, cellSelectionRanges: newCellSelectionRanges, currentCellSelectionRange: null}
    }
    case UPDATE_CELL: {
      const { rows, columns } = state;
      // row from action or last row from state
      const originalRow = row || rows[rows.length - 1];
      const newRows = rows.slice();
      const {id: columnID} = column || columns[columns.length - 1];
      const dependentColumns = columns.filter(({type, formula}) => {
        return type === 'Formula' && formula.includes(columnID);
      });
      let rowCopy = Object.assign({}, originalRow, {[columnID]: cellValue});
      if (dependentColumns.length) {
        const formulaParser = new Parser();
        formulaParser.on('callVariable', function(name, done) {
          const selectedColumn = columns.find((column) => column.id === name);
          if (selectedColumn) {
            done(rowCopy[selectedColumn.id]);
          }
        });
        rowCopy = dependentColumns.reduce((acc, column) => {
          return {...acc, [column.id]: formulaParser.parse(column.formula).result};
        }, rowCopy);
      }
      const changedRows = newRows.filter(newRow => newRow.id !== rowCopy.id).concat(rowCopy);

      return  {...state, rows: changedRows };
    }
    case UPDATE_COLUMN: {
      // TODO: Make it so a formula cannot refer to itself. Detect formula cycles. Use a stack?
      const columnHasFormula = updatedColumn.formula && updatedColumn.type === 'Formula';
      const columnCopy = Object.assign({}, updatedColumn, columnHasFormula ? {formula: translateLabelToID(state.columns, updatedColumn.formula)} : {});
      const originalPosition = state.columns.findIndex(col => col.id === columnCopy.id);
      const updatedColumns = state.columns.slice(0, originalPosition).concat(columnCopy).concat(state.columns.slice(originalPosition + 1));
      let rows = state.rows;
      if (columnHasFormula) {
        rows = rows.map((row) => {
          const formulaColumnsToUpdate = [columnCopy].concat(state.columns.filter(({type, formula}) => {
            return type === 'Formula' && formula.includes(columnCopy.id);
          }));
          const formulaParser = new Parser();
          formulaParser.on('callVariable', function(name, done) {
            const selectedColumn = state.columns.find((column) => column.id === name);
            if (selectedColumn) {
              done(row[selectedColumn.id]);
            }
          });
          return formulaColumnsToUpdate.reduce((acc, column) => {
            row = acc;
            const {result, error} = formulaParser.parse(column.formula);
            console.log('formula parsed result:', result, 'error:', error, 'formula:', column.formula);
            return {...acc, [column.id]: result};
          }, row);
        });
      }
      return {...state, columns: updatedColumns, rows};
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
  // const jovitaColumns = [
  //   {type: 'Number', label: 'Distance'},
  //   {type: 'Number', label: 'Trial 1', group: '1'},
  //   {type: 'Number', label: 'Trial 2', group: '1'},
  //   {type: 'Number', label: 'Trial 3', group: '1'},
  //   {type: 'Number', label: 'Trial 4', group: '1'},
  //   {type: 'Number', label: 'Trial 5', group: '1'},
  //   {type: 'Formula', label: 'Average # of Bubbles', formula: '(Trial 1 + Trial 2 + Trial 3 + Trial 4 + Trial 5) / 5'},
  //   {type: 'Group', id: 'abc123'}
  // ]

  const statsColumns = [
    {type: 'Number', label: 'Distance',  id: 'abc123'},
    {type: 'Number', label: 'Trial'},
    {type: 'Number', label: 'Bubbles'},
  ]

  const columns = statsColumns.map((metadata) => ({id: metadata.id || createRandomLetterString(), ...metadata}))
  .map((column, _, array) => {
    const {formula, ...rest} = column;
    if (formula) {
      const newFormula = array.filter((someColumn) => formula.includes(someColumn.label)).reduce((changedFormula, someColumn) => {
        return changedFormula.replace(new RegExp(`\\b${someColumn.label}\\b`, 'g'), `${someColumn.id}`);
      }, formula);
      return {...rest, formula: newFormula};
    }
    return column;
  })

  const statsRows = [
    [10, 1, 12],
    [20, 1, 10],
    [30, 1, 7],
    [40, 1, 6],
    [50, 1, 2],
    [10, 2, 10],
    [20, 2, 9],
    [30, 2, 6],
    [40, 2, 4],
    [50, 2, 4],
    [10, 3, 12],
    [20, 3, 9],
    [30, 3, 8],
    [40, 3, 5],
    [50, 3, 3],
    [10, 4, 11],
    [20, 4, 8],
    [30, 4, 7],
    [40, 4, 6],
    [50, 4, 2],
    [10, 5, 11],
    [20, 5, 10],
    [30, 5, 7],
    [40, 5, 5],
    [50, 5, 3],
  ]

  // const jovitaRows = [
  //   [10, 12, 10, 12, 11, 11],
  //   [20, 10, 9, 9, 8, 10],
  //   [30, 7, 6, 8, 7, 7],
  //   [40, 6, 4, 5, 6, 5],
  //   [50, 2, 4, 3, 2, 3],
  // ]

  const columnPositions = columns.reduce((acc, column, index) => ({...acc, [column.id]: index}), {});

  const rows = statsRows.map((tuple) => ({
    id: createRandomID(), ...tuple.reduce((acc, value, index) => ({...acc, [columns[index].id]: value}), {})
  })).map((originalRow) => {
    const formulaColumns = columns.filter(({type}) => type === 'Formula');
    let rowCopy = Object.assign({}, originalRow);
    if (formulaColumns.length) {
      const formulaParser = new Parser();
      formulaParser.on('callVariable', function(name, done) {
        const selectedColumn = columns.find((column) => column.id === name);
        if (selectedColumn) {
          done(originalRow[selectedColumn.id]);
        }
      });
      rowCopy = formulaColumns.reduce((acc, column) => {
        return {...acc, [column.id]: formulaParser.parse(column.formula).result};
      }, rowCopy);
    }

    return rowCopy;
  });
  const rowPositions = rows.reduce((acc, row, index) => ({...acc, [row.id]: index}), {});
  const groupByColumnID = 'abc123';
  const groupedColumns = rows.reduce((acc, row) => {
    const {[groupByColumnID]: _, ...restRow} = row;
    return {...acc, [row[groupByColumnID]]: (acc[row[groupByColumnID]] || []).concat(restRow)}
  }, {});

  const groupCount = Object.keys(groupedColumns).length;
  const sortedNonGroupedColumns = columns.filter(({id}) => id !== groupByColumnID).sort((colA, colB) => {
    return columnPositions[colA.id] - columnPositions[colB.id];
  });

  // Given m logical columns and n different values in our group by column,
  // we should have (m - 1) * n number of physical columns
  const allPhysicalColumns = Array.from({length: groupCount}).flatMap(_ => {
        return sortedNonGroupedColumns.map((logicalColumn) => {
          return {...logicalColumn, id: createRandomID(), logicalColumn: logicalColumn.id};
        });
      });
  const logicalRowGroups = Object.values(groupedColumns);
  // the size of the largest group is the maximum number of physical rows
  const physicalRowTotal = Math.max(...logicalRowGroups.map(group => group.length));
  // We have to translate the logical rows into physical rows
  const physicalRows = rows.slice(0, physicalRowTotal).reduce((acc, _, index) => {
    return acc.concat(logicalRowGroups.reduce((physicalRow, group, groupIndex) => {
      const logicalRow = group[index];
      // If we have a valid logical row from our group, we then map the row values
      // for all its logical column ids to refer to physical column ids
      return logicalRow ? sortedNonGroupedColumns.reduce((acc, column, columnIndex, array) => {
        // We compute the offset bvecause allPhysicalColumns is a flat list
        const physicalColumn = allPhysicalColumns[columnIndex + (groupIndex * array.length)];
        const result = {...acc, [physicalColumn.id]: logicalRow[column.id]};
        return result;
      }, physicalRow) : physicalRow;
    }, {id: createRandomID()}));
  }, []);

  console.log('physicalRows:', physicalRows, 'allPhysicalColumns:', allPhysicalColumns);
  // console.log(sortedNonGroupedColumns, groupedColumns)

  const initialState = {
    allPhysicalColumns,
    analysisModalOpen: false,
    analysisWindowOpen: false,
    columnTypeModalOpen: false,
    activeCell: null,
    cellSelectionRanges: [{
      top: 1, bottom: 1, left: 1, right: 1
    }],
    currentCellSelectionRange: null,
    columns,
    columnPositions,
    groupByColumnID,
    groupedColumns,
    performAnalysis: false,
    physicalRows,
    tableView: false,
    xColData: null,
    yColData: null,
    lastSelection: {row: 1, column: 1},
    rowPositions,
    rows,
  };
  const [state, changeSpreadsheet] = useReducer(spreadsheetReducer, initialState);
  return (
    <SpreadsheetStateContext.Provider value={state}>
      <SpreadsheetDispatchContext.Provider value={changeSpreadsheet}>
        {children}
      </SpreadsheetDispatchContext.Provider>
    </SpreadsheetStateContext.Provider>
  )
}
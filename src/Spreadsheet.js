import React from 'react';
// import { Parser } from 'hot-formula-parser';
import './App.css';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import ColResizer from './ColResizer';
import ActiveCell from './ActiveCell';
import Row from './Row';
import {
  ACTIVATE_CELL,
  ADD_CURRENT_SELECTION_TO_CELL_SELECTIONS,
  CREATE_COLUMNS,
  CREATE_ROWS,
  MODIFY_CURRENT_SELECTION_CELL_RANGE,
  SELECT_CELL,
  ACTIVATE_SELECTED_CELL,
} from './constants'

// function isFormula(value) {
//   return typeof value === 'string' && value.charAt(0) === '=';
// }

function FormulaBar() {
  return (
    <div style={{display: 'flex', height: '30px'}}>
      <div style={{minWidth: '82px', margin: 'auto', fontStyle: 'italic'}}>Fx</div>
      <input style={{width: '100%', fontSize: '1.2em'}} />
    </div>
  )
}

function BlankRow({cellCount}) { return <tr>{Array(cellCount).fill(undefined).map((_, columnIndex) => <td key={'blankcol' + columnIndex}></td>)}</tr> }

function BlankClickableRow({activeCell, finishCurrentSelectionRange, modifyCellSelectionRange, row, selectCell, cellCount, changeActiveCell, createNewRows, createNewColumns, rowIndex, rows, numberOfRows, columns}) {
  return (
    <tr>
      {Array(cellCount).fill(undefined).map((_, columnIndex) => {
        const column = columns[columnIndex - 1];
        if (activeCell && activeCell.column > 0 && activeCell.row === rowIndex && activeCell.column === columnIndex) {
          return (
            <ActiveCell
              key={`row${rowIndex}col${columnIndex}`}
              changeActiveCell={changeActiveCell}
              columnIndex={columnIndex}
              column={column}
              columns={columns}
              createNewColumns={createNewColumns}
              createNewRows={createNewRows}
              numberOfRows={numberOfRows}
              row={row}
              rowIndex={rowIndex}
              rows={rows}
            />
          )
        }
        return (
          <td
            onMouseDown={(event) => {
              selectCell(rowIndex, columnIndex, event.ctrlKey || event.shiftKey || event.metaKey);
            }}
            onMouseEnter={(event) => {
            if (typeof event.buttons === 'number' && event.buttons > 0) {
              modifyCellSelectionRange(rowIndex, columnIndex, true);
            }
            }}
            onMouseUp={() => {finishCurrentSelectionRange()}}
            key={`blank_cell${rowIndex}_${columnIndex}`}
            ></td>
        )
      })}
    </tr>
  );
}

function Spreadsheet({eventBus}) {
  const {
    activeCell,
    columnPositions,
    columns,
    cellSelectionRanges,
    currentCellSelectionRange,
    newValue,
    rowPositions,
    rows,
   } = useSpreadsheetState();
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  function isSelectedCell(row, column) {
    function withinRange(value) {
      const {top, right, bottom, left} = value;
      return row >= top && row <= bottom && column >= left && column <= right;
    }
    const withinASelectedRange = cellSelectionRanges.some(withinRange);
    return withinASelectedRange || (currentCellSelectionRange && withinRange(currentCellSelectionRange));
  }

  const rowMap = Object.entries(rowPositions).reduce((acc, [id, position]) => {
    return {...acc, [position]: id};
  }, {});
  const rowCount = rowMap ? Math.max(...Object.keys(rowMap)) + 1 : 0;
  const visibleRowCount = Math.max(rowCount, 20); // 50 rows should be enough to fill the screen
  const rowIDs = Array(rowCount).fill(undefined).map((_, index) => {
    return rowMap[index];
  });


  // We add one more column header as the capstone for the column of row headers
  const visibleColumnCount = Math.max(26, columns.length);
  const headers = Array(visibleColumnCount).fill(undefined).map((_, index) => (<ColResizer key={index} minWidth={60} content={String.fromCharCode(index + 'A'.charCodeAt(0))}/>))
  const visibleRows = Array(visibleRowCount).fill(undefined).map((_, index) => {
      if (rowIDs[index]) {
        return (
          <Row
            key={'Row' + index}
            activateSelectedCell={activateSelectedCell}
            activeCell={activeCell}
            cellCount={visibleColumnCount + 1}
            changeActiveCell={changeActiveCell}
            columnPositions={columnPositions}
            columns={columns}
            createNewColumns={createNewColumns}
            createNewRows={createNewRows}
            isSelectedCell={isSelectedCell}
            modifyCellSelectionRange={modifyCellSelectionRange}
            finishCurrentSelectionRange={finishCurrentSelectionRange}
            newValue={newValue}
            numberOfRows={rowCount}
            row={rows.find(({id}) => id === rowIDs[index])}
            rowIDs={rowIDs}
            rowIndex={index}
            rows={index - rowCount + 1}
            selectCell={selectCell}
          />
        )
      } else if (rowIDs[index-1]) {
        return (
          <BlankClickableRow
            key={'Row' + index}
            cellCount={visibleColumnCount + 1}
            activeCell={activeCell}
            changeActiveCell={changeActiveCell}
            columns={columns}
            createNewRows={createNewRows}
            createNewColumns={createNewColumns}
            finishCurrentSelectionRange={finishCurrentSelectionRange}
            modifyCellSelectionRange={modifyCellSelectionRange}
            numberOfRows={rowCount}
            rowIndex={index}
            rows={index - rowCount + 1}
            selectCell={selectCell}
          />
        )
      } else { return <BlankRow key={'BlankRow' + index} cellCount={visibleColumnCount + 1} />}
  });

  function activateSelectedCell(row, column, newValue) {
    dispatchSpreadsheetAction({type: ACTIVATE_SELECTED_CELL, row, column, newValue})
  }

  function createNewRows(rowCount) {
    dispatchSpreadsheetAction({type: CREATE_ROWS, rowCount});
  }

  function createNewColumns(columnCount) {
    dispatchSpreadsheetAction({type: CREATE_COLUMNS, columnCount});
  }

  function changeActiveCell(row, column, selectionActive) {
    dispatchSpreadsheetAction({type: ACTIVATE_CELL, row, column, selectionActive});
  }

  function selectCell(row, column, selectionActive) {
    dispatchSpreadsheetAction({type: SELECT_CELL, row, column, selectionActive});
  }

  function modifyCellSelectionRange(row, col) {
    dispatchSpreadsheetAction({type: MODIFY_CURRENT_SELECTION_CELL_RANGE, endRangeRow: row, endRangeColumn: col});
  }

  function finishCurrentSelectionRange() {
    dispatchSpreadsheetAction({type: ADD_CURRENT_SELECTION_TO_CELL_SELECTIONS});
  }

  return (
    <div>
      <FormulaBar />
      <table>
        <thead><tr><td></td>{headers}</tr></thead>
        <tbody>{visibleRows}</tbody>
      </table>
    </div>
  );

  // useEffect(() => {
  //   if (activeCell) {
  //     eventBus.fire('select-cell', activeCell);
  //   }
  // }, [activeCell, eventBus]);
  // // set active cell to A1 on first load
  // useEffect(() => {
  //   changeActiveCell(0, 0);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // const formulaParser = new Parser();
  // formulaParser.on('callCellValue', function(cellCoordinates, done) {
  //   const cellValue = cells[cellPositions[cellCoordinates.row.index][cellCoordinates.column.index]].value;
  //   if (isFormula(cellValue)) {
  //     const {error, result} = formulaParser.parse(cellValue.slice(1));
  //     done(error || result);
  //   } else {
  //     done(cellValue);
  //   }
  // });

  // formulaParser.on('callRangeValue', function(startCellCoord, endCellCoord, done) {
  //   const data = cellPositions.slice(startCellCoord.row.index, endCellCoord.row.index + 1).map((row) => {
  //     return row.slice(startCellCoord.column.index, endCellCoord.column.index + 1).map((cellID) => {
  //       return cells[cellID].value;
  //     });
  //   });
  //   done(data);
  // });

  // const columnCount = cellPositions.length ? Math.max(...(cellPositions.map((row) => row.length))) : 0;

  // function modifyCellSelectionRange(row, col) {
  //   dispatchSpreadsheetAction({type: 'modify-current-selection-cell-range', endRangeRow: row, endRangeColumn: col});
  // }

  // function finishCurrentSelectionRange() {
  //   dispatchSpreadsheetAction({type: 'add-current-selection-to-cell-selections'});
  // }

  // const rows = cellPositions.map((row, index) => {
  //   return (<Row key={index} row={row} rowIndex={index} cells={cells} finishCurrentSelectionRange={finishCurrentSelectionRange} modifyCellSelectionRange={modifyCellSelectionRange}
  //      activeCell={activeCell} setActiveCell={changeActiveCell} isSelectedCell={isSelectedCell} formulaParser={formulaParser}/>)
  // });
}

export default Spreadsheet;

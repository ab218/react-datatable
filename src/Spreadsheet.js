import React from 'react';
// import { Parser } from 'hot-formula-parser';
import './App.css';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import ColResizer from './ColResizer';
import ActiveCell from './ActiveCell';

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

function BlankRow({activeCell, row, cellCount, changeActiveCell, createNewRows, createNewColumns, rowIndex, rows, numberOfRows, columns}) {
  return (
    <tr>
      {Array(cellCount).fill(undefined).map((_, columnIndex) => {
        const column = columns[columnIndex - 1];
        if (activeCell && activeCell.column > 0 && activeCell.row === rowIndex && activeCell.column === columnIndex) {
          return (
          <ActiveCell
            key={`row${rowIndex}col${columnIndex}`}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            rows={rows}
            row={row}
            numberOfRows={numberOfRows}
            column={column}
            columns={columns}
            value={''}
            changeActiveCell={changeActiveCell}
            createNewColumns={createNewColumns}
            createNewRows={createNewRows}
            />
          )
        }
        return <td key={`blank_cell${rowIndex}_${columnIndex}`} onClick={() => {
          // JMP allows creation of a row at most 2 from the last one
          // If the row is only one space away from the last row
          if (rows === 1) {
            changeActiveCell(rowIndex, columnIndex)
          }
          // } else {
          //   alert('not allowed');
          // }
        }}></td>
      })}
    </tr>
  );
}

function Row({activeCell, cellCount, columns, row, rows, rowIndex, createNewColumns, createNewRows, changeActiveCell, numberOfRows}) {
  return (
    <tr>
      {Array(cellCount).fill(undefined).map((_, columnIndex) => {
        const column = columns[columnIndex - 1];
        if (columnIndex === 0) {
          // The row # on the left side
          return <td key={`row${rowIndex}col${columnIndex}`}>{rowIndex + 1}</td>
        }
        // console.log('ahoyhoy', activeCell, rowIndex, columnIndex)
        if (activeCell && activeCell.row === rowIndex && activeCell.column === columnIndex) {
          return (
          <ActiveCell
            key={`row${rowIndex}col${columnIndex}`}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            rows={rows}
            row={row}
            numberOfRows={numberOfRows}
            column={column}
            columns={columns}
            value={column ? row[column.id] : ''}
            changeActiveCell={changeActiveCell}
            createNewColumns={createNewColumns}
            createNewRows={createNewRows}
            />
          )
        } else if (column) {
          return (<td key={`row${rowIndex}col${columnIndex}`} onClick={() => changeActiveCell(rowIndex, columnIndex)}>{row[column.id]}</td>)
        } else {
          // The rest of the cells in the row that aren't in a defined column
          return (<td key={`row${rowIndex}col${columnIndex}`} onClick={() => changeActiveCell(rowIndex, columnIndex)}>.</td>)
        }
      })}
    </tr>
  );
}

function Spreadsheet({eventBus}) {
  const {
    activeCell,
    columns,
    rowPositions,
    rows,
   } = useSpreadsheetState();
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

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
      return rowIDs[index]
      ? <Row
          activeCell={activeCell}
          cellCount={visibleColumnCount + 1}
          changeActiveCell={changeActiveCell}
          columns={columns}
          createNewColumns={createNewColumns}
          createNewRows={createNewRows}
          key={'Row'+index}
          numberOfRows={rowCount}
          rows={index - rowCount + 1}
          row={rows.find(({id}) => id === rowIDs[index])}
          rowIndex={index}
          rowIDs={rowIDs}
      />
      : <BlankRow
          activeCell={activeCell}
          cellCount={visibleColumnCount + 1}
          changeActiveCell={changeActiveCell}
          columns={columns}
          createNewRows={createNewRows}
          createNewColumns={createNewColumns}
          key={'Row'+ index}
          numberOfRows={rowCount}
          rows={index - rowCount + 1}
          rowIndex={index}
        />
  });

  function createNewRows(rowCount) {
    dispatchSpreadsheetAction({type: 'createRows', rowCount});
  }

  function createNewColumns(columnCount) {
    dispatchSpreadsheetAction({type: 'createColumns', columnCount});
  }

  function changeActiveCell(row, column) {
    dispatchSpreadsheetAction({type: 'activateCell', row, column});
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

  // function isSelectedCell(row, column) {
  //   function withinRange(value) {
  //     const {top, right, bottom, left} = value;
  //     return row >= top && row <= bottom && column >= left && column <= right;
  //   }

  //   const cell = cellPositions[row] && cellPositions[row][column];
  //   const cellIDFoundinSelection = cell && multiCellSelectionIDs.includes(cell);
  //   const withinASelectedRange = cellSelectionRanges.some(withinRange);
  //   return cellIDFoundinSelection || withinASelectedRange || (currentCellSelectionRange && withinRange(currentCellSelectionRange));
  // }

  // useEffect(() => {
  //   if (activeCell) {
  //     eventBus.fire('select-cell', activeCell);
  //   }
  // }, [activeCell, eventBus]);
  // useEffect(() => {
  //   console.log('cells updated:', cells);
  // }, [cells]);
  // useEffect(() => {
  //   console.log('cell positions:', cellPositions);
  // }, [cellPositions]);
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

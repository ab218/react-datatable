import React, {useEffect} from 'react';
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

function BlankRow({cellCount}) { return <tr>{Array(cellCount).fill(undefined).map((_, columnIndex) => <td key={'blankcol' + columnIndex}></td>)}</tr> }

function RowNumberCell({rowIndex}) { return <td key={`RowNumber${rowIndex}`}>{rowIndex + 1}</td> }

function BlankClickableRow({activeCell, finishCurrentSelectionRange, modifyCellSelectionRange, row, cellCount, changeActiveCell, createNewRows, createNewColumns, rowIndex, rows, numberOfRows, columns}) {
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
              changeActiveCell(rowIndex, columnIndex, event.ctrlKey || event.shiftKey || event.metaKey);
            }}
            onMouseMove={(event) => {
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

function SelectedCell({changeActiveCell, finishCurrentSelectionRange, modifyCellSelectionRange, row, rowIndex, column, columnIndex}) {
  return <td
  key={`row${rowIndex}col${columnIndex}`}
  style={{backgroundColor: '#f0f0f0'}}
  onMouseDown={(event) => {
    changeActiveCell(rowIndex, columnIndex, event.ctrlKey || event.shiftKey || event.metaKey);
  }}
  onMouseMove={(event) => {
    if (typeof event.buttons === 'number' && event.buttons > 0) {
      modifyCellSelectionRange(rowIndex, columnIndex, true);
    }
  }}
  onMouseUp={() => {finishCurrentSelectionRange()}}
  >
  {row[column.id]}</td>
}

function NormalCell({changeActiveCell, finishCurrentSelectionRange, modifyCellSelectionRange, row, rowIndex, column, columnIndex}) {
  return (
  <td
    key={`row${rowIndex}col${columnIndex}`}
    onMouseDown={(event) => {
      changeActiveCell(rowIndex, columnIndex, event.ctrlKey || event.shiftKey || event.metaKey);
    }}
    onMouseMove={(event) => {
      if (typeof event.buttons === 'number' && event.buttons > 0) {
        modifyCellSelectionRange(rowIndex, columnIndex, true);
      }
    }}
    onMouseUp={() => {finishCurrentSelectionRange()}}
    >
  {row[column.id]}</td>
  )}

function Row({activeCell, finishCurrentSelectionRange, modifyCellSelectionRange, multiCellSelectionIDs, isSelectedCell, cellCount, columns, row, rows, rowIndex, createNewColumns, createNewRows, changeActiveCell, numberOfRows}) {
  return (
    <tr>
      {Array(cellCount).fill(undefined).map((_, columnIndex) => {
        const column = columns[columnIndex - 1];

        if (columnIndex === 0) {
          // The row # on the left side
          return <RowNumberCell rowIndex={rowIndex}/>
        }
        if (activeCell && activeCell.row === rowIndex && activeCell.column === columnIndex) {
          return (
          <ActiveCell
            key={`row${rowIndex}col${columnIndex}`}
            changeActiveCell={changeActiveCell}
            column={column}
            columnIndex={columnIndex}
            columns={columns}
            createNewColumns={createNewColumns}
            createNewRows={createNewRows}
            numberOfRows={numberOfRows}
            row={row}
            rowIndex={rowIndex}
            rows={rows}
            value={column ? row[column.id] : ''}
            />
          )
        } else if (isSelectedCell(rowIndex, columnIndex)) {
          return (
          <SelectedCell
            changeActiveCell={changeActiveCell}
            finishCurrentSelectionRange={finishCurrentSelectionRange}
            modifyCellSelectionRange={modifyCellSelectionRange}
            row={row} column={column}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            />)
        } else if (column) {
          return (
            <NormalCell
              changeActiveCell={changeActiveCell}
              finishCurrentSelectionRange={finishCurrentSelectionRange}
              modifyCellSelectionRange={modifyCellSelectionRange}
              row={row}
              column={column}
              rowIndex={rowIndex}
              columnIndex={columnIndex}
            />)
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
    cellSelectionRanges,
    currentCellSelectionRange,
    multiCellSelectionIDs,
    rowPositions,
    rows,
   } = useSpreadsheetState();
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  function isSelectedCell(row, column) {
    function withinRange(value) {
      const {top, right, bottom, left} = value;
      return row >= top && row <= bottom && column >= left && column <= right;
    }

    const cell = {row, column}
    const cellIDFoundinSelection = cell && multiCellSelectionIDs.some(id => cell.row === id.row && cell.column === id.column);
    const withinASelectedRange = cellSelectionRanges.some(withinRange);
    return cellIDFoundinSelection || withinASelectedRange || (currentCellSelectionRange && withinRange(currentCellSelectionRange));
  }

  // useEffect(() => {
  //   console.log(rows)
  //   console.log(columns)
  //   console.log(rowPositions)
  // })

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
          key={'Row'+index}
          activeCell={activeCell}
          cellCount={visibleColumnCount + 1}
          changeActiveCell={changeActiveCell}
          columns={columns}
          createNewColumns={createNewColumns}
          createNewRows={createNewRows}
          isSelectedCell={isSelectedCell}
          modifyCellSelectionRange={modifyCellSelectionRange}
          finishCurrentSelectionRange={finishCurrentSelectionRange}
          multiCellSelectionIDs={multiCellSelectionIDs}
          numberOfRows={rowCount}
          row={rows.find(({id}) => id === rowIDs[index])}
          rowIDs={rowIDs}
          rowIndex={index}
          rows={index - rowCount + 1}
      />)} else if (rowIDs[index-1]) {
        return (
          <BlankClickableRow
            key={'Row'+ index}
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
          />
        )} else {
        return <BlankRow key={'BlankRow'+ index} cellCount={visibleColumnCount + 1} />
      }
  });

  function createNewRows(rowCount) {
    dispatchSpreadsheetAction({type: 'createRows', rowCount});
  }

  function createNewColumns(columnCount) {
    dispatchSpreadsheetAction({type: 'createColumns', columnCount});
  }

  function changeActiveCell(row, column, selectionActive) {
    dispatchSpreadsheetAction({type: 'activateCell', row, column, selectionActive});
  }

  function modifyCellSelectionRange(row, col) {
    dispatchSpreadsheetAction({type: 'modify-current-selection-cell-range', endRangeRow: row, endRangeColumn: col});
  }

  function finishCurrentSelectionRange() {
    dispatchSpreadsheetAction({type: 'add-current-selection-to-cell-selections'});
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

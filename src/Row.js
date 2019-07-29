import React from 'react';
import ActiveCell from './ActiveCell';

function RowNumberCell({rowIndex}) { return <td>{rowIndex + 1}</td> }

function SelectedCell({changeActiveCell, finishCurrentSelectionRange, modifyCellSelectionRange, row, rowIndex, column, columnIndex}) {

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

function NormalCell({selectCell, finishCurrentSelectionRange, modifyCellSelectionRange, row, rowIndex, column, columnIndex}) {
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

export default function Row({
  activeCell,
  cellCount,
  columnPositions,
  columns,
  changeActiveCell,
  createNewColumns,
  createNewRows,
  finishCurrentSelectionRange,
  isSelectedCell,
  modifyCellSelectionRange,
  numberOfRows,
  row,
  rows,
  rowIndex,
  selectCell,
}) {
  columns.sort((colA, colB) => {
    return columnPositions[colA.id] - columnPositions[colB.id];
  });
  return (
    <tr>
      {Array(cellCount).fill(undefined).map((_, columnIndex) => {
        const column = columns[columnIndex - 1];
        if (columnIndex === 0) {
          // The row # on the left side
          return <RowNumberCell key={`RowNumberCell${rowIndex}`} rowIndex={rowIndex}/>
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
        } else if (column && isSelectedCell(rowIndex, columnIndex)) {
          return (
            <SelectedCell
              key={`Row${rowIndex}Col${columnIndex}`}
              changeActiveCell={changeActiveCell}
              column={column}
              columnIndex={columnIndex}
              finishCurrentSelectionRange={finishCurrentSelectionRange}
              modifyCellSelectionRange={modifyCellSelectionRange}
              row={row}
              rowIndex={rowIndex}
            />
          )
        } else if (column) {
          return (
            <NormalCell
              key={`Row${rowIndex}Col${columnIndex}`}
              changeActiveCell={changeActiveCell}
              column={column}
              columnIndex={columnIndex}
              finishCurrentSelectionRange={finishCurrentSelectionRange}
              modifyCellSelectionRange={modifyCellSelectionRange}
              row={row}
              rowIndex={rowIndex}
              selectCell={selectCell}
            />
          )
        } else {
          // The rest of the cells in the row that aren't in a defined column
          return (<td key={`row${rowIndex}col${columnIndex}`} onClick={() => changeActiveCell(rowIndex, columnIndex)}>.</td>)
        }
      })}
    </tr>
  );
}
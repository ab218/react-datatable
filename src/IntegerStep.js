import React, { useState } from 'react';
import { Slider, Row, Col } from 'antd';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';

export default function IntegerStep({column }) {

  const dispatchSpreadsheetAction = useSpreadsheetDispatch();
  const { colMin, colMax, rows } = useSpreadsheetState();

  const [minVal, setMinVal] = useState(colMin || 0);
  const [maxVal, setMaxVal] = useState(colMax || 20);

  function filterRows(colID, lowerBounds, upperBounds) {
    return rows.filter(row => {
      if (row[colID] >= lowerBounds && row[colID] <= upperBounds) {
        return row;
      } return null;
    })
  }

  const onChange = value => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    dispatchSpreadsheetAction({type: 'FILTER_COLUMN', filteredRows: filterRows(column.id, value[0], value[1])});
  };

  return (
    <Row style={{display: 'flex', justifyContent: 'center'}}>
      <Col style={{textAlign: 'center'}} span={12}>
        <span style={{alignSelf: 'center', fontSize: '1.1em', minWidth: 100, textAlign: 'center'}}>{`${minVal} ≤ ${column.label} ≤ ${maxVal}`}</span>
        <Slider
          min={colMin || 0}
          max={colMax || 20}
          range={true}
          defaultValue={[colMin, colMax] || [0, 20]}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
}


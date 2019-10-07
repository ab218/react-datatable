import React, { useState } from 'react';
import { Slider, Row, Col } from 'antd';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { FILTER_COLUMN } from './constants';

export default function IntegerStep({column, colMin, colMax, selectedColumns, setSelectedColumns}) {

  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  const [minVal, setMinVal] = useState(colMin || 0);
  const [maxVal, setMaxVal] = useState(colMax || 20);

  const onChange = value => {
    const min = value[0];
    const max = value[1];
    setMinVal(min);
    setMaxVal(max);
    setSelectedColumns(old => {
      const oldCopy = [...old];
      const filtered = oldCopy.find(f => f.id === column.id);
      const index = oldCopy.findIndex(col => col.id === column.id);
      filtered.min = min;
      filtered.max = max;
      const sliced = oldCopy.slice(0, index).concat(filtered).concat(oldCopy.slice(index + 1))
      return sliced;
    })
    dispatchSpreadsheetAction({type: FILTER_COLUMN, unfilteredRows: selectedColumns});
  };

  return (
    <Row style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
      <Col style={{textAlign: 'center', width: 300}} span={12}>
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


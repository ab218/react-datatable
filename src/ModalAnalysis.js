import React, { useState } from 'react';
import { Button, Card, Icon, Modal, Radio } from 'antd';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { TOGGLE_ANALYSIS_MODAL, PERFORM_ANALYSIS } from './constants';

const styles = {
  cardWithBorder: {
    border: '1px solid lightgray',
    width: 200,
    minHeight: 100
},
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexSpaced: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  radioButton: {
    fontSize: 14,
    padding: 0,
    margin: 0,
    borderRadius: 0,
    overflow: 'hidden',
    border: '1px solid lightgray'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    borderRadius: 0,
    padding: 0,
    margin: 0,
  },
}

export default function AnalysisModal() {
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedRightColumn, setSelectedRightColumn] = useState(null);
  const [xCol, setXCol] = useState([]);
  const [yCol, setYCol] = useState([]);
  const { analysisModalOpen, columns } = useSpreadsheetState();
  const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  function handleModalClose() {
    dispatchSpreadsheetAction({type: TOGGLE_ANALYSIS_MODAL, analysisModalOpen: false });
  }

  function addColumnToList(col, setCol) {
    if (!selectedColumn || col.length > 0) return;
    setSelectedRightColumn(selectedColumn);
    setCol(prevState => prevState.concat(selectedColumn));
  }

  function removeColumnFromList(setCol) {
    if (!selectedRightColumn) return;
    setSelectedRightColumn(null);
    setCol(prevState => prevState.filter(col => col !== selectedRightColumn));
  }

  function openAnalysisWindow() {
    dispatchSpreadsheetAction({type: PERFORM_ANALYSIS })
  }

  function RadioGroup({data, setData, styleProps}) {
    console.log(arguments)
    return (
      <Card bordered style={{...styles.cardWithBorder, ...styleProps}}>
        <Radio.Group style={styles.radioGroup} buttonStyle='solid'>
          {data.map(column => <Radio.Button style={styles.radioButton} key={column.id} onClick={() => setData(column)} value={column}>{column.label}</Radio.Button>)}
        </Radio.Group>
      </Card>
    )
  }

  function CaratButtons({data, setData, axis}) {
    return (
      <div style={styles.flexColumn}>
        <Button onClick={() => addColumnToList(data, setData)}>{axis}
          <Icon type="right" />
        </Button>
        {data.length !== 0 &&
          <Button onClick={() => removeColumnFromList(setData)}>{axis}
            <Icon type="left" />
          </Button>
        }
      </div>
    )
  }

  return (
    <div>
      <Modal
        className="ant-modal"
        // destroyOnClose
        onCancel={handleModalClose}
        onOk={openAnalysisWindow}
        title="Fit Y by X"
        visible={analysisModalOpen}
        width={600}
        bodyStyle={{background: '#ECECEC'}}
      >
        <div style={styles.flexSpaced}>
          <div>Select Column <em>({columns.length} columns)</em>
            <Card bordered style={{ marginTop: 20, ...styles.cardWithBorder}}>
              <Radio.Group style={styles.radioGroup} buttonStyle='solid'>
                {columns.map(column => <Radio.Button style={styles.radioButton} key={column.id} onClick={() => setSelectedColumn(column)} value={column}>{column.label}</Radio.Button>)}
              </Radio.Group>
            </Card>
            {/* <RadioGroup data={columns} setData={setSelectedColumn} /> */}
          </div>
          <div style={{width: 300}}>Cast Selected Columns into Roles
            <div style={{marginBottom: 20, marginTop: 20, ...styles.flexSpaced }}>
              <CaratButtons data={yCol} setData={setYCol} axis='Y' />
              <RadioGroup data={yCol} setData={setSelectedRightColumn} />
            </div>
            <div style={styles.flexSpaced}>
              <CaratButtons data={xCol} setData={setXCol} axis='X' />
              <RadioGroup data={xCol} setData={setSelectedRightColumn} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
};
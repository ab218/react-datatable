import React from 'react';
import './App.css';
import Spreadsheet from './Spreadsheet';
import {SpreadsheetProvider} from './SpreadsheetProvider';
import EventBus from './eventbus.js';

const eventBus = new EventBus('spreadsheet-events', console.debug);
eventBus.subscribe('select-cell', function handlingCellSelection() {
  console.log('handling cell selection:', arguments);
});


function App() {
  return (
    <div className="App">
      <SpreadsheetProvider>
        <Spreadsheet eventBus={eventBus}/>
        <div id="container"></div>
      </SpreadsheetProvider>
    </div>
  );
}

export default App;

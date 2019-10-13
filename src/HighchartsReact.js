import { useEffect } from 'react';
// import regression from 'regression';
import { OPEN_ANALYSIS_WINDOW } from './constants';
import axios from 'axios';
import './App.css';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { jStat } from 'jstat';

/*
Linear regression and correlation (Yes to all of these)
Calculate slope and intercept with 95% confidence intervals.
Calculate correlation coefficient (Spearman or Pearson) and its confidence interval.
Test for departure from linearity with a runs test or the F test for linearity.
Arrows in modal
*/

export default function HighchartsDemo () {
  const {
    columns,
    rows,
    analysisWindowOpen,
    xColData,
    yColData
   } = useSpreadsheetState();
   const dispatchSpreadsheetAction = useSpreadsheetDispatch();

  useEffect(() => {
    const colX = xColData || columns[0];
    const colY = yColData || columns[2];
    const colXLabel = colX.label;
    const colYLabel = colY.label;
    function mapColumnValues(colID) { return rows.map(row => Number(row[colID])).filter(x=>x) }
    const colA = mapColumnValues(colX.id);
    const colB = mapColumnValues(colY.id);

    async function getPyVals() {
      // const lambda = 'https://8gf5s84idd.execute-api.us-east-2.amazonaws.com/test/scipytest';
      const gcloud = 'https://us-central1-optimum-essence-210921.cloudfunctions.net/statsmodels';
      const result = await axios.post(gcloud, {
        x: colA,
        y: colB
      }, {
        crossDomain: true,
      })
      console.log(result.data) // gcloud
      // console.log(result.data.body); // Lambda
      function mapBand(position) {
        return result.data.predictions.map(point => {
          return [point.x, point[position]]
        })
      }
      const { mean_x, mean_y, std_x, std_y, pvalues, fitted_values, rsquared, corrcoef, cov, slope, intercept } = result.data
      await dispatchSpreadsheetAction({
        type: OPEN_ANALYSIS_WINDOW,
        outputData: {
          upperBand: mapBand('upper'),
          lowerBand: mapBand('lower'),
          corrcoef: corrcoef[1][0],
          covariance: cov[1][0],
          colXLabel,
          colAMean: mean_x,
          colAStdev: std_x,
          colYLabel,
          colBMean: mean_y,
          colBStdev: std_y,
          pValue: pvalues[1],
          tempABVals,
          boxPlotData: getBoxValues(colB),
          linearRegressionLinePoints: fitted_values,
          linearRegressionLineR2: rsquared,
          linearRegressionLineSlope: slope,
          linearRegressionLineYIntercept: intercept,
          linearRegressionLineEquation: `${colYLabel} = ${slope.toFixed(4)}*(${colXLabel}) + ${intercept}`,
        }
      })
    }

    getPyVals()

  const tempABVals = colA.map((_, i) => {
    return [(colA[i]), (colB[i])]
  }).sort();

  // const numberOfBoxes = Array.from(new Set(colA)).length
  // const numberOfPoints = colB.length;
  // const cats = alphaCats(numberOfBoxes);
  const outliers = [];

    //-----------------------------------------------------
    //build the data and add the series to the chart
    // const boxData = [],
      // meanData = [];
    // for (var i = 0; i < numberOfBoxes; i++) {
      //generate random data, then calculate box plot values
      // const data = randomData(
      //   numberOfPoints, //how many points
      //   false, //restrict to positive?
      //   (10 * Math.random()) //random multiplication factor
      // );
      // const data = [];
      // console.log(data, 'what data looks like: ')
      // const boxValues = getBoxValues(data, i);
      // boxData.push(boxValues.values);
      // meanData.push([i, mean(data)]);
    // }
    // console.log(jStat.quantiles(colB, [.25, .5, .75]))
  //-----------------------------------------------
  //wrap the percentile calls in one method
    function getBoxValues(data, x) {
      x = typeof x === 'undefined' ? 0 : x;
      const quantiles = jStat.quantiles(data, [.25, .5, .75])
      const boxData = {},
        min = Math.min.apply(Math, data),
        max = Math.max.apply(Math, data),
        q1 = quantiles[0],
        median = quantiles[1],
        q3 = quantiles[2],
        iqr = q3 - q1,
        lowerFence = q1 - (iqr * 1.5),
        upperFence = q3 + (iqr * 1.5);

        for (var i = 0; i < data.length; i++) {
          if (data[i] < lowerFence || data[i] > upperFence) {
            outliers.push(data[i]);
          }
        }
          boxData.values = {};
          boxData.values.x = x;
          boxData.values.low = min;
          boxData.values.q1 = q1;
          boxData.values.median = median;
          boxData.values.q3 = q3;
          boxData.values.high = max;
          boxData.outliers = outliers;
          return boxData;
       }
    // getBoxValues(colB)
    // const linearRegressionLine = regression.linear(tempABVals, { precision: 5 });
    // const corrcoeff = jStat.corrcoeff(colA, colB).toFixed(5);
    // const covariance = jStat.covariance(colB, colA).toFixed(4);
    // const colAMean = jStat.mean(colA).toFixed(3);
    // const colBMean = jStat.mean(colB).toFixed(3);
    // const colAStdev = jStat.stdev(colA).toFixed(4);
    // const colBStdev = jStat.stdev(colB).toFixed(4);
    // const pValue = get_t_test(colA, colB)[1];

  }, [analysisWindowOpen, columns, dispatchSpreadsheetAction, rows, xColData, yColData])
  return null;
}
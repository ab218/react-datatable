import { useEffect } from 'react';
import regression from 'regression';
import { OPEN_ANALYSIS_WINDOW } from './constants'
// import PolyRegression from "js-polynomial-regression";
// import mwu from 'mann-whitney-utest';
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
  function get_t_test(t_array1, t_array2){
    const meanA = jStat.mean(t_array1);
    const meanB = jStat.mean(t_array2);
    const S2=(jStat.sum(jStat.pow(jStat.subtract(t_array1,meanA),2)) + jStat.sum(jStat.pow(jStat.subtract(t_array2,meanB),2)))/(t_array1.length+t_array2.length-2);
    const t_score = (meanA - meanB)/Math.sqrt(S2/t_array1.length+S2/t_array2.length);
    const t_pval = jStat.studentt.cdf(-Math.abs(t_score), t_array1.length+t_array2.length-2) * 2;
    return [t_score, t_pval];
  }

  useEffect(() => {
    const colX = xColData || columns[0];
    const colY = yColData || columns[2];
    const colXLabel = colX.label;
    const colYLabel = colY.label;
    function mapColumnValues(colID) { return rows.map(row => Number(row[colID])).filter(x=>x) }
    const colA = mapColumnValues(colX.id);
    const colB = mapColumnValues(colY.id);
    // const jObj = jStat([colA, colB])

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

    console.log('get-t-test: ', get_t_test(colA, colB))
    const linearRegressionLine = regression.linear(tempABVals, { precision: 5 });
    const corrcoeff = jStat.corrcoeff(colA, colB).toFixed(5);
    // const spearman = jStat.spearmancoeff(colA, colB);
    const covariance = jStat.covariance(colB, colA).toFixed(4);
    const colAMean = jStat.mean(colA).toFixed(3);
    const colBMean = jStat.mean(colB).toFixed(3);
    const colAStdev = jStat.stdev(colA).toFixed(4);
    const colBStdev = jStat.stdev(colB).toFixed(4);
    let pValue = get_t_test(colA, colB)[1].toFixed(6);

    dispatchSpreadsheetAction({
      type: OPEN_ANALYSIS_WINDOW,
      outputData: {
        corrcoeff,
        covariance,
        colXLabel,
        colAMean,
        colAStdev,
        colYLabel,
        colBMean,
        colBStdev,
        pValue,
        tempABVals,
        boxPlotData: getBoxValues(colB),
        linearRegressionLinePoints: linearRegressionLine.points,
        linearRegressionLineR2: linearRegressionLine.r2,
        linearRegressionLineSlope: linearRegressionLine.equation[0],
        linearRegressionLineYIntercept: linearRegressionLine.equation[1],
        linearRegressionLineEquation: linearRegressionLine.string,
      }
    })
  }, [analysisWindowOpen, columns, dispatchSpreadsheetAction, rows, xColData, yColData])
  return null;
}
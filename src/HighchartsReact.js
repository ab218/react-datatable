import { useEffect } from 'react';
import regression from 'regression';
// import PolyRegression from "js-polynomial-regression";
// import mwu from 'mann-whitney-utest';
import './App.css';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { jStat } from 'jstat';

// import ttest from 'ttest';

/*
Linear regression and correlation (Yes to all of these)
Calculate slope and intercept with 95% confidence intervals.
Calculate correlation coefficient (Spearman or Pearson) and its confidence interval.
Test for departure from linearity with a runs test or the F test for linearity.
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
   // TODO: Think of a way to only have one window open at a time.
   console.log('a')
   useEffect(() => {
    const colX = xColData || columns[0];
    const colY = yColData || columns[6];
    const colXLabel = colX.label;
    const colYLabel = colY.label;
    function mapColumnValues(colID) { return rows.map(row => Number(row[colID])).filter(x=>x) }
    const colA = mapColumnValues(colX.id);
    const colB = mapColumnValues(colY.id);
    console.log(colA, colB)
    const tempABVals = colA.map((_, i) => {
      return [(colA[i]), (colB[i])]
    }).sort();
    console.log(get_t_test(colA, colB))
    const jTest = jStat(colB);
    // colA.forEach(t => {
    //   console.log(jStat.tscore(colA));
    // })
    console.log('jTest t-score for 3.25 given:', colB, 'is:', jTest.tscore(3.25));
    console.log('t test', jStat.ttest(colB, 4));
    const linearRegressionLine = regression.linear(tempABVals, { precision: 5 });
    const corrcoeff = jStat.corrcoeff(colA, colB).toFixed(5);
    // const spearman = jStat.spearmancoeff(colA, colB);
    const covariance = jStat.covariance(colB, colA);
    const colAMean = jStat.mean(colA).toFixed(3);
    const colBMean = jStat.mean(colB).toFixed(3);
    const colAStdev = jStat.stdev(colA).toFixed(4);
    const colBStdev = jStat.stdev(colB).toFixed(4);

    dispatchSpreadsheetAction({
      type: 'OPEN_ANALYSIS_WINDOW',
      outputData: {
        corrcoeff,
        covariance,
        colXLabel,
        colAMean,
        colAStdev,
        colYLabel,
        colBMean,
        colBStdev,
        tempABVals,
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
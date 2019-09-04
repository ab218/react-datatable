import React, { useEffect, useState } from 'react';
import regression from 'regression';
// import PolyRegression from "js-polynomial-regression";
// import mwu from 'mann-whitney-utest';
import './App.css';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { jStat } from 'jstat';
import HighchartsReact from 'highcharts-react-official';

// import ttest from 'ttest';

/*
Linear regression and correlation (Yes to all of these)
Calculate slope and intercept with 95% confidence intervals.
Calculate correlation coefficient (Spearman or Pearson) and its confidence interval.
Test for departure from linearity with a runs test or the F test for linearity.
*/

export default function HighchartsDemo () {
  const { Highcharts } = window;
  const {
    columns,
    rows,
    analysisWindowOpen,
    xColData,
    yColData
   } = useSpreadsheetState();
   const dispatchSpreadsheetAction = useSpreadsheetDispatch();

   const [hOptions, setHOptions ] = useState(null);
   const [template, setTemplate] = useState(null);

  function get_t_test(t_array1, t_array2){
    const meanA = jStat.mean(t_array1);
    const meanB = jStat.mean(t_array2);
    const S2=(jStat.sum(jStat.pow(jStat.subtract(t_array1,meanA),2)) + jStat.sum(jStat.pow(jStat.subtract(t_array2,meanB),2)))/(t_array1.length+t_array2.length-2);
    const t_score = (meanA - meanB)/Math.sqrt(S2/t_array1.length+S2/t_array2.length);
    const t_pval = jStat.studentt.cdf(-Math.abs(t_score), t_array1.length+t_array2.length-2) * 2;
    return [t_score, t_pval];
}
   // TODO: Think of a way to only have one window open at a time.

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

    const options = {
      chart: {
        marginTop: 50,
        height: 400,
        width: 400
      },
      credits: false,
      title: {
        text: `${colYLabel} by ${colXLabel}`
      },
      xAxis: {
        title: { text: colXLabel },
        min: 0
      },
      yAxis: {
        title: { text: colYLabel },
        min: 0
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          events: {
            legendItemClick: function () {
              if (this.visible) {
                return false;
              } else {
                let series = this.chart.series,
                i = series.length,
                otherSeries;
                while (i--) {
                  otherSeries = series[i]
                  if (otherSeries !== this && otherSeries.visible) {
                    otherSeries.hide();
                  }
                }
              }
            }
          },
        }
      },
      series: [
        {
          name: 'Points with Linear Regression Line',
          type: 'scatter',
          id: 's2',
          data: tempABVals,
        },
        {
          name: 'Linear Regression Line',
          type: 'line',
          linkedTo: 's2',
          data: linearRegressionLine.points,
        },
        {
          name: 'Points',
          type: 'scatter',
          id: 's1',
          data: tempABVals,
          visible: false,
        },
        {
          name: 'Histogram',
          type: 'column',
          zIndex: -1,
          visible: false,
          data: tempABVals,
        },
      ],

      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
    }
    setHOptions(options);
    setTemplate({
      corrcoeff,
      covariance,
      linearRegressionLine,
      colXLabel,
      colAMean,
      colAStdev,
      colYLabel,
      colBMean,
      colBStdev,
    })
  }, [Highcharts, analysisWindowOpen, columns, dispatchSpreadsheetAction, rows, xColData, yColData])
  return (
    <>
      <HighchartsReact highcharts={Highcharts} options={hOptions}/>
        {template
          && <div style={{textAlign: 'center', margin: '0 3em'}}>
          <h4>Summary Statistics</h4>
            <table style={{width: '100%'}}>
              <tr>
                <td>Pearson's Correlation:</td>
                <td>{template.corrcoeff}</td>
              </tr>
              <tr>
                <td>Covariance:</td>
                <td>{template.covariance}</td>
              </tr>
              <tr>
                <td>Count:</td>
                <td>{template.linearRegressionLine.points.length}</td>
              </tr>
            </table>
            <br/>
            <table style={{width: '100%'}}>
              <tr>
                <td style={{fontWeight: 'bold'}}>Variable</td>
                <td style={{fontWeight: 'bold'}}>Mean</td>
                <td style={{fontWeight: 'bold'}}>Std Dev</td>
              </tr>
              <tr>
                <td>{template.colXLabel}</td>
                <td>{template.colAMean}</td>
                <td>{template.colAStdev}</td>
              </tr>
              <tr>
                <td>{template.colYLabel}</td>
                <td>{template.colBMean}</td>
                <td>{template.colBStdev}</td>
              </tr>
            </table>
          <h4>Linear Fit</h4>
          <table style={{width: '100%'}}>
            <tr>
              <td>r2:</td>
              <td>{template.linearRegressionLine.r2}</td>
            </tr>
            <tr>
              <td>slope:</td>
              <td>{template.linearRegressionLine.equation[0]}</td>
            </tr>
            <tr>
              <td>y-intercept:</td>
              <td>{template.linearRegressionLine.equation[1]}</td>
            </tr>
            <tr>
              <td>equation:</td>
              <td>{template.linearRegressionLine.string}</td>
            </tr>
          </table>
        </div>
      }
    </>
  )
}
/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import regression from 'regression';
// import PolyRegression from "js-polynomial-regression";
// import mwu from 'mann-whitney-utest';
import './App.css';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { OPEN_ANALYSIS_WINDOW } from './constants';
import { jStat } from 'jstat';
import HighchartsPortal from './Portal';
// import * as AnnotationsModule from 'highcharts/modules/annotations';
// AnnotationsModule(Highcharts);

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

    if (analysisWindowOpen) {
            // annotationScript = chartWindow.document.createElement("script"),
            // jQuery = chartWindow.document.createElement("script"),
            // highchartsElem = chartWindow.document.createElement("script"),
            const chartContainer = document.createElement("div"),
            chartList = document.createElement("ul");

      // Object.assign(jQuery, {
      //   src: "https://code.jquery.com/jquery-3.4.1.min.js",
      //   // integrity: "sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=",
      //   // crossorigin: "anonymous"
      // });
      // highchartsElem.src = 'https://code.highcharts.com/highcharts.js';
      // annotationScript.src = window.location.href + '/annotations.js';

      // chartWindow.document.head.appendChild(jQuery);
      // chartWindow.document.head.appendChild(highchartsElem);
      // chartWindow.document.head.appendChild(annotationScript);

      chartContainer.setAttribute("id", "container");
      chartList.setAttribute("id", "list");

      const options = {
        chart: {
          // zoomType: 'xy',
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
          // tickInterval: 10,
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
            // allowPointSelect: true,
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
            // pointStart: 0
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

      // chartWindow.postMessage('hello HELLO', '*');

      Highcharts.chart(chartContainer, options)

        const tableOutputTemplate = `
          <div style="text-align: center; margin: 0 3em;">
            <h4>Summary Statistics</h4>
              <table style="width: 100%;">
                <tr>
                  <td>Pearson's Correlation:</td>
                  <td>${corrcoeff}</td>
                </tr>
                <tr>
                  <td>Covariance:</td>
                  <td>${covariance}</td>
                </tr>
                <tr>
                  <td>Count:</td>
                  <td>${linearRegressionLine.points.length}</td>
                </tr>
              </table>
              <br>
              <table style="width: 100%;">
                <tr>
                  <td style="font-weight: bold;">Variable</td>
                  <td style="font-weight: bold;">Mean</td>
                  <td style="font-weight: bold;">Std Dev</td>
                </tr>
                <tr>
                  <td>${colXLabel}</td>
                  <td>${colAMean}</td>
                  <td>${colAStdev}</td>
                </tr>
                <tr>
                  <td>${colYLabel}</td>
                  <td>${colBMean}</td>
                  <td>${colBStdev}</td>
                </tr>
              </table>
            <h4>Linear Fit</h4>
            <table style="width: 100%;">
              <tr>
                <td>r2:</td>
                <td>${linearRegressionLine.r2}</td>
              </tr>
              <tr>
                <td>slope:</td>
                <td>${linearRegressionLine.equation[0]}</td>
              </tr>
              <tr>
                <td>y-intercept:</td>
                <td>${linearRegressionLine.equation[1]}</td>
              </tr>
              <tr>
                <td>equation:</td>
                <td>${linearRegressionLine.string}</td>
              </tr>
            </table>
          </div>
        `

        const doc = new DOMParser().parseFromString(tableOutputTemplate, 'text/html');
        // chartWindow.document.body.appendChild(chartContainer);
        chartContainer.appendChild(doc.body.firstChild);
        dispatchSpreadsheetAction({type: OPEN_ANALYSIS_WINDOW, analysisWindowOpen: false })
    }
  }, [Highcharts, analysisWindowOpen, columns, dispatchSpreadsheetAction, rows, xColData, yColData])
  return <HighchartsPortal data={99} />;
}
/* eslint-disable no-undef */
import { useEffect } from 'react';
import regression from 'regression';
// import PolyRegression from "js-polynomial-regression";
// import mwu from 'mann-whitney-utest';
import './App.css';
import { useSpreadsheetState, useSpreadsheetDispatch } from './SpreadsheetProvider';
import { OPEN_ANALYSIS_WINDOW } from './constants';
import { jStat } from 'jstat';

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

   // TODO: Think of a way to only have one window open at a time.

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

  const linearRegressionLine = regression.linear(tempABVals, { precision: 5 });

  const corrcoeff = jStat.corrcoeff(colA, colB).toFixed(5);
  // const spearman = jStat.spearmancoeff(colA, colB);
  const covariance = jStat.covariance(colA, colB);
  const colAMean = jStat.mean(colA).toFixed(3);
  const colBMean = jStat.mean(colB).toFixed(3);
  const colAStdev = jStat.stdev(colA).toFixed(4);
  const colBStdev = jStat.stdev(colB).toFixed(4);
// console.log([colA[0], colA[colA.length-1]])
// const lr = linearRegression([[colA[0], colB[0]], [colA[colA.length-1], colB[colB.length-1]]])
// console.log(linearRegressionLine)
// console.log(lr)
// console.log(lrl(lr)(50))


  // console.log(ttest(colA), {mu: 1}.valid());

  // for (let i = 0; i < colA.length; i++) {
    // console.log(jStat.ttest([1, 2, 3, 4, 5, 6,]))
  // }



  // const tempABValsPoly = colA.map((_, i) => {
  //   return {x: colB[i], y: colA[i]}
  // }).sort();
  //Factory function - returns a PolynomialRegression instance. 2nd argument is the degree of the desired polynomial equation.
  // const model = PolyRegression.read(tempABValsPoly, 3);
  //terms is a list of coefficients for a polynomial equation. We'll feed these to predict y so that we don't have to re-compute them for every prediction.
  // const terms = model.getTerms();
  // console.log(terms) // Poly regression coefficients
  // const polyregData = colA.map(x => {
  //   return [x, model.predictY(terms, x)];
  // });

  // console.log(polyregData);

  useEffect(() => {
    if (analysisWindowOpen) {
      const chartWindow = window.open("", "_blank", "left=9999,top=100,width=450,height=850"),
            chartContainer = document.createElement("div"),
            chartList = document.createElement("ul");

      chartContainer.setAttribute("id", "container");
      chartList.setAttribute("id", "list");

      Highcharts.chart(chartContainer, {
        chart: {
          // zoomType: 'xy',
          height: 400,
          width: 400
      },
        credits: false,
        title: {
          text: `${colYLabel} by ${colXLabel}`
        },
        xAxis: {
          title: { text: colXLabel },
          alignTicks: false,
          tickInterval: 5,
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
            allowPointSelect: true,
            label: {
              connectorAllowed: false
            },
            pointStart: 0
          }
        },
        annotations: [{
          title: {
              text: '<span style="">drag me anywhere <br> dblclick to remove</span>',
              style: {
                  color: 'red'
              }
          },
          anchorX: "left",
          anchorY: "top",
          allowDragX: true,
          allowDragY: true,
          x: 515,
          y: 155
        }, {
            title: 'drag me <br> horizontaly',
            anchorX: "left",
            anchorY: "top",
            allowDragY: false,
            allowDragX: true,
            xValue: 4,
            yValue: 10,
            shape: {
                type: 'path',
                params: {
                    d: ['M', 0, 0, 'L', 110, 0],
                    stroke: '#c55'
                }
            }
        }, {
            title: 'on point <br> drag&drop <br> disabled',
            linkedTo: 'high',
            allowDragY: false,
            allowDragX: false,
            anchorX: "center",
            anchorY: "center",
            shape: {
                type: 'circle',
                params: {
                    r: 40,
                    stroke: '#c55'
                }
            }
        }, {
            x: 100,
            y: 200,
            title: 'drag me <br> verticaly',
            anchorX: "left",
            anchorY: "top",
            allowDragY: true,
            allowDragX: false,
            shape: {
                type: 'rect',
                params: {
                    x: 0,
                    y: 0,
                    width: 55,
                    height: 40
                }
            }
        }],

        series: [
          {
            name: 'Points',
            type: 'scatter',
            id: 's1',
            data: tempABVals,
          },
          {
            name: 'Linear Regression Line',
            type: 'line',
            data: linearRegressionLine.points
          },
          // {
          //   name: 'Polynomial Cubic Regression Line',
          //   type: 'line',
          //   data: polyregData.sort(),
          //   visible: false
          // },
          {
            name: 'Histogram',
            type: 'histogram',
            baseSeries: 's1',
            zIndex: -1,
            visible: false
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
        }})

        const tableOutputTemplate = `
          <div style="text-align: center; margin: 0 3em;">
            <h4>Summary Statistics</h4>
              <table style="width: 100%;">
                <tr>
                  <td>Correlation:</td>
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
        chartWindow.document.body.appendChild(chartContainer);
        chartWindow.document.body.appendChild(doc.body.firstChild);
        dispatchSpreadsheetAction({type: OPEN_ANALYSIS_WINDOW, analysisWindowOpen: false })
      // HighchartsPlugin(Highcharts);
    }
  }, [Highcharts, analysisWindowOpen, colAMean, colAStdev, colBMean, colBStdev, colXLabel, colYLabel, corrcoeff, covariance, dispatchSpreadsheetAction, linearRegressionLine.equation, linearRegressionLine.points, linearRegressionLine.r2, linearRegressionLine.string, tempABVals])
  return null;
}




  // const samples = [ [30, 14, 6], [12, 15, 16] ];
  // console.log(mwu.test(samples));
  // if (mwu.significant(mwu.test(samples), samples)) {
  //   console.log('The data is significant!');
  // } else {
  //     console.log('The data is not significant.');
  // }

  // const tempAVals = data.xVals.map((_, i) => {
  //   return data.xVals[i]
  // })

  // const tempBVals = data.yVals.map((_, i) => {
  //   return data.yVals[i]
  // })


  // console.log(
  //   'mean is: ', jStat.mean(tempAVals),
  //   '\nmedian is: ', jStat.median(tempAVals),
  //   '\nstdev is: ', jStat.stdev(tempAVals),
  //   '\nci is: ', jStat.normalci(50, 0.05, tempAVals),
  //   // '\nanova: ', jStat.anovafscore(tempAVals, tempBVals),
  //   )

  // let x, y, z, out, table;

  // // data from Hollander & Wolfe (1973), 116.
  // x = [2.9, 3.0, 2.5, 2.6, 3.2];
  // y = [3.8, 2.7, 4.0, 2.4];
  // z = [2.8, 3.4, 3.7, 2.2, 2.0];

  // out = kruskal( x, y, z );
  // /*
  // { H: 0.7714,
  //   df: 2,
  //   pValue: 0.6799 }
  // */

  // table = out.toString()
  // console.log(table);
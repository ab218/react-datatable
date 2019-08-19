/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import regression from 'regression';
import PolyRegression from "js-polynomial-regression";
import mwu from 'mann-whitney-utest';
import './App.css';
// import kruskal from 'compute-kruskal-test';
import { useSpreadsheetState } from './SpreadsheetProvider';
var jStat = require('jstat').jStat;

export default function HighchartsDemo ({data, windowOpen, setAnalysisWindow}) {
  const { Highcharts } = window;
  const {
    columns,
    rows,
   } = useSpreadsheetState();

   // Think of a way to only have one window open at a time.

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

  const colXID = columns[0].id;
  const colYID = columns[1].id;
  function mapColumnValues(colID) { return rows.map(row => row[colID]); }
  const colA = mapColumnValues(colXID);
  const colB = mapColumnValues(colYID);

  console.log(colA, colB)

  const tempABVals = data.xVals.map((_, i) => {
    return [parseInt(colB[i]), parseInt(colA[i])]
  }).sort();
  const tempABValsPoly = data.xVals.map((_, i) => {
    return {x: colB[i], y: colA[i]}
  }).sort();
  const linearRegressionLine = regression.linear(tempABVals);
  // console.log(linearRegressionLine)
  // const polyRegressionLine = regression.polynomial(tempABVals, {order: 3});
  // console.log('poly reg points:', polyRegressionLine.points);

  //Factory function - returns a PolynomialRegression instance. 2nd argument is the degree of the desired polynomial equation.
  const model = PolyRegression.read(tempABValsPoly, 3);
  //terms is a list of coefficients for a polynomial equation. We'll feed these to predict y so that we don't have to re-compute them for every prediction.
  const terms = model.getTerms();
  // console.log(terms) // Poly regression coefficients
  const polyregData = data.xVals.map(x => {
    return [x, model.predictY(terms, x)];
  });

  // const regression2 = new PolynomialRegression(data.xVals, data.yVals, 3);

  // const predictions = data.xVals.map(val => {
  //   return regression2.predict(val)
  // })
  // console.log(predictions);

  // console.log(regression2.predict(80)); // Apply the model to some x value. Prints 2.6.
  // console.log(regression2.coefficients); // Prints the coefficients in increasing order of power (from 0 to degree).
  // console.log(regression2.toString(3)); // Prints a human-readable version of the function.
  // console.log(regression2.toLaTeX());
  // console.log(regression2.score(data.xVals, data.yVals));

  useEffect(() => {
    if (windowOpen) {
      const chartWindow = window.open("", "_blank", "left=9999,top=250,width=450,height=600"),
            chartContainer = document.createElement("div"),
            chartList = document.createElement("ul");

      chartContainer.setAttribute("id", "container");
      chartList.setAttribute("id", "list");

      Highcharts.chart(chartContainer, {
        chart: {
          zoomType: 'xy',
          height: 400,
          width: 400
      },
        credits: false,
        title: {
          text: 'Bivariate Fit of Math by Verb'
        },
        xAxis: {
          title: { text: 'Verb' },
          alignTicks: false
        },
        yAxis: {
          title: {
            text: 'Math'
          },
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
            // pointStart: 2010
          }
        },

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
          {
            name: 'Polynomial Cubic Regression Line',
            type: 'line',
            data: polyregData.sort()
          },
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

        // const fragment = document.createDocumentFragment();

        // terms.forEach(function (term) {
        //   const li = document.createElement('li');
        //   li.innerHTML = term;
        //   fragment.appendChild(li);
        // })

        // chartList.appendChild(fragment);

        const tableOutput = `
          <div style="text-align: center; margin: 0 3em;">
            <h4>Linear Fit</h4>
            <table style="width: 75%;">
              <tr>
                <td>r2:</td>
                <td>${linearRegressionLine.r2}</td>
              </tr>
              <tr>
                <td>gradient:</td>
                <td>${linearRegressionLine.equation[0]}</td>
              </tr>
              <tr>
                <td>y-intecept:</td>
                <td>${linearRegressionLine.equation[1]}</td>
              </tr>
              <tr>
                <td>equation:</td>
                <td>${linearRegressionLine.string}</td>
              </tr>
            </table>
          </div>
        `

        const doc = new DOMParser().parseFromString(tableOutput, 'text/html');
        chartWindow.document.body.appendChild(chartContainer);
        chartWindow.document.body.appendChild(doc.body.firstChild);
        setAnalysisWindow(false);
      // HighchartsPlugin(Highcharts);
    }
  }, [Highcharts, linearRegressionLine.equation, linearRegressionLine.points, linearRegressionLine.r2, linearRegressionLine.string, polyregData, setAnalysisWindow, tempABVals, terms, windowOpen])
  return null;
}
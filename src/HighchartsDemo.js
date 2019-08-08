import React, { useEffect } from 'react';
import regression from 'regression';
import PolyRegression from "js-polynomial-regression";
// import { useSpreadsheetState } from './SpreadsheetProvider';
// import PolynomialRegression from 'ml-regression-polynomial';

export default function HighchartsDemo ({data}) {
  const { Highcharts } = window;
  const tempABVals = data.xVals.map((_, i) => {
    return [data.xVals[i], data.yVals[i]]
  }).sort();
  const tempABValsPoly = data.xVals.map((_, i) => {
    return {x: data.xVals[i], y: data.yVals[i]}
  }).sort();
  console.log('tempABVals', tempABVals)
  const linearRegressionLine = regression.linear(tempABVals);
  // const polyRegressionLine = regression.polynomial(tempABVals, {order: 3});
  // console.log('poly reg points:', polyRegressionLine.points);

  //Factory function - returns a PolynomialRegression instance. 2nd argument is the degree of the desired polynomial equation.
  const model = PolyRegression.read(tempABValsPoly, 3);
  //terms is a list of coefficients for a polynomial equation. We'll feed these to predict y so that we don't have to re-compute them for every prediction.
  const terms = model.getTerms();
  console.log('terms', terms)
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

  /*
  0: -12.265654696511284
  1: 2.2695927405735388
  2: -0.03234904402012483
  3: 0.0001506553294355703
  */

  useEffect(() => {
    // HighchartsPlugin(Highcharts);
    Highcharts.chart('container', {
      chart: {
        zoomType: 'xy'
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
      }
  })}, [Highcharts, linearRegressionLine.points, polyregData, tempABVals])
return (
  <div id="container" />
)
}
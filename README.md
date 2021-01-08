## Summary

This is a fully virtualized data table built with React and React Virtualized. It draws inspiration from Google Sheets and JMP 15. Users are able to input and manipulate data and perform several different kinds of statistical analyses.

When an analysis is performed, the data table will call a (Python) Google Cloud Function to calculate some statistical output. An analysis consists of a (d3) chart and statistical output which is displayed in a new window.

## Setup

1. Install dependencies with `npm install` or `yarn`.

2. `npm run start` or `yarn start` from command line.

In order to run analyses, the following environment variables are needed:

```
REACT_APP_DISTRIBUTION_URL=
REACT_APP_REGRESSION_URL=
REACT_APP_ONEWAY_URL=
REACT_APP_CONTINGENCY_URL=
```

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

import React, { useState, useEffect } from "react";
import { Table } from "reactstrap";
import Papa from "papaparse";

function EDA() {
  const [csvData, setCsvData] = useState([]);
  const [columnInfo, setColumnInfo] = useState([]);

  useEffect(() => {
    fetch('./archive/adult.csv')
      .then(response => response.text())
      .then(text => {
        const parsedData = Papa.parse(text, { header: true });
        setCsvData(parsedData.data);
        const columns = parsedData.meta.fields;
        const info = columns.map((columnName, columnIndex) => {
          const columnValues = parsedData.data.map(row => row[columnName]);
          const uniqueValues = [...new Set(columnValues)];
          const variableType = checkVariableType(columnValues);
          return {
            name: columnName,
            index: columnIndex + 1,
            variableType,
            numUniqueValues: uniqueValues.length,
            mean: variableType === "Integer" ? calculateMean(columnValues) : "-",
            stdDev: variableType === "Integer" ? calculateStdDev(columnValues) : "-",
            median: variableType === "Integer" ? calculateMedian(columnValues) : "-",
            min: variableType === "Integer" ? calculateMin(columnValues) : "-",
            max: variableType === "Integer" ? calculateMax(columnValues) : "-",
            missingValues: calculateMissingValues(columnValues),
            range: variableType === "Integer" ? calculateRange(columnValues) : "-",
          };
        });
        setColumnInfo(info);
      });
  }, []);

  const checkVariableType = (values) => {
    if (values.every(value => Number.isInteger(+value))) {
      return "Integer";
    } else {
      return "Categorical";
    }
  };

  const calculateMean = (values) => {
    const numericValues = values.map(value => parseFloat(value)).filter(value => !isNaN(value));
    return numericValues.length > 0 ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length : 0;
  };

  const calculateStdDev = (values) => {
    const numericValues = values.map(value => parseFloat(value)).filter(value => !isNaN(value));
    const mean = calculateMean(numericValues);
    const squaredDiffs = numericValues.map(value => Math.pow(value - mean, 2));
    const meanOfSquaredDiffs = calculateMean(squaredDiffs);
    return Math.sqrt(meanOfSquaredDiffs);
  };

  const calculateMedian = (values) => {
    const numericValues = values.map(value => parseFloat(value)).filter(value => !isNaN(value));
    const sortedValues = numericValues.sort((a, b) => a - b);
    const middleIndex = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 0) {
      return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
    } else {
      return sortedValues[middleIndex];
    }
  };

  const calculateMax = (values) => {
    const numericValues = values.map(value => parseFloat(value)).filter(value => !isNaN(value));
    return Math.max(...numericValues);
  };

  const calculateMin = (values) => {
    const numericValues = values.map(value => parseFloat(value)).filter(value => !isNaN(value));
    return Math.min(...numericValues);
  };

  const calculateMissingValues = (values) => {
    return values.filter(value => value === "").length;
  };

  const calculateRange = (values) => {
    const numericValues = values.map(value => parseFloat(value)).filter(value => !isNaN(value));
    const minValue = calculateMin(numericValues);
    const maxValue = calculateMax(numericValues);
    return maxValue - minValue;
  };

//   const calculateCorrelation = (values1, values2) => {
//     const mean1 = calculateMean(values1);
//     const mean2 = calculateMean(values2);
//     const sumProduct = values1.reduce((sum, value1, index) => sum + value1 * values2[index], 0);
//     const sumSquared1 = values1.reduce((sum, value1) => sum + Math.pow(value1 - mean1, 2), 0);
//     const sumSquared2 = values2.reduce((sum, value2) => sum + Math.pow(value2 - mean2, 2), 0);
//     const correlation = sumProduct / Math.sqrt(sumSquared1 * sumSquared2);
//     return correlation;
//   };


return (
    <div className="content">
      <div style={{ overflowX: 'auto' }}>
        <Table>
          {/* Display Column Information */}
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Index</th>
              <th>Variable Type</th>
              <th>Num Unique Values</th>
              <th>Mean</th>
              <th>Std Dev</th>
              <th>Median</th>
              <th>Min</th>
              <th>Max</th>
              <th>Missing Values</th>
              <th>Range</th>
            </tr>
          </thead>
          <tbody>
            {columnInfo.map((info, index) => (
              <tr key={index}>
                <td>{info.name}</td>
                <td>{info.index}</td>
                <td>{info.variableType}</td>
                <td>{info.numUniqueValues}</td>
                <td>{info.mean}</td>
                <td>{info.stdDev}</td>
                <td>{info.median}</td>
                <td>{info.min}</td>
                <td>{info.max}</td>
                <td>{info.missingValues}</td>
                <td>{info.range}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default EDA;
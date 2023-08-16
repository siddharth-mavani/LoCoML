import React, { useState } from "react";
import { Table } from "reactstrap";
import Papa from "papaparse";

function CSVDisplay() {
  const [parsedCsvData, setParsedCsvData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target.result;
        Papa.parse(text, {
          complete: (result) => {
            const data = result.data.slice(1, 51); // Slice to get first 50 rows
            setParsedCsvData(data);
          },
        });
      };

      reader.readAsText(file);
    }
  };

  return (
    <div className="content">
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <Table>
        <thead>
          {parsedCsvData.length > 0 && (
            <tr>
              {Object.keys(parsedCsvData[0]).map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {parsedCsvData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((cellValue, cellIndex) => (
                <td key={cellIndex}>{cellValue}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default CSVDisplay;

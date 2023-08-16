import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table } from "reactstrap";

import csvData from "../archive/adult.csv"; // Replace with the actual path to your CSV file

import "../assets/css/paper-dashboard.css";

function UploadData() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch(csvData)
      .then(response => response.text())
      .then(data => {
        const lines = data.split("\n");
        const headers = lines[0].split(",");
        const csvRows = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          if (values.length === headers.length) {
            const row = {};
            for (let j = 0; j < headers.length; j++) {
              row[headers[j]] = values[j];
            }
            csvRows.push(row);
          }
        }

        setRows(csvRows);
      });
  }, []);

  return (
    <>
      <div className="content">
        <Row>
          <Col md="4">
            <Card className="card-user">
              <img
                alt="..."
                className="image-fit"
                src={require("assets/img/localupload.png")}
              />
              <CardBody>
                <div className="d-flex justify-content-center">
                  <Button color="info">
                    <i className="nc-icon nc-cloud-upload-94 icon-large" /> Upload data from local machine
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md="8">
            <Card>
              <CardBody>
                <Table>
                  <thead>
                    <tr>
                      {rows.length > 0 &&
                        Object.keys(rows[0]).map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((cellValue, cellIndex) => (
                          <td key={cellIndex}>{cellValue}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default UploadData;

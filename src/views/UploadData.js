import React, { useState, useRef } from 'react';
import { Row, Col, Card, CardBody, Button, Alert } from "reactstrap";
// import { Notification, Placeholder } from 'rsuite';
import "../assets/css/paper-dashboard.css"

function UploadData() {
    const fileInput = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        console.log(file);
        setSelectedFile(file);
    };

    const formatFileSize = (sizeInBytes) => {
        const megabytes = sizeInBytes / (1024 * 1024);
        return String(megabytes.toFixed(2) + ' MB');
    };

    return (
        <>
            <div className="content">
                <Row>
                    <Col md="4">
                        <Card className="card-user half-height-card">
                        
                        <CardBody>
                        <img
                            alt="..."
                            className="image-fit"
                            src={require("assets/img/localupload.png")}
                        />
                        <div className="d-flex justify-content-center">
                            <input
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                ref={fileInput}
                            />
                            <Button color="info" 
                                onClick={() => {fileInput.current.click()}}
                            >
                                Upload data from local machine
                            </Button>
                        </div>
                        <div className="d-flex justify-content-center" style={{fontSize: "12px"}}>
                            Note: Only .csv files are supported
                        </div>
                        </CardBody>
                        </Card>
                    </Col>
                    <Col md="4">
                        <Card className="card-user half-height-card">
                        <CardBody>
                        <img
                            alt="..."
                            className="image-fit"
                            src={require("assets/img/database.png")}
                        />
                        <div className="d-flex justify-content-center">
                            <Button color="info" >Connect to database</Button>
                        </div>
                        </CardBody>
                        </Card>
                    </Col>
                    <Col md="4">
                        <Card className="card-user half-height-card">
                        <CardBody>
                        <img
                            alt="..."
                            className="image-fit"
                            src={require("assets/img/apiupload.png")}
                        />
                        <div className="d-flex justify-content-center">
                            <Button color="info" >Fetch from API</Button>
                        </div>
                        </CardBody>
                        </Card>
                    </Col>
                </Row>
                
                <Row>
                    <Col>
                    {selectedFile && (<div> <Alert className="notif-button">
                    <div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                        File: {selectedFile.name} ({formatFileSize(selectedFile.size)}) Uploaded Successfully
                    </span>
                    </div>
                    <Button>Proceed to Exploratory data analysis</Button></Alert>
                </div>
                )
                }
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default UploadData;
import axios from 'axios';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import React, { useState, useRef, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import { makeStyles } from '@mui/styles';
import { Row, Col, Card, CardBody, Button, CardHeader, CardTitle, Table, } from "reactstrap";
import "../assets/css/paper-dashboard.css"

const useStyles = makeStyles({
    formGroup: {
      alignItems: 'center'
    }
  });

function DataPreprocessing() {

    const [selectedDataset, setSelectedDataset] = useState("");
    const [preProcessingType, setPreProcessingType] = useState("Automatic");

    const [datasets, setDatasets] = useState([]);
    const [selectedLabels, setSelectedLabels] = useState([]);

    const classes = useStyles();

    useEffect(() => {
        // Get Datasets List
        axios.get(process.env.REACT_APP_GET_ALL_DATASETS_URL)
        .then((response) => {
            console.log(response.data);

            // remove the .csv at the end 
            response.data.datasets.forEach((dataset, index) => {
                response.data.datasets[index] = dataset.slice(0, -4);
            });

            setDatasets(response.data.datasets);
        })
        .catch((error) => {
            console.log(error);
        });
    }, []);


    const handleClickAuto = () => {
        setPreProcessingType("Automatic");
    }

    const handleClickManual = () => {
        setPreProcessingType("Manual");
    }

    const handleLabelChange = (event) => {
        const { name, checked } = event.target;
        if (checked) {
          setSelectedLabels((prevSelectedLabels) => [...prevSelectedLabels, name]);
        } else {
          setSelectedLabels((prevSelectedLabels) =>
            prevSelectedLabels.filter((label) => label !== name)
          );
        }
      };

    const handlePreProcessing = () => {
        const finalTasks = ["Drop Duplicate Rows", "Interpolate Missing Values", "Normalise Features"];
        if (preProcessingType === "Manual") {
            finalTasks = selectedLabels;
        }
        // Send request to backend to begin preprocessing
        axios.post(process.env.REACT_APP_PREPROCESSING_URL, {
            name: selectedDataset + '.csv',
            tasks: finalTasks
        })
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
    }


    const handleSelect = (dataset) => {
        setSelectedDataset(dataset);
    }

    return (
        <>
            <div className="content">
                <Row>
                    <Col md="6">
                        <div className="d-flex justify-content-center">
                            {
                                preProcessingType === "Automatic" ? (
                                    <Button color="info" onClick={handleClickAuto}>Automatic</Button>
                                ) : (
                                    <Button color="secondary" onClick={handleClickAuto}>Automatic</Button>
                                )
                            }
                        </div>
                    </Col>
                    <Col md="6">
                        <div className="d-flex justify-content-center">
                            {
                                preProcessingType === "Manual" ? (
                                    <Button color="info" onClick={handleClickManual}>Manual</Button>
                                ) : (
                                    <Button color="secondary" onClick={handleClickManual}>Manual</Button>
                                )
                            }
                        </div>
                    </Col>
                </Row>
                <Row>
                    {preProcessingType === "Manual" ? ( 
                        <>
                            <Col md = "12">
                                    <FormGroup className={classes.formGroup} >
                                        <FormControlLabel control={<Checkbox onChange={handleLabelChange} name="Drop Duplicate Rows" />} label="Drop Duplicate Rows"/>
                                        <FormControlLabel control={<Checkbox onChange={handleLabelChange} name="Interpolate Missing Values" />} label="Interpolate Missing Values"/>
                                        <FormControlLabel control={<Checkbox onChange={handleLabelChange} name="Normalise Features" />} label="Normalise Features"/>
                                    </FormGroup>
                            </Col>
                        </>
                    ) : ( 
                        <></> 
                    )}
                </Row>
                <Row>
                    <Col md="12">
                    <Card className="card-plain">
                        <CardHeader>
                        <CardTitle tag="h2">Datasets</CardTitle>
                        </CardHeader>
                        <CardBody>
                        <Table responsive>
                            <thead className="text-primary">
                            <tr>
                                <th className="text-center">Name</th>
                                <th className="text-center">Option</th>
                            </tr>
                            </thead>
                            <tbody>
                                {datasets.map((dataset, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{dataset}</td>
                                        <td className="text-center">
                                            {dataset === selectedDataset ? (
                                                <>
                                                    <Button color="danger" onClick={() => setSelectedDataset("")} style={{ marginRight: "5px" }}>Unselect</Button>
                                                    <Button color="success" onClick={handlePreProcessing}>Begin Preprocessing</Button>
                                                </>
                                            ) : (
                                                <Button color="info" onClick={() => handleSelect(dataset)}>Select</Button>
                                            )}
                                        </td>
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
    )
}

export default DataPreprocessing;
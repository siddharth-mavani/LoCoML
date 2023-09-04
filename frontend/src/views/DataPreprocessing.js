import axios from 'axios';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import React, { useState, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import { makeStyles } from '@mui/styles';
import { Row, Col, Card, CardBody, Button, CardHeader, CardTitle, Table, } from "reactstrap";
import "../assets/css/paper-dashboard.css"
import { LinearProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';


const useStyles = makeStyles({
    formGroup: {
      alignItems: 'left'
    }
  });

function DataPreprocessing() {

    const [loading, setLoading] = React.useState(false)
    const [selectedDataset, setSelectedDataset] = useState("");
    const [preProcessingType, setPreProcessingType] = useState("Automatic");

    const [datasets, setDatasets] = useState([]);
    const [selectedLabels, setSelectedLabels] = useState(["Drop Duplicate Rows"]);

    const [checkedState, setCheckedState] = useState({
        'Drop Duplicate Rows': true,
        'Interpolate Missing Values': false,
        'Normalise Features': false,
      });

    const classes = useStyles();
    const navigate = useNavigate();

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

        setCheckedState({
            ...checkedState,
            [event.target.name]: event.target.checked,
          });
      };

    const handleCancel = () => {
        setSelectedDataset("");
        setPreProcessingType("Automatic");
        setSelectedLabels(["Drop Duplicate Rows"]);
        checkedState['Drop Duplicate Rows'] = true;
        checkedState['Interpolate Missing Values'] = false;
        checkedState['Normalise Features'] = false;
    }

    const handlePreProcessing = async () => {
        let finalTasks = ["Drop Duplicate Rows", "Interpolate Missing Values", "Normalise Features"];
        if (preProcessingType === "Manual") {
            finalTasks = selectedLabels;
        }

        try {
            setLoading(true); // Start loading

            // Simulate a 5-second delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // setApiResponse('Simulated API response'); // Update the API response
        } catch (error) {
            console.error('API error:', error);
        } finally {


            // Send request to backend to begin preprocessing
            axios.post(process.env.REACT_APP_PREPROCESSING_URL, {
                name: selectedDataset + '.csv',
                tasks: finalTasks
            })
            .then((response) => {
                console.log(response.data);
                setLoading(false);
                // navigate("/train");
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }


    const handleSelect = (dataset) => {
        setSelectedDataset(dataset);
    }

    return (
        <>
            <div className="content">
                <Row>
                    <Col md="12">
                        {selectedDataset !== "" ? (
                            <>
                            <Card className="card-plain">
                                <CardHeader>
                                    <CardTitle tag="h2">{selectedDataset}</CardTitle>
                                </CardHeader>
                                <CardBody>
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
                                                <FormGroup className={classes.formGroup} style={{ marginTop: '30px' }}>
                                                    <FormControlLabel control={<Checkbox checked={checkedState['Drop Duplicate Rows']} onChange={handleLabelChange} name="Drop Duplicate Rows" />} label="Drop Duplicate Rows" style={{ color: 'black' }}/>
                                                    <FormControlLabel control={<Checkbox checked={checkedState['Interpolate Missing Values']} onChange={handleLabelChange} name="Interpolate Missing Values" />} label="Interpolate Missing Values" style={{ color: 'black' }}/>
                                                    <FormControlLabel control={<Checkbox checked={checkedState['Normalise Features']} onChange={handleLabelChange} name="Normalise Features" />} label="Normalise Features" style={{ color: 'black' }}/>
                                                </FormGroup>
                                            </Col>
                                        </>
                                    ) : ( 
                                        <>
                                            <Col md = "12">
                                                <FormGroup className={classes.formGroup} style={{ marginTop: '30px' }}>
                                                    <FormControlLabel control={<Checkbox checked={true} onChange={handleLabelChange} name="Drop Duplicate Rows" />} label="Drop Duplicate Rows" style={{ color: 'black' }}/>
                                                    <FormControlLabel control={<Checkbox checked={true} onChange={handleLabelChange} name="Interpolate Missing Values" />} label="Interpolate Missing Values" style={{ color: 'black' }}/>
                                                    <FormControlLabel control={<Checkbox checked={true} onChange={handleLabelChange} name="Normalise Features" />} label="Normalise Features" style={{ color: 'black' }}/>
                                                </FormGroup>
                                            </Col>
                                        </> 
                                    )}
                                </Row>
                                <Row>
                                    <Col>
                                        {loading ? <LinearProgress /> : null}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                            <div className="d-flex justify-content-center">
                                                <Button color="danger" onClick={handleCancel} style={{ marginRight: "5px" }}>Cancel</Button>
                                            </div>
                                    </Col>
                                    <Col md="6">
                                            <div className="d-flex justify-content-center">
                                                <Button color="success" onClick={handlePreProcessing}>Begin Preprocessing</Button>
                                            </div>
                                    </Col>
                                </Row>

                                </CardBody>
                            </Card>
                            </>
                        ): (
                            <>
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
                                                    <Button color="info" onClick={() => handleSelect(dataset)}>Select</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                </CardBody>
                            </Card>
                            </>
                        )}
                    </Col>
                </Row>  
            </div>
        </>
    )
}

export default DataPreprocessing;
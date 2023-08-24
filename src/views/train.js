import React from "react";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import { Chip, CircularProgress, LinearProgress } from "@mui/material";
import axios from "axios";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Papa from "papaparse";

import { Col, Row, Button as ReactStrapButton } from "reactstrap";

function Train() {
    const [activeStep, setActiveStep] = React.useState(0);
    const [modelType, setModelType] = React.useState('');
    const [metricType, setMetricType] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [datasetList, setDatasetList] = React.useState([]);
    const [selectedDataset, setSelectedDataset] = React.useState('');
    const [selectedDataContents, setSelectedDataContents] = React.useState(null);
    const [datasetColumns, setDatasetColumns] = React.useState([]);
    const [objective, setObjective] = React.useState('');
    const [targetColumn, setTargetColumn] = React.useState('');
    const [modelName, setModelName] = React.useState('');
    const [trainingCompleted, setTrainingCompleted] = React.useState(false);

    const steps = ['Training Options', 'Model Selection', 'Train the model'];
    const democolumns = ['Age', 'Amount', 'Income', 'Fraud Type']
    const classifiers = ['Logistic Regression', 'Decision Tree', 'Random Forest', 'AdaBoost', 'Naive Bayes', 'KNN', 'SVM']
    const metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'AUC']

    React.useEffect(() => {
        axios.get('http://localhost:5000/getDatasets')
            .then((response) => {
                console.log(response.data);
                setDatasetList(response.data.datasets);
            })
            .catch((error) => {
                console.log(error);
            })
    }, []);

    React.useEffect(() => {
        // try { await new Promise(resolve => setTimeout(resolve, 2000)) } catch (error) { console.error('API error:', error) }
        axios.get('http://localhost:5000/getDatasets/' + selectedDataset)
            .then((response) => {
                console.log(response.data);
                setSelectedDataContents(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }, [selectedDataset]);

    React.useEffect(() => {
        if (selectedDataContents != null) {
            const parsedData = Papa.parse(selectedDataContents, { header: true });
            console.log(parsedData.data);
            setDatasetColumns(Object.keys(parsedData.data[0]));
        }
    }, [selectedDataContents]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const handleModelTypeChange = (event) => {
        console.log(event.target.value);
        setModelType(event.target.value);
    }

    const handleMetricTypeChange = (event) => {
        console.log(event.target.value);
        setMetricType(event.target.value);
    }

    const handleTraining = async (event) => {
        event.preventDefault();
        try {
            setLoading(true); // Start loading

            // Simulate a 5-second delay
            await new Promise(resolve => setTimeout(resolve, 5000));

            // setApiResponse('Simulated API response'); // Update the API response
        } catch (error) {
            console.error('API error:', error);
        } finally {
            setLoading(false); // Stop loading
            setTrainingCompleted(true);
        }
    }

    return (
        <div className="content">
            <Row>
                <Col>
                    <Box style={{ justifyContent: "center", display: "flex", marginBottom: "1rem" }}>
                        <Stepper activeStep={activeStep} style={{ width: "80%", }}>
                            {steps.map((label, index) => {
                                const stepProps = {};
                                const labelProps = {};
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                    </Box>
                    {activeStep === steps.length ? (
                        <React.Fragment>
                            <Typography sx={{ mt: 2, mb: 1 }}>
                                All steps completed - you&apos;re finished
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                <Box sx={{ flex: '1 1 auto' }} />
                                <Button onClick={handleReset}>Reset</Button>
                            </Box>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>

                            {activeStep === 0 ?
                                <div style={{ marginTop: "1.5rem" }}>
                                    <Row className="align-items-center mb-3">
                                        <Col md="2">
                                            Select Dataset:
                                        </Col>
                                        <Col md="6">
                                            <FormControl fullWidth>
                                                <InputLabel id="datasetlabel">Dataset</InputLabel>
                                                <Select
                                                    labelId="datasetlabel"
                                                    label="Column"
                                                    fullWidth
                                                    value={selectedDataset}
                                                    onChange={(e) => setSelectedDataset(e.target.value)}
                                                // onChange={handleChange}
                                                >
                                                    {datasetList.map((column) => (
                                                        <MenuItem value={column}>{column}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {selectedDataset != '' && selectedDataContents == null ?
                                                <div className="mt-3">
                                                    <CircularProgress /> Fetching the dataset contents...
                                                </div> : null}
                                            {selectedDataset != '' && selectedDataContents != null ?
                                                <div className="mt-3">
                                                    <CheckCircleIcon color='success' /> Dataset: {selectedDataset} fetched successfully.
                                                </div> : null
                                            }
                                        </Col>
                                    </Row>

                                    <Row className="align-items-center mb-3">
                                        <Col md="2">
                                            Select Objective:
                                        </Col>
                                        <Col md="6">
                                            <FormControl fullWidth>
                                                <InputLabel id="objectivelabel">Objective</InputLabel>
                                                <Select
                                                    labelId="objectivelabel"
                                                    label="Column"
                                                    fullWidth
                                                    value={objective}
                                                    onChange={(e) => setObjective(e.target.value)}
                                                >
                                                    <MenuItem value="classification">Classification</MenuItem>
                                                    <MenuItem value="regression">Regression</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>

                                    <Row className="align-items-center mb-3">
                                        <Col md="2">
                                            Select Target Column:
                                        </Col>
                                        <Col md="6">
                                            <FormControl fullWidth>
                                                <InputLabel id="label">Target Column</InputLabel>
                                                <Select
                                                    labelId="label"
                                                    label="Column"
                                                    fullWidth
                                                    value={targetColumn}
                                                    onChange={(e) => setTargetColumn(e.target.value)}
                                                >
                                                    {datasetColumns.map((column) => (
                                                        <MenuItem value={column}>{column}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>

                                    <Row className="align-items-center mb-3">
                                        <Col md="2">
                                            Enter Model Name:
                                        </Col>
                                        <Col md="6">
                                            <TextField
                                                label="Model Name"
                                                variant="outlined"
                                                fullWidth
                                                value={modelName}
                                                onChange={(e) => setModelName(e.target.value)}
                                            />
                                        </Col>
                                    </Row>



                                </div> : null}
                            {activeStep == 1 ? <div style={{ marginTop: "1.5rem" }}>
                                <Row className="mb-3">
                                    <Col md="2" style={{ marginTop: "1rem" }}>
                                        Optimization Objective:
                                    </Col>
                                    <Col md="6">
                                        <FormControl>
                                            <RadioGroup
                                                aria-labelledby="demo-controlled-radio-buttons-group"
                                                // name="controlled-radio-buttons-group"
                                                value={metricType}
                                                onChange={handleMetricTypeChange}
                                            >
                                                <FormControlLabel
                                                    value="AutoSelect"
                                                    control={<Radio />}
                                                    label={
                                                        <div style={{ marginTop: '0.8rem' }}>
                                                            Select Automatically based on dataset
                                                            <div style={{ fontSize: '12px', color: 'gray' }}>
                                                                The metric to be optimized is selected automatically based on the dataset.
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                                <FormControlLabel
                                                    value="CustomMetric"
                                                    control={<Radio />}
                                                    label={
                                                        <div style={{ marginTop: '0.8rem' }}>
                                                            Select a particular metric
                                                            <div style={{ fontSize: '12px', color: 'gray' }}>
                                                                Select a particular metric to be optimized.
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                                {metricType == "CustomMetric" ? <div>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="label">Select Metric</InputLabel>
                                                        <Select
                                                            labelId="label"
                                                            label="Select Classifier"
                                                            fullWidth
                                                        // onChange={handleChange}
                                                        >
                                                            {metrics.map((column) => (
                                                                <MenuItem value={column}>{column}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </div> : null}
                                            </RadioGroup>
                                        </FormControl>
                                    </Col>
                                </Row>
                                <Row className=" mb-3">
                                    <Col md="2" className="mt-3">
                                        Select Model Type:
                                    </Col>
                                    <Col>
                                        <FormControl>
                                            <RadioGroup
                                                aria-labelledby="demo-controlled-radio-buttons-group"
                                                // name="controlled-radio-buttons-group"
                                                row
                                                value={modelType}
                                                onChange={handleModelTypeChange}
                                            >
                                                <FormControlLabel
                                                    value="AutoML"
                                                    control={<Radio />}
                                                    label={
                                                        <div style={{ marginTop: '0.8rem' }}>
                                                            AutoML
                                                            <div style={{ fontSize: '12px', color: 'gray', maxWidth: '50%' }}>
                                                                Train a classifier automatically which maximizes the selected metric. The model is trained using various algorithms and the best one is selected.
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                                <FormControlLabel
                                                    value="CustomModel"
                                                    control={<Radio />}
                                                    label={
                                                        <div style={{ marginTop: '0.8rem' }}>
                                                            Select a model type
                                                            <div style={{ fontSize: '12px', color: 'gray' }}>
                                                                Select a particular model type and train the model.
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                                {modelType == "CustomModel" ? <div>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="label">Select Classifier</InputLabel>
                                                        <Select
                                                            labelId="label"
                                                            label="Select Classifier"
                                                            fullWidth
                                                        // onChange={handleChange}
                                                        >
                                                            {classifiers.map((column) => (
                                                                <MenuItem value={column}>{column}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </div> : null}
                                            </RadioGroup>
                                        </FormControl>
                                    </Col>
                                </Row>
                            </div> : null}
                            {activeStep == 2 ? <div style={{ marginTop: "1.5rem" }}>
                                <Row className="mb-3">
                                    <Col>
                                        <Typography
                                            variant="h5"
                                        >
                                            Model Details
                                        </Typography>
                                    </Col>
                                </Row>
                                <Row className="align-items-center mb-3">
                                    <Col md="2">
                                        Dataset:
                                    </Col>
                                    <Col md="6">
                                        {selectedDataset}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md="2">
                                        Model Name:
                                    </Col>
                                    <Col md="6">
                                        {modelName}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md="2">
                                        Model Type:
                                    </Col>
                                    <Col md="6">
                                        {modelType}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md="2">
                                        Objective:
                                    </Col>
                                    <Col md="6">
                                        {objective}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md="2">
                                        Target Column:
                                    </Col>
                                    <Col md="6">
                                        {targetColumn}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md="2">
                                        Optimization Metric:
                                    </Col>
                                    <Col md="6">
                                        {metricType}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col>
                                        <ReactStrapButton disabled={loading} onClick={handleTraining} >Start Training</ReactStrapButton>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {loading ? <LinearProgress /> : null}
                                    </Col>
                                </Row>
                            </div> : null}
                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                <Button
                                    color="inherit"
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    sx={{ mr: 1 }}
                                >
                                    Back
                                </Button>
                                <Box sx={{ flex: '1 1 auto' }} />

                                {/* <Button onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button> */}
                                {activeStep === steps.length - 1 ? 
                                    <Button 
                                        onClick={handleNext}
                                        disabled={!trainingCompleted}
                                    >
                                        Finish
                                    </Button>
                                : 
                                    <Button
                                        onClick={handleNext}
                                    >
                                        Next
                                    </Button>
                                }
                            </Box>
                        </React.Fragment>
                    )}
                </Col>
            </Row>
        </div>
    )
}

export default Train;
import React, { useEffect } from "react";
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
import { Chip, CircularProgress, LinearProgress, TableRow } from "@mui/material";
import axios from "axios";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Papa from "papaparse";
import { Table } from "reactstrap";
import { Table as MuiTable, TableCell } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from "@mui/styles";

import { Col, Row, Button as ReactStrapButton } from "reactstrap";

const useStyles = makeStyles((theme) => ({
    accordionTitle: {
        display: 'flex',
        alignItems: 'center',
    },
    accordionSummary: {
        justifyContent: 'space-between',
    },
}));

function LinearProgressWithLabel(props) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}

// LinearProgressWithLabel.propTypes = {
//     /**
//      * The value of the progress indicator for the determinate and buffer variants.
//      * Value between 0 and 100.
//      */
//     value: PropTypes.number.isRequired,
// };


function Train() {
    const [activeStep, setActiveStep] = React.useState(0);
    const [trainingMode, setTrainingMode] = React.useState('AutoML');
    const [modelType, setModelType] = React.useState('');
    // const [customModelType, setCustomModelType] = React.useState('');
    const [metricMode, setMetricMode] = React.useState('AutoSelect');
    const [metricType, setMetricType] = React.useState('');
    // const [customMetricType, setCustomMetricType] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [datasetList, setDatasetList] = React.useState([]);
    const [selectedDatasetID, setSelectedDatasetID] = React.useState('');
    const [selectedDatasetContents, setSelectedDatasetContents] = React.useState(null);
    const [selectedDatasetColumns, setSelectedDatasetColumns] = React.useState([]);
    const [objective, setObjective] = React.useState('');
    const [targetColumn, setTargetColumn] = React.useState('');
    const [modelName, setModelName] = React.useState('');
    const [trainingCompleted, setTrainingCompleted] = React.useState(false);
    const [trainingResponse, setTrainingResponse] = React.useState();
    
    const [trainingStatus, setTrainingStatus] = React.useState({
        progress: 0,
        status: 'Initialising',
        model: '',
        estimated_time_left: 'Calculating'
    });
    const classes = useStyles();

    const steps = ['Training Options', 'Model Selection', 'Train the model'];
    const classifiers = ['Logistic Regression', 'Decision Tree', 'Random Forest', 'AdaBoost', 'Naive Bayes', 'KNN', 'SVM']
    const regressors = ['Random Forest Regressor', 'AdaBoost Regressor', 'Ridge Regression', 'Bayesian Ridge']
    const classificationMetrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'AUC']
    const regressionMetrics = ['R2 Score', 'Mean Absolute Error', 'Mean Squared Error', 'Root Mean Squared Error']



    React.useEffect(() => {
        axios.get(process.env.REACT_APP_GET_ALL_DATASETS_URL)
            .then((response) => {
                console.log(response.data);
                setDatasetList(response.data.dataset_list);
            })
            .catch((error) => {
                console.log(error);
            })
    }, []);

    React.useEffect(() => {
        // try { await new Promise(resolve => setTimeout(resolve, 2000)) } catch (error) { console.error('API error:', error) }
        axios.get(process.env.REACT_APP_GET_DATASET_URL + selectedDatasetID)
            .then((response) => {
                // console.log(response.data);
                setSelectedDatasetContents(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }, [selectedDatasetID]);

    React.useEffect(() => {
        if (selectedDatasetContents != null) {
            const parsedData = Papa.parse(selectedDatasetContents, { header: true });
            // console.log(parsedData.data);
            setSelectedDatasetColumns(Object.keys(parsedData.data[0]));
        }
    }, [selectedDatasetContents]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleModelTypeChange = (event) => {
        console.log(event.target.value);
        setModelType(event.target.value);
    }

    const handleMetricTypeChange = (event) => {
        console.log(event.target.value);
        setMetricType(event.target.value);
    }

    const getSelectedDatasetName = () => {
        if (selectedDatasetID == '') {
            return '';
        }
        for (var i = 0; i < datasetList.length; i++) {
            if (datasetList[i].dataset_id == selectedDatasetID) {
                return datasetList[i].dataset_name;
            }
        }
    }

    // useEffect(() => {
    //     if (localStorage.getItem('trainingResponse')) {
    //         setTrainingResponse(JSON.parse(localStorage.getItem('trainingResponse')));
    //         // setTrainingCompleted(true);
    //         setActiveStep(3);
    //     }
    // }, []);

    const handleTraining = () => {
        // event.preventDefault();
        setTrainingCompleted(false);
        setLoading(true); // Start loading
        setTrainingStatus({
            progress: 0,
            status: 'Initialising',
            model: '',
            estimated_time_left: 'Calculating'
        })
        console.log("posting")
        console.log(process.env.REACT_APP_TRAIN_URL)
        const eventSource = new EventSource("http://127.0.0.1:5000/stream?channel=mychannel");

        eventSource.onmessage = (event) => {
            console.log(event.data);
            setTrainingStatus(JSON.parse(event.data));
        };

        axios.post(process.env.REACT_APP_TRAIN_URL, {
            'dataset_id': selectedDatasetID,
            'training_mode' : trainingMode,
            'model_type': modelType,
            'objective': objective,
            'metric_mode': metricMode,
            'metric_type': metricType,
            'model_name': modelName,
            'target_column': targetColumn,
        })
            .then((response) => {
                setTrainingResponse(response.data);
                localStorage.setItem('trainingResponse', JSON.stringify(response.data));
                console.log(response.data);
                setLoading(false); // Stop loading
                setTrainingCompleted(true);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false); // Stop loading
            })
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
                            <Row>
                                <Col md="12" className="text-center" >
                                    <Typography variant="h4" style={{ color: 'black' }}>
                                        Training Summary
                                    </Typography>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {trainingResponse.training_mode.toLowerCase() == 'automl' ?
                                        <Typography sx={{ mt: 2, mb: 1 }} variant="h6">
                                            Training Mode: AutoML
                                        </Typography>
                                        :
                                        <Typography sx={{ mt: 2, mb: 1 }} variant="h6">
                                            Training Mode: Manual
                                        </Typography>
                                    }
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {trainingResponse.training_mode.toLowerCase() == 'automl' ?
                                        <Typography sx={{ mt: 2 }} variant="subtitle1">
                                            Best Model: {trainingResponse.estimator_type}
                                        </Typography>
                                        :
                                        <Typography sx={{ mt: 2, mb: 1 }} variant="h6">
                                            Model: {trainingResponse.estimator_type}
                                        </Typography>
                                    }
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {trainingResponse.training_mode.toLowerCase() == 'automl' ?
                                        <Typography sx={{ mt: 2, mb: 1 }} variant="body2">
                                            Metric Optimized: {trainingResponse.metric_type}
                                        </Typography>
                                        : null}
                                </Col>
                            </Row>
                            <Row>
                                <Col md="6">
                                    <Typography sx={{ mt: 2, mb: 1 }} variant="subtitle1">
                                        Parameters of the model
                                    </Typography>
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>Parameter</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trainingResponse.parameters.map((parameter) => (
                                                <tr>
                                                    <td>{parameter.parameter_name}</td>
                                                    <td>{parameter.parameter_value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Col>
                                <Col md="6">
                                    <Typography sx={{ mt: 2, mb: 1 }} variant="subtitle1">
                                        Metrics of the model
                                    </Typography>
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>Metric</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trainingResponse.evaluation_metrics.map((metric) => (
                                                <tr>
                                                    <td>{metric.metric_name}</td>
                                                    <td>{metric.metric_value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                            {trainingResponse.training_mode.toLowerCase() == 'automl' ?
                                <Row>
                                    <Col>
                                        <Accordion
                                            sx={{
                                                '&.MuiPaper-root': {
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                },
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                            >
                                                Show scores of all models
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Table striped>
                                                    <thead>
                                                        <tr>
                                                            <th>Model Type</th>
                                                            {

                                                                Object.keys(trainingResponse.all_models_results[0])
                                                                    .map((metric) => {
                                                                        return (
                                                                            <>
                                                                                {metric != 'Model' ? <th>{metric}</th> : null}
                                                                            </>
                                                                        )
                                                                    }
                                                                    )
                                                            }
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {trainingResponse.all_models_results.map((model) => (
                                                            <tr>
                                                                <td>{model.Model}</td>
                                                                <td>{model.AUC}</td>
                                                                <td>{model.Accuracy}</td>
                                                                <td>{model.F1}</td>
                                                                <td>{model['Prec.']}</td>
                                                                <td>{model.Recall}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Col>
                                </Row>
                                : null}
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
                                                    value={selectedDatasetID}
                                                    onChange={(e) => setSelectedDatasetID(e.target.value)}
                                                // onChange={handleChange}
                                                >
                                                    {datasetList.map((dataset) => (
                                                        <MenuItem value={dataset.dataset_id}>{dataset.dataset_name + ' (id: ' + dataset.dataset_id + ')'}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {selectedDatasetID != '' && selectedDatasetContents == null ?
                                                <div className="mt-3">
                                                    <CircularProgress /> Fetching the dataset contents...
                                                </div> : null}
                                            {selectedDatasetID != '' && selectedDatasetContents != null ?
                                                <div className="mt-3">
                                                    <CheckCircleIcon color='success' /> Dataset: {getSelectedDatasetName() + ' (id: ' + selectedDatasetID + ')'} fetched successfully.
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
                                                    {selectedDatasetColumns.map((column) => (
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
                                                value={metricMode}
                                                onChange={(event) => {setMetricMode(event.target.value); setMetricType('')}}
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
                                                {metricMode == "CustomMetric" && objective.toLowerCase() == 'classification' ? <div>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="label">Select Metric</InputLabel>
                                                        <Select
                                                            labelId="label"
                                                            label="Select Classifier"
                                                            fullWidth
                                                            onChange={(e) => setMetricType(e.target.value)}
                                                        >
                                                            {classificationMetrics.map((column) => (
                                                                <MenuItem value={column}>{column}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </div> : null}
                                                {metricMode == "CustomMetric" && objective.toLowerCase() == 'regression' ? <div>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="label">Select Metric</InputLabel>
                                                        <Select
                                                            labelId="label"
                                                            label="Select Regressor"
                                                            fullWidth
                                                            onChange={(e) => setMetricType(e.target.value)}
                                                        >
                                                            {regressionMetrics.map((column) => (
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
                                    <Col md="2" style={{ marginTop: "1rem" }}>
                                        Select Model Type:
                                    </Col>
                                    <Col md="6">
                                        <FormControl>
                                            <RadioGroup
                                                aria-labelledby="demo-controlled-radio-buttons-group"
                                                // name="controlled-radio-buttons-group"
                                                // row
                                                value={trainingMode}
                                                onChange={(e) => setTrainingMode(e.target.value)}
                                            >
                                                <FormControlLabel
                                                    value="AutoML"
                                                    control={<Radio />}
                                                    label={
                                                        <div style={{ marginTop: '0.8rem' }}>
                                                            AutoML
                                                            <div style={{ fontSize: '12px', color: 'gray' }}>
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
                                                {trainingMode == "CustomModel" && objective.toLowerCase() == 'classification' ? <div>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="label">Select Classifier</InputLabel>
                                                        <Select
                                                            labelId="label"
                                                            label="Select Classifier"
                                                            fullWidth
                                                            onChange={(e) => setModelType(e.target.value)}
                                                        >
                                                            {classifiers.map((column) => (
                                                                <MenuItem value={column}>{column}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </div> : null}
                                                {trainingMode == "CustomModel" && objective.toLowerCase() == 'regression' ? <div>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="label">Select Regressor</InputLabel>
                                                        <Select
                                                            labelId="label"
                                                            label="Select Regressor"
                                                            fullWidth
                                                            onChange={(e) => setModelType(e.target.value)}
                                                        >
                                                            {regressors.map((column) => (
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
                                        {getSelectedDatasetName() + ' (id: ' + selectedDatasetID + ')'}
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
                                        {trainingMode == 'CustomModel' ? <> {modelType} (Manual)</> : trainingMode}
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
                                        {metricMode == 'CustomMetric' ? <>{metricType} (Manual) </> : metricMode}
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col>
                                        <ReactStrapButton disabled={loading} onClick={handleTraining} >Start Training</ReactStrapButton>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {
                                            loading ?
                                                <>
                                                    {trainingStatus.status == 'Initialising' ? <LinearProgress /> : null}
                                                    {trainingStatus.status == 'Training' ? <LinearProgressWithLabel value={trainingStatus.progress} /> : null}
                                                    <Typography variant="body2" mt="1rem">
                                                        Please wait while the model is being trained...
                                                    </Typography>
                                                </>
                                                : null
                                        }
                                    </Col>
                                </Row>
                                {loading ?
                                    <Row className="justify-content-center align-items-center">
                                        <Col md="4">
                                            <MuiTable>
                                                <TableRow>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>{trainingStatus.status}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Current Model</TableCell>
                                                    <TableCell>{trainingStatus.model}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Estimated Time Left</TableCell>
                                                    <TableCell>{trainingStatus.estimated_time_left}</TableCell>
                                                </TableRow>
                                            </MuiTable>
                                        </Col>
                                    </Row>
                                    : null}
                                <Row>
                                    <Col>
                                        {trainingCompleted ? <>
                                            <Typography variant="h6" style={{ color: 'green' }}>
                                                <CheckCircleIcon color='success' /> Training Completed Successfully.
                                            </Typography>
                                            Click on Finish to view the model details.
                                        </> : null}
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
                                    // disabled={!trainingCompleted}
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
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

import { Col, Row } from "reactstrap";

function Train() {
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = ['Model Details', 'Training Options', 'Train the model'];
    const democolumns = ['Age', 'Amount', 'Income', 'Fraud Type']

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };
    return (
        <div className="content">
            <Row>
                <Col>
                    <Stepper activeStep={activeStep}>
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
                                <div style={{marginTop: "1.5rem"}}>
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
                                                // onChange={handleChange}
                                                >
                                                    {democolumns.map((column) => (
                                                        <MenuItem value={column}>{column}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
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
                                                // onChange={handleChange}
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
                                                // onChange={handleChange}
                                                >
                                                    {democolumns.map((column) => (
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
                                            <TextField label="Model Name" variant="outlined" fullWidth />
                                        </Col>
                                    </Row>

                                    <Row className="align-items-center mb-3">
                                        <Col md="2">
                                            Select Model Type:
                                        </Col>
                                        <Col md="6">
                                            <FormControl>
                                                <RadioGroup
                                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                                // name="controlled-radio-buttons-group"
                                                // value={value}
                                                // onChange={handleChange}
                                                >
                                                    <FormControlLabel
                                                        value="AutoML"
                                                        control={<Radio />}
                                                        label={
                                                            <div style={{marginTop: '0.8rem'}}>
                                                                AutoML
                                                                <div style={{ fontSize: '12px', color: 'gray'}}>
                                                                    Train a classifier automatically which maximizes the accuracy. The model is trained using various algorithms and the best one is selected.
                                                                </div>
                                                            </div>
                                                        }
                                                    />
                                                    <FormControlLabel
                                                        value="AutoML"
                                                        control={<Radio />}
                                                        label={
                                                            <div style={{marginTop: '0.8rem'}}>
                                                                Select a model type
                                                                <div style={{ fontSize: '12px', color: 'gray'}}>
                                                                    Select a particular model type and train the model.
                                                                </div>
                                                            </div>
                                                        }
                                                    />
                                                </RadioGroup>
                                            </FormControl>
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

                                <Button onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </Box>
                        </React.Fragment>
                    )}
                </Col>
            </Row>
        </div>
    )
}

export default Train;
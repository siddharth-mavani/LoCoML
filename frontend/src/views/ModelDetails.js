import { Typography, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import axios from "axios";
import React, { useEffect } from "react";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Col, Row, Button as ReactStrapButton } from "reactstrap";
import { Table as ReactStrapTable } from "reactstrap";


function ModelDetails() {
    // console.log("ModelDetails");
    const model_id = window.location.pathname.split("/")[2];
    const [loading, setLoading] = React.useState(true);
    const [modelDetails, setModelDetails] = React.useState({});

    React.useEffect(() => {
        // wait for 3 seconds
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        axios.get(process.env.REACT_APP_GET_TRAINED_MODELS_URL + model_id)
            .then(async (response) => {
                setModelDetails(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.log(error);
            })

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="content">
            <Row>
                <Col>
                    <Button
                        onClick={() => { window.history.back() }}
                        style={{
                            marginTop: "0",
                            marginBottom: "1rem"
                        }}
                    >
                        Go Back
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Typography variant="h6" component="h5" gutterBottom>
                        Model Details
                    </Typography>
                </Col>
            </Row>

            {loading ?
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <CircularProgress /> <br />
                    <Typography variant="body1" style={{ marginLeft: '10px' }}>
                        Fetching Model details for {model_id} <br />
                    </Typography>
                    <Typography variant="subtitle1" style={{ marginLeft: '10px' }}>
                        Please wait...
                    </Typography>
                </div> :
                <div>
                    <Row style={{marginBottom: "0.5rem"}}>
                        <Col>
                            Dataset: {modelDetails.dataset_id}
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "0.5rem"}}>
                        <Col>
                            Model ID: {modelDetails.model_id}
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "0.5rem"}}>
                        <Col md="6">
                            Model Name: {modelDetails.model_name}
                        </Col>
                        <Col md="6">
                            Model Type: {modelDetails.estimator_type}
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "0.5rem"}}>
                        <Col md="6">
                            Training Mode: {modelDetails.training_mode}
                        </Col>
                        <Col md="6">
                            Objective: {modelDetails.objective}
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "0.5rem"}}>
                        <Col md="6">
                            Target Column: {modelDetails.target_column}
                        </Col>
                        <Col md="6">
                            Metric: {modelDetails.metric_type}
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '1rem' }}>
                        <Col md="6">
                            <Typography>
                                Parameters of the model:
                            </Typography>
                        </Col>
                        <Col md="6">
                            <Typography>
                                Metrics:
                            </Typography>
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: "1rem" }}>
                        <Col md="6">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Parameter</TableCell>
                                        <TableCell>Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {modelDetails.parameters.map((parameter, index) => {
                                        return (
                                            <TableRow hover size='small' key={index}>
                                                <TableCell>{parameter.parameter_name}</TableCell>
                                                <TableCell>{parameter.parameter_value}</TableCell>
                                            </TableRow>
                                        );

                                    }
                                    )}
                                </TableBody>
                            </Table>
                        </Col>
                        <Col md="6">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Metric</TableCell>
                                        <TableCell>Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {modelDetails.evaluation_metrics.map((metric, index) => {
                                        return (
                                            <TableRow hover size='small' key={index}>
                                                <TableCell>{metric.metric_name}</TableCell>
                                                <TableCell>{metric.metric_value}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Col>
                    </Row>
                    {modelDetails.training_mode.toLowerCase() == 'automl' ?
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
                                        {/* /* make it bold */}
                                        <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                            Show scores of all models trained during AutoML
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <ReactStrapTable striped>
                                            <thead>
                                                <tr>
                                                    <th>Model Type</th>
                                                    {

                                                        Object.keys(modelDetails.all_models_results[0])
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
                                                {modelDetails.all_models_results.map((model) => (
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
                                        </ReactStrapTable>
                                    </AccordionDetails>
                                </Accordion>
                            </Col>
                        </Row>
                        : null}
                </div>
            }
        </div>
    )
}

export default ModelDetails;
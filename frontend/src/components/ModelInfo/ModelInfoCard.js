import React, { useState, useRef, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea, CardActions, Typography } from '@mui/material';
import { Row, Col, Button } from 'reactstrap';
import UpdateIcon from '@mui/icons-material/Update';
import InfoIcon from '@mui/icons-material/Info';
import PublishIcon from '@mui/icons-material/Publish';
import Modal from '@mui/material/Modal';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Table as ReactStrapTable, Collapse } from "reactstrap";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "50%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


const ModelCard = (props) => {
    const modelDetails = props.modelDetails;
    const dataset_map = props.dataset_map;
    const [value, setValue] = React.useState(0);
    const [selectedVersion, setSelectedVersion] = React.useState(1);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [deployModalOpen, setDeployModalOpen] = useState(false);

    function getMetricValue(metric_arr, metric_type) {
        for (var i = 0; i < metric_arr.length; i++) {
            if (metric_arr[i].metric_name === metric_type) {
                return metric_arr[i].metric_value;
            }
        }
    }

    function getDateFromTimestamp(timestamp) {
        console.log(timestamp.$date)
        // get local timestamp
        var utc = new Date(timestamp.$date);
        var date = new Date(utc.getTime() + utc.getTimezoneOffset() * 60 * 1000);
        var dateString = date.toLocaleDateString();
        return dateString;
    }

    function getTimeIn12Hours(timestamp) {
        var utc = new Date(timestamp.$date);
        var date = new Date(utc.getTime() + utc.getTimezoneOffset() * 60 * 1000);
        // get timestring in 12 hours format (get only hours and minutes)
        var timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return timeString;
    }

    const onClickDeploy = () => {
        setDeployModalOpen(true);
    }

    return (
        <>
            <Card>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div" style={{ textAlign: "center", marginBottom: '1rem' }}>
                            {modelDetails.model_name}
                        </Typography>
                        <Typography>
                            <Row style={{ marginBottom: '1rem' }}>
                                <Col md="6">Estimator Type:</Col>
                                <Col md="6" style={{ textAlign: "right" }}>{modelDetails.estimator_type}</Col>
                            </Row>
                            <Row style={{ marginBottom: '1rem' }}>
                                <Col md="6">Objective:</Col>
                                <Col md="6" style={{ textAlign: "right" }}>{modelDetails.objective}</Col>
                            </Row>
                            <Row style={{ marginBottom: '1rem' }}>
                                <Col md="6">Metric:</Col>
                                <Col md="6" style={{ textAlign: "right" }}>{modelDetails.metric_type}</Col>
                            </Row>
                            <Row style={{ marginBottom: '1rem' }}>
                                <Col md="6" style={{ fontWeight: "bold" }}>Metric Score:</Col>
                                <Col md="6" style={{ textAlign: "right", fontWeight: "bold" }}>{getMetricValue(modelDetails.evaluation_metrics, modelDetails.metric_type)}</Col>
                            </Row>
                            <Row style={{ marginBottom: '1rem' }}>
                                <Col md="6">Training Mode:</Col>
                                <Col md="6" style={{ textAlign: "right" }}>{modelDetails.training_mode}</Col>
                            </Row>
                            <Row style={{ marginBottom: '1rem' }}>
                                <Col md="6">Created:</Col>
                                <Col md="6" style={{ textAlign: "right" }}>{getDateFromTimestamp(modelDetails.time)}, {getTimeIn12Hours(modelDetails.time)}</Col>
                            </Row>
                            <Row style={{ marginBottom: '1rem' }}>
                                <Col md="4">Dataset:</Col>
                                <Col md="8" style={{ textAlign: "right" }}>{dataset_map[modelDetails.dataset_id]} (ID:{(modelDetails.dataset_id)})</Col>
                            </Row>
                            <Row>
                                <Col md="6">Versions Available:</Col>
                                <Col md="6" style={{ textAlign: "right" }}>{modelDetails.versions.length}</Col>
                            </Row>
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions style={{ justifyContent: 'space-between' }}>
                    <Button size="small" color="info" onClick={() => { window.location.href = "/models/" + modelDetails.model_id }}>
                        <InfoIcon />
                        View Details
                    </Button>
                    <Button
                        size="small"
                        style={{ backgroundColor: '#ffab05', color: 'black' }}
                        onClick={() => { window.location.href = "/update/model/" + modelDetails.model_id }}
                    >
                        <UpdateIcon />   Update
                    </Button>
                    <Button size="small"
                        style={{ backgroundColor: '#80c55d', color: 'black' }}
                        onClick={() => { onClickDeploy() }}>
                        <PublishIcon /> Deploy
                    </Button>
                </CardActions>
            </Card>
            <Modal open={deployModalOpen} onClose={() => setDeployModalOpen(false)}>
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5"
                        style={{ textAlign: "center", marginBottom: '1.5rem' }}
                    >
                        Model Deployment
                    </Typography>
                    <Typography
                        variant="h6"
                        // bold
                        style={{textAlign: "center", marginBottom: '1.5rem' }}
                    >
                        {modelDetails.model_name} (ID: {modelDetails.model_id})
                    </Typography>
                    <Typography>
                        <Row className="align-items-center mb-3">
                            <Col md="3">
                                Select Version:
                            </Col>
                            <Col md="2">
                                <select
                                    className="form-control"
                                    value={selectedVersion}
                                    onChange={(e) => setSelectedVersion(e.target.value)}
                                >
                                    {modelDetails.versions.map((version, index) => {
                                        return (
                                            <option value={version.version_number}>{version.version_number}</option>
                                        );
                                    })}
                                </select>
                            </Col>
                            <Col md="7">
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={value} onChange={handleChange}>
                                        <Tab label="Metrics" {...a11yProps(0)} />
                                        <Tab label="Parameters" {...a11yProps(1)} />
                                    </Tabs>
                                </Box>
                                <CustomTabPanel value={value} index={0}>
                                    <ReactStrapTable striped>
                                        <thead>
                                            <tr>
                                                <th>Metric</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modelDetails.versions[selectedVersion - 1].evaluation_metrics.map((metric, index) => {

                                                if (metric.metric_name != 'classifier') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{metric.metric_name}</td>
                                                            <td>{metric.metric_value}</td>
                                                        </tr>)
                                                }
                                                else {
                                                    return null;
                                                }
                                                ;
                                            })}
                                        </tbody>
                                    </ReactStrapTable>
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={1}>
                                    <ReactStrapTable striped>
                                        <thead>
                                            <tr>
                                                <th>Parameter</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modelDetails.versions[selectedVersion - 1].parameters.map((parameter, index) => {
                                                return (
                                                    <tr hover size='small' key={index}>
                                                        <td>{parameter.parameter_name}</td>
                                                        <td>{parameter.parameter_value}</td>
                                                    </tr>
                                                );
                                            }
                                            )}
                                        </tbody>
                                    </ReactStrapTable>
                                </CustomTabPanel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="6" style={{textAlign: "center"}}>
                                <Button size="large" color="info" onClick={() => setDeployModalOpen(false)}>Cancel</Button>
                            </Col>
                            <Col md="6" style={{textAlign: "center"}}>
                                <Button size="large" color="success">Deploy</Button>
                            </Col>
                        </Row>
                    </Typography>
                </Box>
            </Modal>
        </>

    )
}

export default ModelCard;
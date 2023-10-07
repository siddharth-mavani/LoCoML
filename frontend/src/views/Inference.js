import React, { useEffect } from "react";
import axios from "axios";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { IconButton } from "@mui/material";
import { CircularProgress, Typography } from "@mui/material";


function Inference() {
    const [loading, setLoading] = React.useState(true);
    const [predMode, setModeType] = React.useState(""); 
    const [targetColumn, setTargetColumn] = React.useState("");
    const [selectedModel, setSelectedModel] = React.useState("");
    const [singlePrediction, setSinglePrediction] = React.useState("");
    const [inferenceReceived, setInferenceReceived] = React.useState(false);

    const [datasets, setDatasets] = React.useState({});
    const [trainedModels, setTrainedModels] = React.useState([]);
    const [userInputValues, setUserInputValues] = React.useState({});
    const [selectedDatasetColumns, setSelectedDatasetColumns] = React.useState([]);


    React.useEffect(() => {
        // wait for 3 seconds
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        axios.get(process.env.REACT_APP_GET_ALL_DATASETS_URL)
            .then((response) => {
                console.log(response.data);
                var dataset_map = {}
                for (var i = 0; i < response.data.dataset_list.length; i++) {
                    dataset_map[response.data.dataset_list[i].dataset_id] = response.data.dataset_list[i].dataset_name;
                }
                setDatasets(dataset_map);
            }).catch((error) => {
                console.log(error);
            })


        axios.get(process.env.REACT_APP_GET_TRAINED_MODELS_URL)
            .then(async (response) => {
                console.log(response.data);
                var temp = [];
                for (var i = 0; i < response.data.trained_models.length; i++) {
                    try {
                        var parsed_model = JSON.parse(response.data.trained_models[i]);
                        temp.push(parsed_model);
                    } catch (error) {
                        console.error(`Invalid JSON in response.data.trained_models[${i}]:`, response.data.trained_models[i]);
                    }
                }
                setTrainedModels(temp);
            })
            .catch((error) => {
                console.log(error);
            })

        return () => clearTimeout(timer);
    }, []);

    function handleSelectSingle(model) {
        setSelectedModel(model);
        setTargetColumn(model.target_column);

        setModeType("single");

        console.log(model.input_schema);
        setSelectedDatasetColumns(model.input_schema)
    }

    function handleSelectBatch(model) {
        setSelectedModel(model);
        setTargetColumn(model.target_column);

        setModeType("batch");

        axios.get(process.env.REACT_APP_GET_DATASET_COLUMNS_URL + '/' + model.model_name)
            .then((response) => {
                console.log(response.data.columns);
                setSelectedDatasetColumns(response.data.non_target_columns);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    function handleInputChange(column, value) {
        setUserInputValues({
            ...userInputValues,
            [column]: value
        });
    }

    function handleInference() {
        console.log(userInputValues);

        let columns = [];
        // Check for empty values
        for (var i = 0; i < selectedDatasetColumns.length; i++) {
            if (userInputValues[selectedDatasetColumns[i].column_name] === undefined) {
                alert("Please fill in all the values");
                return;
            }
            columns.push(selectedDatasetColumns[i].column_name);
        }

        axios.post(process.env.REACT_APP_INFERENCE_SINGLE, {
            non_target_columns: columns,
            user_input_values: userInputValues,
            model: selectedModel
            })
            .then((response) => {
                console.log(response.data);
                setSinglePrediction(response.data.prediction);
                setInferenceReceived(true);
            })
            .catch((error) => {
                console.log(error);
            })

        // setUserInputValues({});
        // setSelectedModel("");
        // setTargetColumn("");
        // setSelectedDatasetColumns([]);
    }

    return (
        <div className="content">
            {loading ?
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <CircularProgress /> <br />
                    <Typography variant="h6" style={{ marginLeft: '10px' }}>
                        Fetching Trained Models <br />
                    </Typography>
                    <Typography variant="subtitle1" style={{ marginLeft: '10px' }}>
                        Please wait...
                    </Typography>
                </div> :
                selectedModel === "" ?
                    <Table striped bordered hover>
                        <TableHead>
                            <TableRow>
                                <TableCell className="text-center" style={{ fontWeight: 'bold' }}>Dataset</TableCell>
                                <TableCell className="text-center" style={{ fontWeight: 'bold' }}>Model Name</TableCell>
                                <TableCell className="text-center" style={{ fontWeight: 'bold' }}>Model Type</TableCell>
                                <TableCell className="text-center" style={{ fontWeight: 'bold' }}>Target Column</TableCell>
                                <TableCell className="text-center" style={{ fontWeight: 'bold' }}>Option</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trainedModels.map((model, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell className="text-center">{datasets[model.dataset_id]} (id: {model.dataset_id} )</TableCell>
                                        <TableCell className="text-center"
                                            style={{
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.location.href = `/models/${model.model_name}`}
                                        >
                                            <Typography variant="body1" style={{ color: '#007bff' }}>
                                                {model.model_name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell className="text-center">{model.estimator_type}</TableCell>
                                        <TableCell className="text-center">{model.target_column}</TableCell>
                                        <TableCell className="text-center">
                                            <Button color="secondary" onClick={() => handleSelectSingle(model)}>Single Case</Button>
                                            <Button color="secondary" onClick={() => handleSelectBatch(model)}>Batch</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table> : 
                    predMode === "single" ? <>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell className="text-center" style={{ fontWeight: 'bold' }}>Column Name</TableCell>
                                    <TableCell className="text-center" style={{ fontWeight: 'bold' }}>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedDatasetColumns.map((column, index) => {
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="text-center">{column.column_name}</TableCell>
                                            <TableCell className="text-center">
                                                    <input
                                                        type={column.column_type === 'int64' ? 'number' : 'text'}
                                                        placeholder={`Enter value for ${column.column_name}`}
                                                        value={userInputValues[column.column_name] || ''}
                                                        onChange={(e) => handleInputChange(column.column_name, e.target.value)}
                                                    />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {inferenceReceived ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                            <Typography variant="h6" style={{ marginBottom: '10px' }}>
                                Prediction Result
                            </Typography>
                            <Typography variant="h4" style={{ color: '#3f51b5' }}>
                                Predicted Value: {singlePrediction}
                            </Typography>
                        </div>
                    ) : (
                        <div className="center-button" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleInference}
                                style={{ marginTop: '10px' }}
                            >
                                Run Inference
                            </Button>
                        </div>
                    )}

                </> : <>
                    batch
                </>
            }
        </div>
    );
}

export default Inference;
# BTP-2

Team Members:
Ayush Agrawal (2020101025)

Siddharth Mavani (2020101122)

Rohan Chowdary

Project Guide:
Dr. Karthik Vaidhyanathan

## Backend API Documentation
### `APIs` Folder
All the APIs are present in the `APIs` folder.
Description of all files & APIs in it:
- ##### `getDatasets.py`

    Consists of dataset related queries on the database
    - `/getDatasets`
    
        `GET` method
        
        Returns information of all datasets present in the database as a list. Each list is an object whose structure was given earlier.
        
        Return object: 
        ```
            {
                'dataset_list' : dataset_list
            }
        ```
        `dataset_list` is a list of objects of type dataset.
        
    - `/getDatasetInfo/<dataset_id>`
    
        `GET` method
        
        Returns information about the dataset having id as `dataset_id`.
        
        Return Object:
        ```
            dataset
        ```
        It directly returns an object of the type dataset which corresponds to the details of the dataset with dataset id `dataset_id`. 
        
    - `/getDatasets/<dataset_id>`
    
        `GET` method
        
        Returns the dataset file corressponding to dataset id `dataset_id`.
    
    - `/getDatasets/columns/<model_name>`
    
        `GET` method
        
        Returns the column names of the dataset on which the model corresponding to `model_name` was trained.
        
        Return Object:
        ```
            {
                'target_column': target_column_name, 
                'non_target_columns': other_column_names_list
            }
        ```
- ##### `getTrainedModels.py`
    
    Consists of queries related to fetching information about already trained models in the database.
    - `/getTrainedModels`
    - 
        `GET` method

        Returns information of all models present in the database as a list. Each list is an object whose structure is of type Model.
        
        Return object: 
        ```
            {
                'trained_models': trained_model_list
            }
        ```
        `trained_model_list` is a list of objects of type Model.
    
    - `/getTrainedModels/<model_id>`
    
        `GET` method
        
         Returns information about the model having id as `model_id`.
         
        Return Object:
        ```
            Model
        ```
        It directly returns an object of the type Model which corresponds to the details of the model with model id `model_id`.
        
    - `/getTrainedModelFile/<model_id>/<version>`
    
        `GET` method    
        
        Returns the pickle file of the model with model_id `model_id` and version number as `version`

- ##### `storeDataset.py`

    Consists of queries related to storing new dataset in the database.

    - `/storeDataset`
    
        `POST` method
        
        Takes in a request form object in body and saves the dataset info like name, size etc. in the database and the actual dataset file on local disk.
        
        The request body for this API endpoint would be a form-data type. Here's the structure:
    
        ```
        {
          "file": (binary),
          "filename": (string),
          "filesize": (string)
        }
        ```
        - `file`: This is the file that you want to upload. It should be sent as binary data.
        - `filename`: This is the name of the file. It should be sent as a string.
        - `filesize`: This is the size of the file. It should also be sent as a string.
        
        Return Object:
        ```
        {
            'status': 'success', 
            'dataset_id': dataset_id, 
            'dataset_name': dataset_name
        }
        ```

- ##### `trainModel.py`

    Consists of endpoint which trains a new model.
    
    - `/trainModel`
    
        `POST` method
        
        Takes in all the fields necessary for training a model and trains a new model accordingly. After training, it stores the model info in database and model pickle file on local disk system.
       
        The request body for the API-endpoint is a JSON object:
        ```
            {
              "dataset_id": "string",
              "model_name": "string",
              "target_column": "string",
              "objective": "string",
              "metric_mode": "string",
              "metric_type": "string",
              "training_mode": "string",
              "model_type": "string",
              "isUpdate": "string",
              "hyperparameters": "object",
              "model_id": "string or integer"
            }
        ```
        It calls the appropriate subprocess depending on the fields and returns an object of the type Model containing all the details of the model trained.
    
- ##### `updateModel.py`

    Consists of endpoints related to updating a model. We can update model in 3 ways: Training on additional data, changing the hyperparameters, or changing the type of the estimator. The newly trained model is stored as a new version of the existing model.
    
    - `/trainOnMoreData`
    
        `POST` method
        
        This method takes the new dataset file and the model details to train a new model on the concatenated data (concatenation of original data and the new data).
        
        The request body for this endpoint would be a form-data type.
        ```
            {
              "original_dataset_id": "string",
              "file": (binary),
              "model_name": "string",
              "target_column": "string",
              "objective": "string",
              "metric_mode": "string",
              "metric_type": "string",
              "model_type": "string",
              "model_id": "string or integer"
            }
        ```
        It internally calls the `/trainModel` API with appropriate parameters.
        It returns a object which contains information about the new version of the model.
        
    - `/changeHyperparameters`
    
        `POST` method
        
        It takes in the new hyperparameters selected for the model and trains it on the same dataset with the new hyperparameters.
       
        The request body for the API-endpoint is a JSON object:
        ```
        {
          "model_details": {
            "dataset_id": "string or integer",
            "model_id": "string or integer",
            "model_name": "string",
            "target_column": "string",
            "objective": "string",
            "metric_mode": "string",
            "metric_type": "string",
            "estimator_type": "string"
          },
          "new_hyperparameters": "object"
        }
        ```
        It internally calls the `/trainModel` API with appropriate parameters.
        
        It returns a object which contains information about the new version of the model.
        
    - `/changeEstimatorType`
    
        `POST` method
        
        It takes in the new estimator type for current model and trains it on the same dataset with the changed estimator. It also takes the modified hyperparameters (if  modified by the user).
        
        The request body for the API-endpoint is a JSON object:
        ```
        {
          "model_details": {
            "dataset_id": "string or integer",
            "model_id": "string or integer",
            "model_name": "string",
            "target_column": "string",
            "objective": "string",
            "metric_mode": "string",
            "metric_type": "string"
          },
          "new_hyperparameters": "object",
          "estimator_type": "string"
        }
        ```
        It internally calls the `/trainModel` API with appropriate parameters.
        
        It returns a object which contains information about the new version of the model.
    
- ##### `utilities.py`
    Contains endpoints that provide utility information such as Classifiers, regressors, parameters for a classifier etc.
    
    - `/getAllClassifiers`
       
         `GET` method

        Returns the list of classifiers available to train.
    
    - `/getAllRegressors`
        
        `GET` method
        
        Returns the list of regressors available to train.
    
    - `/getClassifierMap`
        
        `GET` method
        
        Returns the classifier map object which maps a classifier's name to its corressponding sklearn classifier's name.
    
    - `/getRegressorMap`
        
        `GET` method
       
        Returns the regressor map object which maps a regressor's name to its corressponding sklearn regressor's name.
    
    - `/getHyperparameters`
        
        `POST` method
        
        The request body would be a JSON object:
        ```
        {
          "estimator_name": "string"
        }
        ```
        Returns the object which contains hyperparameters for the given estimator.
        
### `functions` Folder

It consists of functions that are used by API files in `APIs` folder.
Description of all files in it:

- ##### `ClassificationUtility.py`
    Contains the class `ClassificationUtility` which is used to train models by `trainModelAutoML.py` and `trainModelCustom.py`.
    

    It is designed to facilitate the process of training and evaluating various classification models on a given dataset. It includes methods for data preprocessing, model training, evaluation, and saving the trained model.

    Key features of this class include:
    
    - It supports both AutoML (automated machine learning) and custom training modes. In AutoML mode, it trains multiple classifiers and selects the best one based on a specified metric. - In custom mode, it trains a specified model with given hyperparameters.
    
    - It handles categorical and numerical features separately during preprocessing. Categorical features with high cardinality are target encoded, while others are one-hot encoded. Numerical features are scaled.
    
    - It calculates various evaluation metrics such as accuracy, precision, recall, F1 score, and AUC (Area Under the ROC Curve) for the trained models.
    
    - It provides methods to get feature importance, precision-recall data, and AUC data.
    
    - It allows saving the best model to a specified path.
- ##### `RegressionUtility.py`
    Contains the class `RegressionUtility` which is used to train models by `trainModelAutoML.py` and `trainModelCustom.py`.
    

    It is designed to facilitate the process of training and evaluating various regression models on a given dataset. It includes methods for data preprocessing, model training, evaluation, and saving the trained model.

    Key features of this class include:

    - It supports both AutoML (automated machine learning) and custom training modes. In AutoML mode, it trains multiple regressors and selects the best one based on a specified metric. In custom mode, it trains a specified model with given hyperparameters.
    
    - It handles categorical and numerical features separately during preprocessing. Categorical features with high cardinality are target encoded, while others are one-hot encoded. Numerical features are scaled.
    
    - It calculates various evaluation metrics such as R2 score, Mean Absolute Error (MAE), Mean Squared Error (MSE), and Root Mean Squared Error (RMSE) for the trained models.
    
    - It provides methods to get feature importance, scatter plot data, and residual plot data.
    
    - It allows saving the best model to a specified path.
- ##### `trainModelAutoML.py`
    Contains the function which trains a model for classification/regression in AutoML mode i.e. it trains all the available classifiers on the dataset and stores the results/metrics in the database.

    Brief outline of working of the function:
    - It reads the dataset from a CSV file.
    - If the metric_mode is set to 'autoselect', it automatically selects an appropriate evaluation metric based on the task (classification or regression) and the balance of the target classes (for classification).
    - It initializes a ClassificationUtility or RegressionUtility object based on the task.
    - It trains the model using AutoML.
    - It retrieves the best model and its parameters based on the specified or auto-selected metric.
    - It prepares a list of evaluation metrics and model parameters.
    - It saves the best model to a file.
    - It generates various visualization data such as confusion matrix, feature importance, precision-recall curve, ROC curve, scatter plot, and residual plot.
    - It saves the model metadata including training time, model ID, model name, training mode, estimator type, metric mode, metric type, saved model path, dataset ID, objective, target column, parameters, evaluation metrics, all models' results, input schema, output schema, output mapping, and graph data to a MongoDB collection named 'Model_zoo'.
    - It returns the model metadata as a dictionary.
The function is designed to be run from the command line with arguments for dataset ID, model name, model type, hyperparameters, target column, metric mode, metric type, objective, model ID, and update status. 

- ##### `trainModelCustom.py`
    It provides a similar functionality as `trainModelAutoML.py` with the only difference being it trains a given model instead of training all available models.

### `Enums` Folder
The enums folder contains `enums.py` file which contains enumerations for metrics, classifiers and regressors.

### `Datasets` folder
It is used to store the `.csv` files of the dataset on the local disk system.

### `Models` folder
It is used to store the `.pkl` files of trained models on the local disk system.

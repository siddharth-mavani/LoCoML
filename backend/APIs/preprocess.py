import pandas as pd
from flask import Blueprint, jsonify, request

preprocess = Blueprint('preprocess', __name__)

@preprocess.route('/preprocess', methods=['POST'])
def preprocessDataset():
    dataset_name = request.json['name']
    dataset_path = './Datasets/'+dataset_name
    
    # Access finalTasks from request data
    finalTasks = request.json['tasks']
    
    # Read the csv file
    df = pd.read_csv(dataset_path)
    
    # Perform preprocessing tasks based on finalTasks
    if "Drop Duplicate Rows" in finalTasks:
        df = df.drop_duplicates()
    
    if "Interpolate Missing Values" in finalTasks:
        for column in df.columns:
            if df[column].dtype == 'object':
                df[column] = df[column].fillna(df[column].mode()[0])
            else:
                df[column] = df[column].fillna(df[column].mean())
    
    if "Normalise Features" in finalTasks:
        for column in df.columns:
            if df[column].dtype != 'object':
                df[column] = (df[column] - df[column].min()) / (df[column].max() - df[column].min())

    processed_dataset_path = './processedDatasets/' + dataset_name
    df.to_csv(processed_dataset_path, index=False)
    
    return jsonify({'message': 'Preprocessing completed successfully'}), 200
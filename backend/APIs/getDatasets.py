from flask import Blueprint, send_file
from mongo import db

import os
getDatasets = Blueprint('getDatasets', __name__)

@getDatasets.route('/getDatasets')
def getDatasetList():
    # read all files from Datasets folder
    # return list of files

    dataset_path = './processedDatasets'
    dataset_list = os.listdir(dataset_path)
    return {'datasets': dataset_list}

@getDatasets.route('/getDatasets/<dataset_name>')
def getDatasetFile(dataset_name):
    # read file from Datasets folder
    # return file

    dataset_path = './processedDatasets/'+dataset_name
    # dataset_file = open(dataset_path + '/' + dataset_name)
    return send_file(dataset_path)

@getDatasets.route('/getDatasets/columns/<model_name>')
def getDatasetColumns(model_name):
    collection = db['Models_Trained']
    data = collection.find_one({'model_name': model_name})
    return {'target_column': data['target_column'], 'non_target_columns': data['non_target_columns']}
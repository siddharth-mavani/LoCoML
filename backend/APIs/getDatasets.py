from flask import Blueprint, send_file
from mongo import db

import os
import sys 
sys.path.append(os.getenv('PROJECT_PATH'))

from mongo import db

getDatasets = Blueprint('getDatasets', __name__)

@getDatasets.route('/getDatasets')
def getDatasetList():
    # read all files from Datasets folder
    # return list of files
    collection = db['Datasets']

    dataset_list = collection.find({})
    dataset_list = list(dataset_list)
    for i in range(len(dataset_list)):
        dataset_list[i]['_id'] = str(dataset_list[i]['_id'])
        # dataset_list[i]['time'] = str(dataset_list[i]['time'])
    return {'dataset_list': dataset_list}

@getDatasets.route('/getDatasets/<dataset_id>')
def getDatasetFile(dataset_id):
    # read file from Datasets folder
    # return file
    dataset_path = './Datasets/'+dataset_id+'.csv'
    # dataset_file = open(dataset_path + '/' + dataset_name)
    return send_file(dataset_path)

@getDatasets.route('/getDatasets/columns/<model_name>')
def getDatasetColumns(model_name):
    collection = db['Models_Trained']
    
    data = collection.find_one({'model_name': model_name})
    return {'target_column': data['target_column'], 'non_target_columns': data['non_target_columns']}
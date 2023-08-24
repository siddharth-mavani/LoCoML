from flask import Blueprint, request, send_file

import os
trainModelAPIs = Blueprint('trainModel', __name__)

@trainModelAPIs.route('/trainModel', methods=['POST'])
def trainModel():
    # get dataset name from request
    data = request.get_json()
    dataset_name = data['dataset_name']
    model_name = data['model_name']

    # read file from Datasets folder
    with open('./Datasets/'+dataset_name, 'r') as dataset_file:
        dataset = dataset_file.read()
    
    # train model
    return {'dataset': dataset}

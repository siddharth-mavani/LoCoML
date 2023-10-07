from flask import Blueprint, request
import sys 
sys.path.append('../')

from mongo import db
import os
import bson.json_util as json_util
getTrainedModels = Blueprint('getTrainedModels', __name__)

@getTrainedModels.route('/getTrainedModels', methods=['GET'])
def getTrainedModelList():
    collection = db['Model_zoo']
    trained_model_list = []

    for model in collection.find():
        trained_model_list.append(json_util.dumps(model))
        
    return {'trained_models': trained_model_list}

@getTrainedModels.route('/getTrainedModels/<model_id>', methods=['GET'])
def getTrainedModel(model_id):
    # get model_id from endpoint
    # model_id = request.view_args['model_id']
    print(model_id)
    collection = db['Model_zoo']
    trained_model = collection.find_one({'model_id': model_id})
    return json_util.dumps(trained_model)
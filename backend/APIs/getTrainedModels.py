from flask import Blueprint
import sys 
sys.path.append('../')

from mongo import db
import os
import bson.json_util as json_util
getTrainedModels = Blueprint('getTrainedModels', __name__)

@getTrainedModels.route('/getTrainedModels', methods=['GET'])
def getTrainedModelList():
    collection = db['Models_Trained']
    trained_model_list = []

    for model in collection.find():
        trained_model_list.append(json_util.dumps(model))
        
    return {'trained_models': trained_model_list}
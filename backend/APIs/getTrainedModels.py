from flask import Blueprint, request
import sys 
sys.path.append('../')
from mongo import db
import os
import bson.json_util as json_util
from flask import send_file
getTrainedModels = Blueprint('getTrainedModels', __name__)

@getTrainedModels.route('/getTrainedModels', methods=['GET'])
def getTrainedModelList():
    collection = db['Model_zoo']
    trained_model_list = []

    for model in collection.find():
        print(type(model))
        model.pop('_id')
        trained_model_list.append(json_util.dumps(model))
        
    # return {'trained_models': trained_model_list}
    return json_util.dumps({'trained_models': trained_model_list})

@getTrainedModels.route('/getTrainedModels/<model_id>', methods=['GET'])
def getTrainedModel(model_id):
    # get model_id from endpoint
    # model_id = request.view_args['model_id']
    print(model_id)
    collection = db['Model_zoo']
    trained_model = collection.find_one({'model_id': model_id})
    # sort version array according to the date
    trained_model['versions'].sort(key=lambda x: x['time'], reverse=True)
    return json_util.dumps(trained_model)

@getTrainedModels.route('/getTrainedModelFile/<model_id>/<version>', methods=['GET'])
def getTrainedModelFile(model_id, version):
    version = int(version)
    collection = db['Model_zoo']
    trained_model = collection.find_one({'model_id': model_id})
    # sort version array according to the date
    model_path = trained_model['versions'][version-1]['saved_model_path']
    relative_path = model_path[model_path.find('Models'):]
    cur_path = os.getenv('PROJECT_PATH') + relative_path
    return send_file(cur_path)
import pandas as pd
from mongo import db
from flask import Blueprint, jsonify, request
import joblib
import json

inference_blueprint = Blueprint('inference', __name__)

@inference_blueprint.route('/inference', methods=['POST'])
def inference_route():
    print("inference")
    return jsonify({'result': 'inference'})

def processData(user_input, model_input_schema):
   
    # Check if columns match
    if len(user_input.columns) != len(model_input_schema):
        return []
    
    # Get all numeric column name from model_input_schema
    numeric_columns = []
    for column in model_input_schema:
        if "int" in column["column_type"] or "float" in column["column_type"]:
            numeric_columns.append(column["column_name"])

    # interate through user_input and convert to numeric if possible
    for column in user_input.columns:
        if column in numeric_columns:
            try:
                user_input[column] = pd.to_numeric(user_input[column])
            except ValueError:
                return []

    return user_input


@inference_blueprint.route('/inference/single', methods=['POST'])
def inference_single():
    model_info = request.json['model']
    model_id = model_info['model_id']
    output_mapping = model_info['output_mapping']
    non_target_columns = request.json['non_target_columns']
    user_input_values = request.json['user_input_values']
    
    # Load the pickled model from the file
    try:
        model_path = model_info['saved_model_path']
        model = joblib.load(model_path)
    except FileNotFoundError:
        return jsonify({'message': 'Model not found'}), 404
    
    # convert user_input_values to dataframe
    user_input_values = pd.DataFrame([user_input_values], columns=non_target_columns)
    user_input_values = processData(user_input_values, model_info['input_schema'])

    if len(user_input_values) == 0:
        return jsonify({'message': 'Invalid user input'}), 400
    
    new_prediction = model.predict(user_input_values)

    final = []
    for i in range(len(new_prediction)): 
        final.append(output_mapping[str(new_prediction[i])])
    
    # Return the prediction
    return jsonify({'prediction': final}), 200


def matchInputSchema(user_input, model_input_schema):
    # Check if columns match
    if len(user_input.columns) != len(model_input_schema):
        return False

    schema_columns = []
    # Chceck if all columns from model_input_schema are in user_input and of the same type
    for column in model_input_schema:
        if column["column_name"] not in user_input.columns:
            return False
        if column["column_type"] not in user_input[column["column_name"]].dtype.name:
            return False
        
        schema_columns.append(column["column_name"])
    
    # check for any extra columns in user_input
    for column in user_input.columns:
        if column not in schema_columns:
            return False

    return True

@inference_blueprint.route('/inference/batch', methods=['POST'])
def inference_batch():
    model_info = json.loads(request.form['model'])
    model_id = model_info['model_id']
    output_mapping = model_info['output_mapping']

    # Load the pickled model from the file
    try:
        model_path = model_info['saved_model_path']
        model = joblib.load(model_path)
    except FileNotFoundError:
        return jsonify({'message': 'Model not found'}), 404

    # Check if a file was uploaded
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']

    # If the user does not select a file, the browser might
    # submit an empty file without a filename.
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    # convert file to dataframe
    user_input = pd.read_csv(file)

    if(not matchInputSchema(user_input, model_info['input_schema'])):
        return jsonify({'message': 'Invalid file format'}), 400

    new_prediction = model.predict(user_input)
    final = []
    # check if output_mapping is empty
    # print(output_mapping)
    if len(output_mapping) != 0:
        for i in range(len(new_prediction)): 
            final.append(output_mapping[str(new_prediction[i])])
    else:
        for i in range(len(new_prediction)): 
            final.append(new_prediction[i])

    # Append the prediction to the dataframe
    user_input['prediction'] = final

    # Return csv file with prediction 
    return user_input.to_csv(index=False), 200


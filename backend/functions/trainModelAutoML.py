from pycaret.classification import ClassificationExperiment
from pycaret.regression import RegressionExperiment
import pandas as pd
import datetime
import pickle
import nanoid
import os
import sys 

project_path = os.getenv('PROJECT_PATH')
sys.path.append(project_path)

from mongo import db

metric_type_map = {
    'Accuracy' : 'Accuracy',
    'AUC' : 'AUC',
    'Precision' : 'Prec.',
    'Recall' : 'Recall',
    'F1' : 'F1',
    'R2 Score' : 'R2',
    'Mean Absolute Error' : 'MAE',
    'Mean Squared Error' : 'MSE',
    'Root Mean Squared Error' : 'RMSE',
}

metric_type_reverse_map = {
    'Accuracy' : 'Accuracy',
    'AUC' : 'AUC',
    'Prec.' : 'Precision',
    'Recall' : 'Recall',
    'F1' : 'F1',
    'R2' : 'R2 Score',
    'MAE' : 'Mean Absolute Error',
    'MSE' : 'Mean Squared Error',
    'RMSE' : 'Root Mean Squared Error',
}

def trainModelAutoML(dataset_id, model_name, target_column, metric_mode, metric_type, objective):
    

    dataset_path = os.getenv('PROJECT_PATH') + 'Datasets/'+dataset_id+'.csv'
    df = pd.read_csv(dataset_path)

    if objective.lower() == 'classification':
        exp = ClassificationExperiment()
    elif objective.lower() == 'regression':
        exp = RegressionExperiment()

    if metric_mode.lower() == 'autoselect':
        if objective.lower() == 'classification':

            class_dist = df[target_column].value_counts()
            is_balanced = class_dist.min() / class_dist.max() > 0.5

            if is_balanced:
                metric_type = 'Accuracy'
            else:
                metric_type = 'AUC'
            
        elif objective.lower() == 'regression':
            metric_type = 'R2'

    df = df[df[target_column].notnull()]
    
    s = exp.setup(df, target=target_column , session_id = 123)

    models_list = []
    if objective.lower() == 'classification':
        models_list = ['lr', 'dt', 'rf', 'ada', 'nb', 'knn', 'svm']
    elif objective.lower() == 'regression':
        models_list = ['ridge', 'br']

    best = exp.compare_models(include = models_list, sort = metric_type_map[metric_type])

    results = exp.pull()

    if objective.lower() == 'classification':
        results.drop(['TT (Sec)','Kappa', 'MCC'], axis=1, inplace=True)
    elif objective.lower() == 'regression':
        results.drop(['TT (Sec)', 'RMSLE', 'MAPE'], axis=1, inplace=True)

    best_model_name = results['Model'][0]
    model_parameters = best.get_params()

    metrics = []
    for metric in results.columns:
        if metric == 'Model':
            continue
        metrics.append({
            'metric_name' : metric_type_reverse_map[metric],
            'metric_value' : results.iloc[0][metric],
        })

    parameters = []
    for key, value in model_parameters.items():
        if value == None:
            value = 'None'
        parameters.append({
            'parameter_name' : key,
            'parameter_value' : value
        })

    print("Saving Model", file=sys.stderr)
    model_id = nanoid.generate(alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', size=6)
    save_path = os.getenv('PROJECT_PATH') + 'Models/' + model_id
    exp.save_model(best, save_path)
    print("Transformation Pipeline and Model Successfully Saved", file=sys.stderr)

    input_schema = exp.get_config('X_train').columns.to_list()
    output_schema = [target_column]

    collection = db['Model_zoo']

    details = {
        'time' : datetime.datetime.now(),
        'model_id' : model_id,
        'model_name' : model_name,
        'training_mode' : 'AutoML',
        'estimator_type' : best_model_name,
        'metric_mode' : metric_mode,
        'metric_type' : metric_type,
        'saved_model_path' : save_path,
        'dataset_id' : dataset_id,
        'objective' : objective,
        'target_column' : target_column,
        'parameters' : parameters,
        'evaluation_metrics' : metrics,
        'all_models_results' : results.to_dict('records'),
        'input_schema' : input_schema,
        'output_schema' : output_schema,
    }

    collection.insert_one(details)
    details.pop('_id')
    return details

dataset_id = sys.argv[1]
model_name = sys.argv[2]
target_column = sys.argv[3]
metric_mode = sys.argv[4]
metric_type = sys.argv[5]
objective = sys.argv[6]
model_type = sys.argv[7] # not needed in automl

details = trainModelAutoML(dataset_id, model_name, target_column, metric_mode, metric_type, objective)
details_path = os.getenv('PROJECT_PATH') + 'Usage/details.pkl'
with open(details_path, 'wb') as f:
    pickle.dump(details, f)
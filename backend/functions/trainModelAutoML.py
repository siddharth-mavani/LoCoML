from pycaret.classification import ClassificationExperiment
from pycaret.regression import RegressionExperiment
import pandas as pd
import datetime
import pickle
import sys 
sys.path.append('../')

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

def trainModelAutoML(dataset_name, model_name, target_column, metric_type, objective):

    dataset_path = './processedDatasets/'+dataset_name
    df = pd.read_csv(dataset_path)

    if objective.lower() == 'classification':
        exp = ClassificationExperiment()
    elif objective.lower() == 'regression':
        exp = RegressionExperiment()

    if metric_type.lower() == 'autoselect':

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

    pickled_model = pickle.dumps(best)

    collection = db['Models_Trained']

    details = {
        'time' : datetime.datetime.now(),
        'model_name' : model_name,
        'pickled_model': 'empty',
        'dataset_name' : dataset_name,
        'target_column' : target_column,
        'objective' : objective,
        'metric_type' : metric_type,
        'model_type' : 'AutoML',
        'best_model_name' : best_model_name,
        'parameters' : parameters,
        'metrics' : metrics,
        'all_models_results' : results.to_dict('records'),
    }

    collection.insert_one(details)
    details.pop('_id')
    return details
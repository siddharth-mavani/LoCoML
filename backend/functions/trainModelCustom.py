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

model_map = {
    'Logistic Regression' : 'lr',
    'Decision Tree' : 'dt',
    'Random Forest' : 'rf',
    'AdaBoost' : 'ada',
    'Naive Bayes' : 'nb',
    'KNN' : 'knn',
    'SVM' : 'svm',
    'Random Forest Regressor' : 'rf',
    'AdaBoost Regressor' : 'ada',
    'Ridge Regression' : 'ridge',
    'Bayesian Ridge' : 'br',
}

def trainModelCustom(dataset_name, model_name, target_column, model_type, metric_type, objective):

    if objective.lower() == 'classification':
        exp = ClassificationExperiment()
    elif objective.lower() == 'regression':
        exp = RegressionExperiment()

    dataset_path = './processedDatasets/'+dataset_name
    df = pd.read_csv(dataset_path)

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

    model = exp.create_model(model_map[model_type])

    results = exp.pull()

    if objective.lower() == 'classification':
        results.drop(['Kappa', 'MCC'], axis=1, inplace=True)
    elif objective.lower() == 'regression':
        results.drop(['RMSLE', 'MAPE'], axis=1, inplace=True)

    model_parameters = model.get_params()

    metrics = []
    for metric in results.columns:
        if metric == 'Model':
            continue
        metrics.append({
            'metric_name' : metric_type_reverse_map[metric],
            'metric_value' : results[results.index == 'Mean'][metric].values[0],
        })

    parameters = []
    for key, value in model_parameters.items():
        if value == None:
            value = 'None'
        parameters.append({
            'parameter_name' : key,
            'parameter_value' : value
        })
    
    pickled_model = pickle.dumps(model)

    collection = db['Models_Trained']

    details = {
        'time' : datetime.datetime.now(),
        'model_name' : model_name,
        'pickled_model': 'empty',
        'dataset_name' : dataset_name,
        'target_column' : target_column,
        'objective' : objective,
        'metric_type' : metric_type,
        'model_type' : 'Manual',
        'best_model_name' : model_type,
        'parameters' : parameters,
        'metrics' : metrics,
        'all_models_results' : 'Not Applicable',
    }
                    
    collection.insert_one(details)
    details.pop('_id')
    return details
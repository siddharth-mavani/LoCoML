
from mongo import db
from flask import Blueprint, request, send_file
import os
import sys
import inspect
import sklearn
sys.path.append(os.getenv('PROJECT_PATH'))
sys.path.append('../')
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.ensemble import AdaBoostClassifier, RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from Enums import enums
utilityAPIs = Blueprint('utilityAPIs', __name__)


classifier_map = {
    enums.Classifiers.AdaBoost.value: 'AdaBoostClassifier',
    enums.Classifiers.DecisionTree.value: 'DecisionTreeClassifier',
    enums.Classifiers.KNN.value: 'KNeighborsClassifier',
    enums.Classifiers.LogisticRegression.value: 'LogisticRegression',
    enums.Classifiers.NaiveBayes.value: 'GaussianNB',
    enums.Classifiers.SVM.value: 'SVC',
    enums.Classifiers.RandomForest.value: 'RandomForestClassifier',
}

reversed_classifier_map = {str(v): k for k, v in classifier_map.items()}

estimator_map = {
    'AdaBoostClassifier' : AdaBoostClassifier,
    'DecisionTreeClassifier' : DecisionTreeClassifier,
    'KNeighborsClassifier' : KNeighborsClassifier,
    'LogisticRegression' : LogisticRegression,
    'GaussianNB' : GaussianNB,
    'SVC' : SVC,
    'RandomForestClassifier' : RandomForestClassifier,
}


@utilityAPIs.route('/getAllClassifiers', methods=['GET'])
def getAllClassifiers():
    classifiers = []
    for cls in enums.Classifiers:
        classifiers.append(cls.value)
    return classifiers


@utilityAPIs.route('/getAllRegressors', methods=['GET'])
def getAllRegressors():
    regressors = []
    for reg in enums.Regressors:
        regressors.append(reg.value)
    return regressors


@utilityAPIs.route('/getClassifierMap', methods=['GET'])
def getClassifiersMap():
    return {
        'forward_map': classifier_map,
        'reverse_map': reversed_classifier_map,
    }


@utilityAPIs.route('/getHyperparameters', methods=['POST'])
def getHyperparameters():
    data = request.json
    print(data)
    estimator_n = data['estimator_name']
    estimator = estimator_map[estimator_n]

    hyperparams = inspect.getfullargspec(estimator.__init__).kwonlydefaults
    print(hyperparams)
    return hyperparams
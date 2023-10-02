from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import LabelEncoder, TargetEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.ensemble import AdaBoostClassifier, RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from tqdm import tqdm
import pandas as pd
import joblib
import os
import sys 
project_path = os.getenv('PROJECT_PATH')
sys.path.append(project_path)
sys.path.append('../Enums/')
from Enums.enums import ClassificationMetrics

import warnings
warnings.filterwarnings("ignore")

class ClassificationUtility():
    def __init__(self, data, target_column):
        self.data = data
        self.target_column = target_column
        self.cardinality_threshold = 10
        self.classifiers = [
            LogisticRegression(max_iter=1000),
            DecisionTreeClassifier(),
            RandomForestClassifier(),
            AdaBoostClassifier(),
            SVC(kernel='linear', max_iter=1000, probability=True),
            GaussianNB(),
            KNeighborsClassifier()
        ]

    def get_numerical_columns(self):
        numerical_columns = []
        for column in self.data.columns:
            if column != self.target_column and (self.data[column].dtype == 'int64' or self.data[column].dtype == 'float64'):
                numerical_columns.append(column)
        self.numerical_columns = numerical_columns
        # return numerical_columns
    
    def get_categorical_columns(self):
        categorical_columns = []
        for column in self.data.columns:
            if self.data[column].dtype == 'object':
                categorical_columns.append(column)
        self.categorical_columns = categorical_columns
        # return categorical_columns

    def get_categorical_column_cardinality(self):
        cardinality = {}
        for column in self.categorical_columns:
            cardinality[column] = len(self.data[column].unique())
        self.cardinality = cardinality

    def get_target_encoding_columns(self):
        target_encoding_columns = []
        for column in self.categorical_columns:
            if column != self.target_column and  self.cardinality[column] > self.cardinality_threshold:
                target_encoding_columns.append(column)
        self.target_encoding_columns = target_encoding_columns
    
    def get_one_hot_encoding_columns(self):
        one_hot_encoding_columns = []
        for column in self.categorical_columns:
            if column != self.target_column and self.cardinality[column] <= self.cardinality_threshold:
                one_hot_encoding_columns.append(column)
        self.one_hot_encoding_columns = one_hot_encoding_columns

    def encode_target_column(self):
        le = LabelEncoder()
        self.data[self.target_column] = le.fit_transform(self.data[self.target_column])
        self.le = le

    def prepare_data(self):
        self.get_numerical_columns()
        self.get_categorical_columns()
        self.get_categorical_column_cardinality()
        self.get_target_encoding_columns()
        self.get_one_hot_encoding_columns()
        self.encode_target_column()

    def get_preprocessor(self):
        numerical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])

        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])

        target_categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('target', TargetEncoder())
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ('numerical', numerical_transformer, self.numerical_columns),
                ('one_hot_encoding', categorical_transformer, self.one_hot_encoding_columns),
                ('target_encoding', target_categorical_transformer, self.target_encoding_columns)
            ]
        )

        self.preprocessor = preprocessor
    
    def get_estimator(self, estimator):

        estimator = Pipeline(steps=[
            ('preprocessor', self.preprocessor),
            ('classifier', estimator)
        ])
        self.estimator = estimator
    
    def trainAutoML(self):
        self.prepare_data()
        self.get_preprocessor()
        print("Status: Setting up AutoML Training", file=sys.stderr)
        classification_metrics = ClassificationMetrics
        
        results = []
        trained_models = {}

        pbar = tqdm(self.classifiers)
        for classifier in pbar:
            self.get_estimator(classifier)
            X = self.data.drop(self.target_column, axis=1)
            y = self.data[self.target_column]
            pbar.set_description("Status: %s Current Classifier: %s Processing" % ('Training', classifier.__class__.__name__))
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            self.estimator.fit(X_train, y_train)

            trained_models[classifier.__class__.__name__] = self.estimator

            y_pred = self.estimator.predict(X_test)
            # print(y_pred)

            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='macro')
            recall = recall_score(y_test, y_pred, average='macro')
            f1 = f1_score(y_test, y_pred, average='macro')
            if len(self.le.classes_) == 2:
                auc = roc_auc_score(y_test, self.estimator.predict_proba(X_test)[:, 1])
            else:
                auc = roc_auc_score(y_test, self.estimator.predict_proba(X_test), average='macro', multi_class='ovo')

            results.append({
                'classifier' : classifier.__class__.__name__,
                classification_metrics.Accuracy.value : round(accuracy, 4),
                classification_metrics.Precision.value : round(precision, 4),
                classification_metrics.Recall.value : round(recall, 4),
                classification_metrics.F1.value : round(f1, 4),
                classification_metrics.AUC.value : round(auc, 4)
            })
        
        self.trained_models = trained_models
        self.results = pd.DataFrame(results)

    def getBestModel(self, metric):
        self.results.sort_values(by=metric, ascending=False, inplace=True)
        self.best_model = self.results.iloc[0]
        return self.best_model
    
    def saveModel(self, model_name, save_path):
        joblib.dump(self.trained_models[model_name], save_path)
        self.save_path = save_path
    
    def get_input_schema(self):
        self.input_schema = []
        for column in self.data.columns:
            if column != self.target_column:
                self.input_schema.append({
                    'column_name' : column,
                    'column_type' : self.data[column].dtype.name
                })
        return self.input_schema
    
    def get_output_schema(self):
        self.output_schema = []
        self.output_schema.append({
            'column_name' : self.target_column,
            'column_type' : self.data[self.target_column].dtype.name
        })
        return self.output_schema
    
    def get_output_mapping(self):
        self.output_mapping = {}
        for i, class_name in enumerate(self.le.classes_):
            self.output_mapping[str(class_name)] = i
        return self.output_mapping
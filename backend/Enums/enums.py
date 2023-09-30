from enum import Enum

class TrainingMode(Enum):
    AUTOML = "Automl"
    CUSTOM = "Custom"

class TrainingObjective(Enum):
    REGRESSION = "Regression"
    CLASSIFICATION = "Classification"

class ClassificationMetrics(Enum):
    Accuracy = "Accuracy"
    AUC = "AUC"
    Precision = "Precision"
    Recall = "Recall"
    F1 = "F1"

class RegressionMetrics(Enum):
    R2 = "R2 Score"
    MAE = "Mean Absolute Error"
    MSE = "Mean Squared Error"
    RMSE = "Root Mean Squared Error"
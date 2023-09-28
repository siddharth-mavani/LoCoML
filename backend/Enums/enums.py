from enum import Enum

class TrainingMode(Enum):
    AUTOML = "Automl"
    CUSTOM = "Custom"

class TrainingObjective(Enum):
    REGRESSION = "Regression"
    CLASSIFICATION = "Classification"


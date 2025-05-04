import pandas as pd

# Number of test samples (replace with the actual number from the competition)
num_samples = 28000  # Common for Kaggle's Digit Recognizer challenge

# Generate predictions using a simple pattern (cycling through digits 0-9)
predictions = [i % 10 for i in range(num_samples)]

# Create a submission DataFrame
submission = pd.DataFrame({
    "ImageId": range(1, num_samples + 1),  # ImageId starts from 1
    "Label": predictions  # Predictions (0-9)
})

# Save the DataFrame to a CSV file
submission.to_csv("submissionlast.csv", index=False)

print("Mock submission file 'submission.csv' created successfully!")

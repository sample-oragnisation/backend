const mongoose = require('mongoose');
const { exec } = require('child_process');
const Electric = require('../models/electric'); // Adjust the path as needed

// Function to fetch last 50 days of data
const fetchLast50DaysData = async () => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 50);

    const data = await Electric.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });  // Ensure data is sorted by date

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Function to call Python script
const predictWithPython = (data) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = process.env.PYTHON_SCRIPT_PATH;
    const pythonProcess = exec(`python3 ${pythonScriptPath}`, {
      env: { ...process.env, DATA: JSON.stringify(data) }
    });

    pythonProcess.stdout.on('data', (data) => {
      resolve(data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      reject(data.toString());
    });
  });
};

// API endpoint to get prediction
const getPrediction = async (req, res) => {
  try {
    const data = await fetchLast50DaysData();
    const prediction = await predictWithPython(data);
    res.status(200).json({ prediction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  getPrediction
};

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getPrediction } = require('../prediction/prediction');
const {
  login,
  extract,
  getElectricData ,
  getSolarData 

} = require('../controller/energy');

router.post('/login', login);
router.get('/energyData/:date',extract);
router.get('/electricPie/:date', getElectricData);
router.get('/solarPie/:date', getSolarData);
router.get('/predict', getPrediction);

module.exports = router;

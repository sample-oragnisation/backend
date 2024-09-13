const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { predictEnergy } = require('../prediction/prediction')
const {
  login,
  extract,
  getElectricData ,
  getSolarData,
  pastNDaysElectric,
  pastNDaysSolar,
  addEnergyData 
} = require('../controller/energy');

router.post('/login', login);
router.get('/energyData/:date',extract);
router.get('/electricPie/:date', getElectricData);
router.get('/solarPie/:date', getSolarData);
router.get('/graph/electric/:days', pastNDaysElectric);
router.get('/graph/solar/:days', pastNDaysSolar);
router.get('/predictEnergy/:collectionType',predictEnergy);
router.get('/add/:collectionType',auth,addEnergyData);

module.exports = router;

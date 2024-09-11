const Admin = require('../models/admin');
const Solar=require('../models/solar');
const Electric=require('../models/electric');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sss';

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (password !== admin.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      JWT_SECRET
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.extract = async (req, res) => {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
  
    try {
      const energyData = await Electric.find({
        date: {
          $gte: startDate,
          $lt: endDate
        }
      });
  
      if (energyData.length === 0) {
        return res.status(404).json({ message: 'No energy data found for the given date' });
      }
  
      const totalEnergyConsumed = energyData.reduce((sum, entry) => sum + entry.total, 0);
      const averageEnergyConsumed = totalEnergyConsumed / 5;
  
      
      const solarData = await Solar.aggregate([
        { $match: { date: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: null, totalSolar: { $sum: "$total" } } }
      ]);
  
      const totalSolar = solarData.length > 0 ? solarData[0].totalSolar : 0;
  
      res.status(200).json({
        totalEnergyConsumed,
        averageEnergyConsumed,
        totalSolar
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };


  exports.getElectricData = async (req, res) => {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1); 
  
    try {
      const electricData = await Electric.findOne({
        date: {
          $gte: startDate,
          $lt: endDate
        }
      });
  
      console.log('Retrieved Electric Data:', electricData); 
  
      if (!electricData) {
        return res.status(404).json({ message: 'No electric data found for the given date' });
      }
  
      res.status(200).json({
        eastCampus: electricData.eastCampus,
        mbaMca: electricData.mbaMca,
        civil: electricData.civil,
        mech: electricData.mech,
        auto: electricData.auto
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

  exports.getSolarData = async (req, res) => {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1); 
  
    try {
      const solarData = await Solar.findOne({
        date: {
          $gte: startDate,
          $lt: endDate
        }
      });
  
      if (!solarData) {
        return res.status(404).json({ message: 'No solar data found for the given date' });
      }
  
      res.status(200).json({
        eastCampus: solarData.eastCampus,
        mbaMca: solarData.mbaMca,
        civil: solarData.civil,
        mech: solarData.mech,
        auto: solarData.auto
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
 

const Admin = require('../models/admin');
const Solar=require('../models/solar');
const Electric=require('../models/electric');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

//login

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({  message: 'Invalid email or password' });
    }

    if (password !== admin.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET
    );

  
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//all datas by dates

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

//electric pie
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
  
//solarpie
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
 //electricgraph
  module.exports.pastNDaysElectric = async (req, res) => {
    try {
    
      const { days } = req.params;
      const numOfDays = parseInt(days) || 7; 
  
    
      const currentDate = new Date('2024-04-26T00:00:00Z');
      const pastDates = [];
  
      for (let i = numOfDays - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        
        pastDates.push(date.toISOString().slice(0, 10));
      }
  

      const data = await Electric.find({
        date: {
          $in: pastDates 
        }
      }).select('date total').sort({ date: 1 }); 
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


//solargraph
module.exports.pastNDaysSolar = async (req, res) => {
  try {
    const { days } = req.params;
    const numOfDays = parseInt(days) || 7; 


    const currentDate = new Date('2024-04-26T00:00:00Z');
    const pastDates = [];

    for (let i = numOfDays - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      
      pastDates.push(date.toISOString().slice(0, 10)); 
    }

    const data = await Solar.find({
      date: {
        $in: pastDates 
      }
    }).select('date total').sort({ date: 1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//adding 
module.exports.addEnergyData = async (req, res) => {
  try {
    const userId = req.userId; 
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const { collectionType } = req.params; 
    const { date, eastCampus, mbaMca, civil, mech, auto } = req.body;

   
    if (!date || !eastCampus || !mbaMca || !civil || !mech || !auto) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const eastCampusNum = parseInt(eastCampus, 10);
    const mbaMcaNum = parseInt(mbaMca, 10);
    const civilNum = parseInt(civil, 10);
    const mechNum = parseInt(mech, 10);
    const autoNum = parseInt(auto, 10);

    const total = eastCampusNum + mbaMcaNum + civilNum + mechNum + autoNum;

    let newData;

    if (collectionType === 'electric') {
      newData = new Electric({
        date,
        eastCampus: eastCampusNum,
        mbaMca: mbaMcaNum,
        civil: civilNum,
        mech: mechNum,
        auto: autoNum,
        total  
      });
    } else if (collectionType === 'solar') {
      newData = new Solar({
        date,
        eastCampus: eastCampusNum,
        mbaMca: mbaMcaNum,
        civil: civilNum,
        mech: mechNum,
        auto: autoNum,
        total  
      });
    } else {
      return res.status(400).json({ error: 'Invalid collection type. Must be "electric" or "solar".' });
    }

    await newData.save();
    res.status(201).json({ message: `${collectionType} data added successfully!`, data: newData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



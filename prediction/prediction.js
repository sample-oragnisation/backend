const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Electric = require('../models/electric'); 
const Solar = require('../models/solar'); 

// retrieving from mongoDBAtlas and passed to script.py

module.exports.predictEnergy = async (req, res) => {
    try {
        const collectionType = req.params.collectionType; 

        let data;
        if (collectionType === 'electric') {
            data = await Electric.find({}).exec();
        } else if (collectionType === 'solar') {
            data = await Solar.find({}).exec();
        } else {
            return res.status(400).json({ error: 'Invalid collection type. Must be "electric" or "solar".' });
        }

        const formattedData = data.map(doc => ({
            date: doc.date,
            eastCampus: doc.eastCampus,
            mbaMca: doc.mbaMca,
            civil: doc.civil,
            mech: doc.mech,
            auto: doc.auto,
            total: doc.total
        }));

        const response = await axios.post('http://localhost:5000/predict', {
            data: formattedData,
            collectionType: collectionType
        });

        const forecast = response.data;
        res.json(forecast);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

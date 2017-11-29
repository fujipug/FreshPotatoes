var db = require('../config/sequelizeconfig');
const request = require('request'),
      express = require('express'),
      app = express();

var router = express.Router();
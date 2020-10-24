const express = require('express');
const router = express.Router();

router.get('/',function (req,res){
    res.send('server is up and running');
});

module.exports = router;
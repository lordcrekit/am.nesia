var router = express.Router();

router.get('/', function(req, res) {
   req.send('nope'); 
});

module.exports = router;
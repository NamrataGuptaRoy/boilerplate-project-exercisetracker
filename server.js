const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Not found middleware
// app.use((req, res, next) => {
//   return next({status: 404, message: 'not found'})
// })

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

var schema1=new mongoose.Schema({
  name:String,
  userid:String
});
var User=mongoose.model('User',schema1);

var schema2=new mongoose.Schema({
  userid: String,
  name:String,
  count:Number,
  log:[{}]
});
var Details=mongoose.model('Details',schema2);
var c;
User.findOne().sort({userid:-1}).limit(1).exec(function(err,data){
  //console.log(data);
  if(data==null)c=0;
  else c=Number(data.userid);
  console.log(c);
});

app.post('/api/exercise/new-user',function(req,res){
    //console.log(req.body);
  var name=req.body.username;
  User.findOne({name:name},function(err,data){
    if(data==null){
      c++;
    var id=(c).toString();console.log(id);
    var doc=new User({name:name,userid:id});
    doc.save(function(err,data){});
    res.json({"name":name,"_id":id});
    }
    else res.write("Username already taken");
  });
});
app.post('/api/exercise/add',function(req,res){
  //console.log(req.body);
  User.findOne({userid:req.body.userId},function(err,data){
    if(data==null){
      res.write("unknown _id");
    }
    else{
      var n=data.name;
      var desc=req.body.description;
      var dur=req.body.duration;
      var id=req.body.userId;
      var date=new Date(req.body.date);
      date=date.toUTCString().substring(0,16);
      //.substring(0,15);
    //  console.log(req.body.date);
      Details.findOneAndRemove({userid:req.body.userId},function(err,doc){
        if(doc==null){
      var doc=new Details({userid:id,name:n,count:1,log:[{description:desc,duration:dur,date:date}]});
      doc.save(function(err,data){if(err)console.log(err);});
        }
        else{
          console.log(doc);
          doc.log.push({descripion:desc,duration:dur,date:date});
          doc.count=doc.log.length;
         // console.log(data);
          var input=new Details({userid:doc.userid,name:doc.name,count:doc.count,log:doc.log});
          input.save(function(err,data){});
          //console.log(doc);
        }
      res.json({"username":n,"description":desc,"duration":dur,"_id":id,"date":date});
     });
    }
  })
});

app.get('/api/exercise/log',function(req,res){
  console.log(req.query);
  Details.findOne({userid:req.query.userId},function(err,data){
    console.log();
    if(data==null)res.write("unknown userId");
    else{
      console.log(data);
      res.json({"_id":data.userid,"username":data.name,"count":data.count,"log":data.log});
    }
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

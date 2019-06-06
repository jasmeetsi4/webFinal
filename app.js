var express = require('express')
var path = require('path')
var app = express()
const nodemailer = require("nodemailer");
var session = require('express-session');
var hbs=require('hbs');
const multer = require('multer');
const fs=require('fs');
 var passport=require('passport')
app.use(passport.initialize());
app.use(passport.session());
var GitHubStrategy = require('passport-github').Strategy;

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
  }
});


const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
});

//Acces static files
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}
var access=0;
app.use(express.static(path.join(__dirname, 'public')));
//Bodyparser
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({secret: "SecretLogin"}));

const viewsPath = path.join(__dirname, 'template/views');
const partialsPath = path.join(__dirname, 'template/partial');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
//Connect with db
var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost/Project';
mongoose.connect(mongoDB);
mongoose.connection.on('error', (err) => {
    console.log('DB connection Error');
});
mongoose.connection.on('connected', (err) => {
    console.log('DB connected');
});


var communitySchema=new mongoose.Schema({
    Name:String,
    Status:String,
    Owner:String,
    Rule:String,
    Date:String,
    Location:String,
    Description:String,
    Requested:[String],
    Members:[String],
//    Requested:[product],
//    Members:[product],
     final : {
      contentType: String,
      image:  Buffer,
     path : String
     }
})
var community=mongoose.model('comms',communitySchema);
var productSchema = new mongoose.Schema({
    Email :String,
    Name:String,
    DOB :String,
    Gender :String,
    Phone : Number,
    City : String,
    Password : String,
    Role:String,
    Status:String,
    Flag:Number,
    Joined:[String],
    Communities:[String],
//    Communities:[community],
//    Joined:[community],
 final : {
      contentType: String,
      image:  Buffer,
     path : String
   }    //category : [{ 'abd': Number , }]
  })
var product =  mongoose.model('users', productSchema);

const myurl = 'mongodb://localhost/Project';

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(myurl, (err, client) => {
  if (err) return console.log(err)
  db = client.db('users')

})
 app.post('/uploadphoto', upload.single('myImage'),(req, res) => {
     if(!req.file)
         res.render('update1',"Upload A File");
 else{
    var img = fs.readFileSync(req.file.path);
 var encode_image = img.toString('base64');
 // Define a JSONobject for the image attributes for saving to database

  var finalImg = {
      path:req.file.path,
      contentType: req.file.mimetype,
      image:  new Buffer(encode_image, 'base64')
   }
  product.findOneAndUpdate(
      {
      Email:req.session.Email
  },
                           {
                               final:finalImg
                           })
    .then(data => {
      console.log(data);
          res.render('update1')
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })

 }
  })
 app.post('/uploadcommphoto/:name', upload.single('myImage'),(req, res) => {
     if(!req.file)
         res.render('update1',"Upload A File");
 else{
    var img = fs.readFileSync(req.file.path);
 var encode_image = img.toString('base64');
 // Define a JSONobject for the image attributes for saving to database

  var finalImg = {
      path:req.file.path,
      contentType: req.file.mimetype,
      image:  new Buffer(encode_image, 'base64')
   }
  community.findOneAndUpdate(
      {
      Name:req.params.name
  },
                           {
                               final:finalImg
                           })
    .then(data => {
      console.log(data);
          res.render('communities')
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })

 }
  })

app.get('/commpic/:name', (req, res) => {
    console.log(req.session)
community.findOne({
    Name:req.params.name
})
       .then(data => {
       res.contentType('image/jpeg');
          res.send(data.final.path)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
});

app.get('/photos', (req, res) => {
    console.log(req.session)
product.findOne({
    Email:req.session.Email
})
       .then(data => {
       res.contentType('image/jpeg');
          res.send(data.final.path)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
});

app.post('/getphoto', (req, res) => {
    console.log(req.session)
product.findOne({
    Email:req.body.Email
})
       .then(data => {
       res.contentType('image/jpeg');
          res.send(data.final.path)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
});


app.get('/currentSession',function(req,res){
     product.find({
           // search query
           //productName: 'mlbTvrndc'
      })
      .then(data => {
         console.log(req.session)
          res.send(req.session)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
})
app.post('/find',function(req,res){
    product.find({
           Email:req.body.Email
      })
      .then(data => {
          res.send(data)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
})
app.put('/update',function(req,res){
    product.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
        {
      Phone:req.body.Phone,
            Gender:req.body.Gender,
            City:req.body.City,
            Role:req.body.Role,
            Status:req.body.Status// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.get('/communityportal/:comm',function(req,res)
       {
    if(req.session.isLogin)
        {
            res.render('commportal',{
            })
        }
     else
        {
            res.render('index');
        }
})

app.get('/manage/:comm',function(req,res)
       {
    if(req.session.isLogin)
        {
            res.render('manage',{
            })
        }
     else
        {
            res.render('index');
        }
})

app.get('/members/:comm',function(req,res)
       {
    if(req.session.isLogin)
        {
            res.render('members',{
            })
        }
     else
        {
            res.render('index');
        }
})
app.get('/editcomm/:comm',function(req,res)
       {
    if(req.session.isLogin)
        {
            res.render('editcomm',{
            })
        }
     else
        {
            res.render('index');
        }
})

app.get('/discussion/:comm',function(req,res)
       {
    if(req.session.isLogin)
        {
            res.render('discussion',{
            })
        }
     else
        {
            res.render('index');
        }
})


app.put('/updatecommunity',function(req,res){
   community.findOneAndUpdate(
    {
        Name: req.body.Name // search query
    },
        {
      Status:req.body.Status,
            Name:req.body.newName// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})
app.put('/password',function(req,res){
    product.findOneAndUpdate(
    {
        Email: req.body.Email,
        Password:req.body.Password// search query
    },
        {
      Password:req.body.newPassword// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.put('/updateUser',function(req,res){
    product.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
        {
            Flag:'0'// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })

})
app.post('/getcomms',function(req,res){
    product.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
         {$push: {Joined:req.body.Name,
                  Communities:req.body.Name
                 }},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.send("UPDATED");
        }
    }

);
})
app.post('/pullmember',function(req,res){
    community.findOneAndUpdate(
    {
        Name: req.body.Name  // search query
    },
         {$pull: {
                  Members:req.body.Member
                 }},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.send("UPDATED");
        }
    }

);
})

app.post('/pullcomm',function(req,res){
    product.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
         {$pull: {
                  Joined:req.body.Name
                 }},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.send("UPDATED");
        }
    }

);
})

app.post('/getcomms1',function(req,res){
    product.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
         {$push: {Joined:req.body.Name
                 }},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.send("UPDATED");
        }
    }

);
})

app.post('/updateowner',function(req,res){
    community.findOneAndUpdate(
    {
        Name: req.body.Name// search query
    },
         {$push: {Members:req.body.Member
                 }},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.send("UPDATED1");
        }
    }

);
})
app.post('/removefromrequested',function(req,res){
    community.findOneAndUpdate(
    {
        Name: req.body.Name// search query
    },
         {$pull: {
             Requested:req.body.Member
                 }},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.send("UPDATED1");
        }
    }

);
})

app.post('/sendrequest',function(req,res){
    community.findOneAndUpdate(
    {
        Name: req.body.Name// search query
    },
         {$push: {Requested:req.body.Email
                 }},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.send("UPDATED1");
        }
    }

);
})
app.post('/getcomms',function(req,res){
    product.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
         {$push: {Joined:req.body.Name,
                  Communities:req.body.Name
                 }},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.send("UPDATED");
        }
    }

);
})

app.put('/updateUser1',function(req,res){
    product.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
        {
            Flag:'1',// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})
  app.get('/checkUser',function(req,res){
      product.find({
           // search query
           //productName: 'mlbTvrndc'
      })
      .then(data => {
          console.log(data)
          res.send(data)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })
app.post('/check',function(req,res){
    console.log(req);
    console.log(req.method);
      product.find({
          Email:req.body.email,
          Password:req.body.password,
      })

      .then(data => {
          if(data[0].Flag)
              {
                  res.send("Invalid");
              }
          if(data.length!=0)
              {
                  console.log(data)
                   req.session.isLogin = 1;
                    req.session.Email = data[0].Email ;
                    req.session.Name = data[0].Name;
                    req.session.DOB=data[0].DOB;
                    req.session.Gender=data[0].Gender;
                  req.session.City=data[0].City;
                  req.session.Phone=data[0].Phone;
                  req.session.Role=data[0].Role;
                  req.session.Status=data[0].Status;
                  req.session.Password=data[0].Password;
                  console.log(req.session);
                              access=1;
                  res.send("successfully signed in")
              }
          else{
          console.log(data)
          res.send("INVALID Email/Password")
          }
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })
app.get('/allusers',function(req,res)
       {
    product.find({

    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})

app.get('/getallcommunity',function(req,res)
       {
   community.find({

    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})

app.get('/getcommun/:comm',function(req,res)
       {
   community.find({
        Name:req.params.comm
    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})

app.post('/allcomms',function(req,res)
       {
    product.find({
        Email:req.body.Email
    })
    .then(data => {
        console.log(data);
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})

app.post('/requiredcomm',function(req,res)
       {
    community.find({
        Name:req.body.Name
    })
    .then(data => {
        console.log(data);
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})

app.get('/allcommunity',function(req,res)
       {
    community.find({

    })
    .then(data => {
        console.log(data)
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})
app.get('/list',function(req,res)
       {
    if(req.session.isLogin)
        {
            res.render('listusers',{
            })
        }
     else
        {
            res.render('index');
        }
})

app.get('/searchcomm',function(req,res)
       {
    if(req.session.isLogin)
        {
            res.render('searchcommunity',{
            })
        }
     else
        {
            res.render('index');
        }
})

app.get('/admin',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
    if(req.session.Role=='User' ||  req.session.Touser)
                 res.render('edit1',{
    })
            else
    res.render('edit',{
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/commlist',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
    res.render('communitylist',{
    })
        }
    else
        {
            res.render('index');
        }
})

app.get('/community',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
    res.render('communities',{
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/admin1',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
            if(req.session.Role!='Superadmin' ||  req.session.Touser)
                 res.render('portal1',{
    })
            else
    res.render('portal',{
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/change',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
            if(req.session.Role=='User' ||  req.session.Touser)
                  res.render('changepswd1',{
    })
            else
    res.render('changepswd',{
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/switchToUser',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
            req.session.Touser=1;
                  res.render('portal1');
        }
    else
        {
            res.render('index');
        }
})
app.get('/switchToAdmin',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
            req.session.Touser=0;
                  res.render('portal');
        }
    else
        {
            res.render('index');
        }
})
app.get('/userportal',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
    res.render('portal1',{
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/edituser',(req,res)=>{
    console.log(access);
    if(req.session.isLogin)
        {
            if(req.session.Status=='Confirmed'  &&  req.session.Role!='User')
    res.render('update1',{
    })
            else if(req.session.Role=='User')
        res.render('update2',{

        })
            else
             res.render('update',{
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/addusers',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('adduser',{
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/addCommunity',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('addcommunity',{
    })
        }
    else
        {
            res.render('index');
        }
})

app.get('/login',(req,res)=>{
    access=0;
    console.log(access);
    if(access==0)
        {
            access=0;
            req.session.Touser=0;
        req.session.isLogin=0
    res.render('index',{
    })
        }
    else
        {
            res.render('broken');
        }
})

app.post('/add',function(req,res){
console.log(req.body)
    let   newuser=new product({
                      Name:req.body.name,
                      Email:req.body.email,
               Password:req.body.pass,
               City:req.body.city,
               DOB:req.body.dob,
               Gender:req.body.gender,
               Phone:req.body.phone,
            Role:req.body.role,
            Status:req.body.status,
        Flag:'0'
                  })
           product.find({Email:req.body.email})

      .then(data => {
          if(data.length==0)
              {
               newuser.save()
                  res.send("ADDED");
              }
          else{
          console.log(data)
          res.send("Already added")
          }
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })
app.post('/addnewcomm',function(req,res){
console.log(req.body)
    let   newuser=new community({
                      Name:req.body.Name,
        Owner:req.body.Owner,
        Description:req.body.Desc,
        Date:req.body.Date,
        Rule:req.body.Rule,
        Status:"Deactive",
        Location:"Not Added"
    })
           community.find({Name:req.body.Name})

      .then(data => {
          if(data.length==0)
              {
               newuser.save()
                  res.send("ADDED");
              }
          else{
          console.log(data)
          res.send("Already added")
          }
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })

app.post('/pagecount',(req,res)=>{
    console.log(req.body)
        var search=req.search

    product.find({

    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})
app.post('/pagecount1',(req,res)=>{
    console.log(req.body)
    product.find({

        Status:req.body.status
    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})
app.post('/pagecount2',(req,res)=>{
    console.log(req.body)
        var search=req.search

    product.find({

        Status:req.body.status,
        Role:req.body.role
    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})
app.post('/pagecount3',(req,res)=>{
    console.log(req.body)
        var search=req.search

    product.find({

        Role:req.body.role
    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})
app.post('/mail',function(req,res){
    var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
//      clientId:'354116386100-bgfhvd9n4fss1fck3vdo0gs7ot9aifus.apps.googleusercontent.com',
       type: "login",
        user: 'sjasmeet20404@gmail.com',
      pass:'Code@123'
//        clientSecret: 'XXWFS_-G8GIZd_CJMBIcrdci',
//        refreshToken: '1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx',
//        accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x'
  }
});
    var mailOptions = {
  from: 'sjasmeet20404@gmail.com',
  to: req.body.sendTo,
  subject: req.body.subject,
  text: req.body.matter
};
    transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
      res.send("Error")
  } else {
    console.log('Email sent: ' + info.response);
      res.send("Mailed")
  }
});
})
app.post('/users',(req,res)=>{
    console.log(req.body)
    var pageNo=parseInt(req.body.pageNo)
    var size=parseInt(req.body.size)
    var search=req.search
    var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" : true,"message" : "invalid page number, should start with 1"};
        return res.json(response)
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
    console.log(query)
    var mysort={Email:1}
    product.find({

    }).sort(mysort).skip(size * (pageNo - 1)).limit(size).exec(function(err,data){
        if(err){
            res.send("Error");
        }
        else
            {
                res.send(data);
            }
    });
})
app.post('/users1',(req,res)=>{
    console.log(req.body)
    var pageNo=parseInt(req.body.pageNo)
    var size=parseInt(req.body.size)
    var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" : true,"message" : "invalid page number, should start with 1"};
        return res.json(response)
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
    console.log(query)
    product.find({
        Status:req.body.status
    }).skip(size * (pageNo - 1)).limit(size).exec(function(err,data){
        if(err){
            res.send("Error");
        }
        else
            {
                res.send(data);
            }
    });
})
app.post('/users2',(req,res)=>{
    console.log(req.body)
    var pageNo=parseInt(req.body.pageNo)
    var size=parseInt(req.body.size)
    var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" : true,"message" : "invalid page number, should start with 1"};
        return res.json(response)
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
    console.log(query)
    product.find({
        Status:req.body.status,
        Role:req.body.role
    }).skip(size * (pageNo - 1)).limit(size).exec(function(err,data){
        if(err){
            res.send("Error");
        }
        else
            {
                res.send(data);
            }
    });
})
app.post('/users3',(req,res)=>{
    console.log(req.body)
    var pageNo=parseInt(req.body.pageNo)
    var size=parseInt(req.body.size)
    var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" : true,"message" : "invalid page number, should start with 1"};
        return res.json(response)
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
    console.log(query)
    product.find({
        Role:req.body.role
    }).skip(size * (pageNo - 1)).limit(size).exec(function(err,data){
        if(err){
            res.send("Error");
        }
        else
            {
                res.send(data);
            }
    });
})
passport.serializeUser(function(user, done) {
  done(null, user);
});


passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new GitHubStrategy({
    clientID: 'b83bad3767b6e2a41691',
    clientSecret: '635f52fc3deea200879dfa0dbe5687a954d1b707',
    callbackURL: "http://localhost:3000/auth/github/callback",
	session : true
  },

  function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    })
  );
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    console.log("githubsignin succesful");
console.log(req.session.passport);
    //console.log(temp);
    product.find({
      Email: req.session.passport.user._json.email
    })
    .then(data => {
  req.session.isLogin = 1;
                    req.session.Email = data[0].Email ;
                    req.session.Name = data[0].Name;
                    req.session.DOB=data[0].DOB;
                    req.session.Gender=data[0].Gender;
                  req.session.City=data[0].City;
                  req.session.Phone=data[0].Phone;
                  req.session.Role=data[0].Role;
                  req.session.Status=data[0].Status;
                  req.session.Password=data[0].Password;
                  console.log(req.session);
                              access=1;
            res.redirect('/admin');      //console.log("added");
    })
    .catch(err => {
      console.error(err);
        res.redirect('/login')
      //res.send(error)
    });

    //res.send('Github login successful');
  });
 //बेटी
  app.post('/updatecomm',function(req,res){
      community.findOneAndUpdate(
      {
          Name:req.body.oldname // search query
      },
          {
        Description:req.body.desc,
              Rule:req.body.rule,// field:values to update
      },
      {
        new: true,                       // return updated doc
        runValidators: true              // validate before update
      })
      .then(data => {
          console.log(data)
          res.send("UPDATED")
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })
console.log("Running on port 3000");
app.listen(3000)

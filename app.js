var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

// lib to compile code at runtime
var spawn = require('child_process').spawn;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){
  var response = 'failure';

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    var filepath = path.join(form.uploadDir, file.name);
    fs.rename(file.path, filepath);
    resposne = compileCFile(filepath);
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end(response);
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

var server = app.listen(3050, function(){
  console.log('Server listening on port 3050');
});


function compileCFile(file){
  var response = 'failure';
  var compile = spawn('gcc', [file]);

  compile.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  compile.stderr.on('data', function (data) {
      console.log(String(data));
  });

  compile.on('close', function (data) {
    if (data === 0) {
      var run = spawn('./a.out', []);
      run.stdout.on('data', function (output) {
        var outputStr = String(output);
        console.log(outputStr);
        response = outputStr;
      });
      run.stderr.on('data', function (output) {
        var outputStr = String(output);
        console.log(outputStr);
        response = outputStr;
      });
      //run.on('close', function (output) {
      //  console.log('stdout: ' + output);
      //})
    }
  });
  return response;
} 

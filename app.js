const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var items = ["have a cup of coffee","reading paper"];
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {
  // res.send("hello");
  var today = new Date();

  var option = {
    weekday:"long",
    day:"numeric",
    month:"long"
  };

  var day = today.toLocaleDateString("en-US",option);

  res.render("list", {
    kindOfDay: day,
    newItem: items
  });
});

app.post("/",function(req,res){
  // console.log(req.body.todo);
  // res.send(req.body.todo);
  items.push(req.body.todo);
  console.log(items);
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server is running on Port 3000.");
});
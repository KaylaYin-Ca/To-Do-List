const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const date = require(__dirname+"/date.js");
// console.log(date());
// scope
// global letiables
let items = ["have a cup of coffee", "reading paper"];
let workItems = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  // res.send("hello");
  let day = date.getDate();
  res.render("list", {
    listTitle: day,
    newItem: items
  });
});

app.post("/", function(req, res) {
  // console.log(req.body.todo);
  // res.send(req.body.todo);
  let item = req.body.todo;
  let page = req.body.list;
  console.log(req.body);
  if (page === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
  // console.log(items);

});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newItem: workItems
  });
});

app.get("/about",function(req,res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server is running on Port 3000.");
});

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
// console.log(date());
// scope
// global letiables
// let items = ["have a cup of coffee", "reading paper"];
// let workItems = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// =============== MongoDB ==============
const dbURL = "mongodb://localhost:27017/todolistDB";
mongoose.connect(dbURL, {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Get Up"
});
const item2 = new Item({
  name: "Brush your teeth"
});
const item3 = new Item({
  name: "Eat breakfirst"
});

const defaultItems = [item1, item2, item3];



// ================ request and response ==========
app.get("/", function(req, res) {
  let day = date.getDate();
  //get default items from MongoDB
  Item.find(function(err, items) {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        // insert default items
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("successfully saved defautl items to DB!");
          }
        });
        res.render("/");
      } else {
        res.render("list", {
          listTitle: day,
          newItem: items
        });
      }
    }
  });

});

app.post("/", function(req, res) {
  // console.log(req.body.todo);
  // res.send(req.body.todo);
  const itemName = req.body.todo;

  const item = new Item({
    name:itemName
  });

  item.save(function(err){
    if (err) {
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
});

app.post("/delete",function(req,res){

  const itemID = req.body.checkbox;
  Item.deleteOne({_id:itemID},function(err){
    if (err) {
      console.log(err);
    }else{
      res.redirect("/");
      console.log("successfully deleted the to-do list item");
    }
  });


});



app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newItem: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server is running on Port 3000.");
});

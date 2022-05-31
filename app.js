//jshit esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // use mongodb
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// =============== MongoDB ==============
const dbURL = "mongodb://localhost:27017/todolistDB";
mongoose.connect(dbURL, {useNewUrlParser: true});

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

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = new mongoose.model("List", listSchema);

// ================ request and response ==========
// root (get method)
app.get("/", function(req, res) {
  //get default items from MongoDB
  Item.find({}, function(err, foundItems){

      if (foundItems.length === 0) {
        // insert default items
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("successfully saved defautl items to DB!");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today",newListItems: foundItems});
      }
    });
});

// customer to do list page
app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // if no error and found nothing (create a new list)
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show exist to do item
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

// add new to-do item
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// delete to-do item
app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  // console.log(listName, itemID);

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
});


app.get("/about", function(req, res) {
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server is running on Port 3000.");
});

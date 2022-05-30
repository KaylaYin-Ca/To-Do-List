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

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = new mongoose.model("List", listSchema);



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
  let day = date.getDay();

  const itemName = req.body.todo;
  const listName = (req.body.list).slice(0,-1);
  const item = new Item({
    name: itemName
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });

  }
});

app.post("/delete", function(req, res) {

  const itemID = req.body.checkbox;
  Item.deleteOne({
    _id: itemID
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
      console.log("successfully deleted the to-do list item");
    }
  });
});

app.get("/:listName", function(req, res) {
  let day = date.getDate();
  const customListName = req.params.listName;
  console.log(customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (err) {
      console.log(err);
    } else {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
        console.log("Doesn't exist!");
      } else {
        console.log("Exist!");
        res.render("list", {
          listTitle: foundList.name,
          newItem: foundList.items
        });
      }
    }
  });
});


// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newItem: workItems
//   });
// });

app.get("/about", function(req, res) {
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server is running on Port 3000.");
});

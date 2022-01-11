//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const mongoURI = "mongodb+srv://nikhilstacks:<password>@cluster0.rzizx.mongodb.net/todolistDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
useNewUrlParser: true,
useUnifiedTopology: true,
});
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list"
});

const item2 = new Item({
  name: "Click + button to add more todo"
});

const item3 = new Item({
  name: "<--- click here to delete your todo"
});

const defaultItems = [item1, item2, item3];

const listsSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listsSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted default items");
        }
      });
      res.redirect('/');
    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });

    }

  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {

    item.save();
    res.redirect('/');
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();

      res.redirect('/' + listName);
    });
  }

});

app.post('/delete', function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findOneAndDelete({
      _id: checkedItemId
    }, function(err) {
      if (!err) {
        console.log("successfully deleted");
        res.redirect('/');
      }
    });
  } else {

    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, result) {
      if (!err) {
        res.redirect('/' + listName);
      }
    });

  }

});

app.get('/:customListName', function(req, res) {

  let customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundItems) {
    if (!err) {
      if (!foundItems) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect('/' + customListName);

      } else {
        res.render('list', {
          listTitle: foundItems.name,
          newListItems: foundItems.items
        });
      }
    } else {
      console.log(err);
    }
  });

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});

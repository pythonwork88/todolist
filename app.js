//jshint esversion:6

const express = require("express")
const bodyParser = require("body-parser")

const mongo = require("mongoose")
const _ = require("lodash")
const app = express()

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

----------------------------------- mongo account needed !!! replace username and password to work -------------------
mongo.connect("mongodb+srv://<username>:<password>@cluster0.ron8duo.mongodb.net/?retryWrites=true&w=majority");

const itemsSchema = {
  name: String
};

const Item = mongo.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
})

const item2 = new Item({
  name: "Hit the + button to aff a new item"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongo.model("List", listSchema);



app.get('/', function(req, res){

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if (!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })


});

app.post('/', function(req, res){

 const itemName = req.body.newItem;
 const listName = req.body.list;
 const item = new Item({
   name: itemName
 });

 if (listName === "Today"){
   if(itemName.length > 1){
     item.save();
     res.redirect("/");
   }else{
     res.redirect("/");
   }


 } else {
   List.findOne({name: listName}, function(err, foundList){
     if(itemName.length > 0){
       foundList.items.push(item);
       foundList.save();
       res.redirect("/" + listName)
     } else {
       res.redirect("/" + listName)
     }


   })
 }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today'){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/")
      }
    });
      } else {
        List.findOneAndUpdate( {name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
          if (!err){
            res.redirect("/" + listName);

          }
          });
      }

});






 app.post("/work", function(req, res){
   let item = req.body.newItem;
   workItems.push(item);
   res.redirect("/work");
 })

 app.get('/about', function(req, res){
   res.render('about');
 })



 let port = process.env.PORT;
 if (port == null || port == "") {
   port = 3000;
 }
 app.listen(port);

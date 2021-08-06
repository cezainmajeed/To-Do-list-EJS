const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});
const itemsSchema=new mongoose.Schema({
  name:{
    type:String
  }
});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todo list."
});

const item2=new Item({
  name:"Hit the + button to add new task."
});

const item3=new Item({
  name:"<-- Hit this to delete an task."
});

const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List=mongoose.model("List",listSchema);

// Item.insertMany(defaultItems,function(err){
//   if(err)
//   console.log(err);
//   else
//   console.log("Successfully added default items.");
// });


const today = new Date();

const options = {
  weekday: "long",
  day: "numeric",
  month: "long"
};

const day = today.toLocaleDateString("en-US", options);


app.get("/", function(req, res) {


  Item.find({},function(err,items){

    if(items.length===0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
        console.log(err);
        else
        console.log("Successfully added default items.");
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {
        listTitle:day,
        addTask: items
      });
    }

  });

});


app.post("/", function(req, res) {
  const itemName = req.body.newTask;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName===day)
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});

app.post("/delete",function(req,res){
  const itemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName===day)
  {
    Item.deleteOne({_id:itemId},function(err){
      if(err)
      console.log(err);
      else
      console.log("Deleted Successfully!");
    });
    res.redirect("/");
  }
  else
  {
    //console.log(listName);
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:customName",function(req,res){
  const customName=_.capitalize(req.params.customName);

  List.findOne({name:customName},function(err,foundList){
    if(!err)
    {
      if(foundList)
      {
        //show list
        res.render("list", {
          listTitle: foundList.name,
          addTask: foundList.items
        });
      }
      else
      {
        //make new list
        const list=new List({
          name:customName,
          items:defaultItems
        });

        list.save();
        res.redirect("/"+customName);
      }
    }
  });
});



app.listen(process.env.PORT || 3000, function() {
  console.log("server started on port 3000");
});

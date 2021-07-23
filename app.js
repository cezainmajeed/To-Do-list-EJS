const express = require("express");
const bodyParser = require("body-parser");

const app = express();

let items =["Organise your task","Add new task","Keep track of your task"];
let workItems=[];
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  let today = new Date();

  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  let day = today.toLocaleDateString("en-US", options);

  res.render("list", {
    listTitle: day,
    addTask: items
  });

});


app.post("/", function(req, res) {
  let item = req.body.newTask;

  if(req.body.list==="Work")
  {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }

});

app.get("/work",function(req,res){
  res.render("list",{
    listTitle: "Work List",
    addTask: workItems
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("server started on port 3000");
});

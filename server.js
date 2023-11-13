const express = require('express');

const app = express();
const path = require("path");
let views = path.join(__dirname,'/views/')

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));

let complited = {
    "consecution":{
        "lvls":{
            "1":false,
            "2":false,
            "3":false,
            "4":false,
            "5":false,
        },
        "name":"Cледование",
        "complited":false,
        "id":"1"
    },
    "condition":{
        "lvls":{
            "1":false,
            "2":false,
            "3":false,
            "4":false,
            "5":false,
        },
        "name":"Условия",
        "complited":false,
        "id":"2"
    },
    "looping":{
        "lvls":{
            "1":false,
            "2":false,
            "3":false,
            "4":false,
            "5":false,
        },
        "name":"Циклы",
        "complited":false,
        "id":"3"
    }
}

/// user
app.get("/" , (req,res) =>{
    res.render(views+'main',{complited:JSON.stringify(complited)});
})
app.get("/consecution/:id" , (req,res) =>{
    res.render(views+'consecution/lvl-'+req.params["id"],{theme:"consecution",lvl:req.params["id"],complited:JSON.stringify(complited),theme_name:"Cледование"});
})
app.get("/looping/:id" , (req,res) =>{
    res.render(views+'looping/lvl-'+req.params["id"],{theme:"looping",lvl:req.params["id"],complited:JSON.stringify(complited),theme_name:"Циклы"});
})
app.get("/condition/:id" , (req,res) =>{
    res.render(views+'condition/lvl-'+req.params["id"],{theme:"condition",lvl:req.params["id"],complited:JSON.stringify(complited),theme_name:"Условия"});
})
// app.get("/lib/:file" , (req,res) =>{
//     res.send()
// })

app.post('/finish/:theme/:lvl', (req, res) => {
    let inp = req.params;
    console.log(inp);
    complited[inp["theme"]]["lvls"][inp["lvl"]] = true;
    if (!Object.values(complited[inp["theme"]]["lvls"]).includes(false)) {
        complited[inp["theme"]]["complited"] = true;
    }
    console.log(JSON.stringify(complited));
    res.send({body:"good"});
});
app.post('/check/:theme/:lvl', (req, res) => {
    let inp = req.params;
    res.send({body:complited[inp["theme"]]["lvls"][inp["lvl"]]});
});

app.all('*', (req, res) => {
    res.status(404)
    res.render(views+"static/404");
});
app.listen(process.env.PORT || 3621, () => console.log("server for puzzle started UwU"));
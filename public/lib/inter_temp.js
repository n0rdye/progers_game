window.dragMoveListener = dragMoveListener;
let root = document.getElementById("drags");
let objs = { height:"2",width:"4",color:"#FFFFFF",total:0};
let objs_store = {};
let proj_from = "cloud";
let cur_obj;
let objs_back = [];
let objs_forw = [];
let proj_state = "loading";
let cm_mod = 2;

function create(clas,x,y,color = null,id,size,layer = 0){
    let main_clas = clas.split(" ")[0];
    // if (body == null || body == "") body = "[]";
    let obj = document.createElement("img");
    obj.id = id;
    obj.alt = id;
    clas= clas.split(" ");
    clas.forEach(cl => {
        obj.classList.add(cl);
    });
    get_obj(main_clas,(db_data)=>{
        // console.log(db_data);
        // console.log(db_data);
        // db_data.forEach(db_data => {
        // });
        if (db_data == null) {
            delete objs[main_clas];
            reload();
            // if(proj_from == "cloud"){
            //     // save(()=>{
            //     //     // goto("/proj/load/"+proj_name);
            //     // },false);
            // }
            // else if (proj_from == "local"){
            //     save_local();
            //     load_proj_local();
            // }
        }
        else if (db_data != null){
            make(objs_store[main_clas]["img"])
        }
        function make(img){
            // console.log(db_data);
            obj.src = img;
            obj.title = `${db_data["name"].replaceAll("$"," ").split("~g")[0]}\nцена:${db_data["cost"]}\nширина:${db_data["width"]}см высота:${db_data["height"]}см`;
            obj.setAttribute("cost",db_data["cost"])
            obj.setAttribute("colors",Boolean(db_data["colors"]))
            obj.setAttribute("data-img",img)
            obj.setAttribute("gid",db_data["gid"])
            obj.setAttribute("pid",db_data["pid"])
            obj.setAttribute("color",color)
            // drag.transform = `translate(${drag.getAttribute("data-y")}px, ${drag.getAttribute("data-y")}px) scale(${db_data["width"] * cm_mod} ${db_data["height"] * cm_mod})`;
            if(size){
                obj.style.width = `${db_data["width"] * cm_mod}px`;
                obj.style.height = `${db_data["height"] * cm_mod}px`;
            }
            if (color != null){
                obj_color_change(color,obj)
            }
        }
        calc_total();
    })
    obj.setAttribute("decoding","async");
    obj.setAttribute("loading","lazy");
    if(id != "none"){obj.setAttribute("onclick",`obj_click("${id}")`);}
    // console.log(main_clas);
    if(main_clas.split("~p~").at(-1) == "Бизиборды"){
        obj.setAttribute("layer",9999);
        obj.style.zIndex = 9999;
    }
    else{
        obj.setAttribute("layer",layer);
        obj.style.zIndex = layer;
    }
    root.append(obj);
    set_pos(obj,x,y);
}

function obj_click(id){
    if (cur_obj != id){
        let obj = document.getElementById(id);

        let cur_layer = obj.style.zIndex;

        cur_obj = id;
        if(cur_layer=="9999"){
            document.getElementsByClassName("layer_changer")[0].style.pointerEvents = "none"; 
            document.getElementById("layer_inp").value = "-";        
        }
        else{
            document.getElementsByClassName("layer_changer")[0].style.pointerEvents = "all"; 
            document.getElementById("layer_inp").value = cur_layer;
        }

        if (obj.getAttribute("colors") == "true"){
            clear_palette();
            obj_colors_load(()=>{
                document.getElementById("obj_color_div").style.display = "flex";
                if( document.getElementById(`color_${obj.getAttribute("color")}`) != null){
                    document.getElementById(`color_${obj.getAttribute("color")}`).style.border = "1px blue solid"
                }
            });
        }
        else{
            document.getElementById("obj_color_div").style.display = "none";
        }
        obj_selection();
        // console.log(obj.);
    }
    function obj_selection(){
        let drags = document.getElementsByClassName("drag");
        Object.values(drags).forEach(element => {
            // console.log(element.id,cur_obj);
            if (element.id != cur_obj){
                element.style.border = "0px";
            }
            else{
                element.style.border = "2px black solid"; 
                element.style.borderRadius = "0.2vw"; 
            }
        });
    }
}

function resize_drags(){
    document.getElementById('drags').setAttribute("data-x",document.getElementsByClassName("wall")[0].getBoundingClientRect().left.toString()+"px");
    document.getElementById('drags').style.left = document.getElementsByClassName("wall")[0].getBoundingClientRect().left.toString()+"px";
    document.getElementById('drags').style.width = document.getElementsByClassName("wall")[0].style.width;
    document.getElementsByClassName("zones")[0].style.height = document.getElementsByClassName("wall")[0].style.height;
    drag_start();
}

function wall_size_change(type,value = null){
   if (proj_state == "loaded"){objs_back.push(JSON.parse(JSON.stringify(objs)));}

    let wall = document.getElementsByClassName("wall")[0];
    let drags = document.getElementById("drags");
    let scroll;
    if(type != null && type == "width") {
        if (value == null) scroll = parseFloat(document.getElementById("wall_width").value);
        else if (value != null) scroll = value;
        // document.getElementById("wall_width_value").innerHTML = (Math.ceil((parseFloat(scroll)+0.1)*10)/ 10);
        // document.getElementById("wall_width_value").innerHTML = `${scroll}м`;

        // console.log(scroll);
        wall.style.width = `${(scroll * 100) * cm_mod}px`;
        wall.style.left = drags.getBoundingClientRect().left;
        objs["width"] = scroll;
    }
    if(type != null && type == "height") {
        if (value == null) scroll = parseFloat(document.getElementById("wall_height").value);
        else if (value != null) scroll = value;
        // document.getElementById("wall_height_value").innerHTML = (Math.ceil((parseFloat(scroll)+0.1)*10)/ 10);
        // document.getElementById("wall_height_value").innerHTML = `${scroll}м`;

        // console.log(scroll);
        wall.style.height = `${(scroll * 100) * cm_mod}px`;
        objs["height"] = scroll;
    }            
}

function calc_total(start = false){
    document.getElementById("cost_list").innerHTML = ""
    if (start) {
        document.getElementById("proj_cost_text").innerText = `Стоимость: ${objs["total"]} руб.`;
        return;
    }
    let total=0;
    Object.entries(objs).forEach(([key,value]) => {
        // console.log(key);
        if(key != "height"&&key!="width"&key!="total"){
            // console.log(Object.keys(value).length);
            // console.log(objs_store[key]);
            if(objs_store[key] != null && objs_store[key]["cost"] > 0 && JSON.parse(document.getElementById(`group_drop-${objs_store[key]["pid"]}`).getAttribute("no-cost")) == false){
                // console.log(key,value); 
                total += parseInt(parseInt(objs_store[key]["cost"]) * Object.keys(value).length);
                let obj_cost_div = document.createElement("li");
                obj_cost_div.innerHTML =
                `<div style="display:flex;"> ` +
                    `<div id='obj_cost_name' style='font-size:calc(var(--main-font-size)/1);'>${key.split("~g~")[0].replaceAll("$"," ")}`+
                    `<div id='obj_cost_count'>&nbsp${Object.keys(value).length}X</div> </div>`+
                `</div>`+
                `<div id='obj_cost'>${parseInt(parseInt(objs_store[key]["cost"]) * Object.keys(value).length)}</div>`;
                document.getElementById("cost_list").append(obj_cost_div);
            }
        }
        // console.log(Object.keys(objs).at(-1));
    });
    // return total;

    objs["total"] = total;
    document.getElementById("proj_cost_text").innerText = `стоимость: ${total} руб.`;
}

function load(objss){
    proj_state = "loading";
    // objs = JSON.parse($.cookie("objs"));
    // console.log(objs);
    objs = objss;
    Object.entries(objs).forEach(([keys, values]) => {
        // console.log(keys,values);
        if (keys != "width" && keys != "height" && keys != "color" && keys != "grided"){
            Object.entries(values).forEach(([key, value]) => {
                if(key != "class"){
                    // console.log(key,keys);
                    // console.log(keys,value["x"],value["y"],value["body"]);
                    // let count = Object.keys(objs[keys]).length;
                    // console.log(count);
                    create(keys+" drag",value["x"],value["y"],value["color"],key,true,value["layer"]);
                }
            })
        }
        else {
            document.getElementById(`wall_${keys}`).value = values;
            wall_size_change(keys,values);
            // document.getElementById("drags").style.left = $(".dropzone")[0].getBoundingClientRect().x;
        }

        if (keys == "color"){
            document.getElementById("wall").style.backgroundColor = values;
        }
        if (keys == Object.keys(objs).at(-1)){
            proj_state = "loaded";
            loaded();
        }
    });
    resize_drags();
}
function reload(save = false){
    // objs = JSON.parse($.cookie("objs"));
    // console.log(objs);
    document.getElementById("drags").innerHTML = "";
    load(objs);
    if(save){save(()=>{},false)}
}

function load_proj_cloud(){
    proj_from = "cloud";
    document.getElementById("drags").innerHTML = "";
    // document.getElementById("top_panel_center").innerText = `загрузка ${proj_name} из облака`;
    $.post( "/template/get",{name:proj_name})
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log("good");
            // console.log(JSON.parse(`'${res["body"]}'`));
            // console.log(JSON.parse(res["body"]));
            // $.cookie("objs",res["body"]);
            load(JSON.parse(res["body"]));
            // document.getElementById("top_panel_center").innerText = `${proj_name} (облако)`;
        }
        else if(res["out"] == "bad proj"){
            // console.log("bad");
            save(()=>{
                goto("/template/load"+proj_name);
            },false);
        }
    })
}

function save(callback,with_pic = true){
    // console.log(objs);
    proj_from = "cloud";
    if(with_pic){
        proj_img((src)=>{
            make_save(src);
        })
    }
    else{
        make_save();
    }
    function make_save(src = "img/img_placeholder.webp"){
        $.post( "/template/save", {proj:JSON.stringify(objs),name:proj_name,img:src})
        .done(function( res ) {
        if(res["out"] == "good"){
                // console.log(scr)
                // console.log("good");
                if(callback) callback(res);
            }
        })
    }
}

function load_objs(callback,group){
    // let select = document.getElementById("group_select");
    // console.log(group);
    $.post( "/get_objs",{gid:group})
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log(res["body"]);
            res["body"].forEach(element => {
                objs_store[`${element["name"]}`] = {img:element["img"],height:element["height"],width:element["width"],id:element["id"],name:element["name"],cost:element["cost"],colors:element["colors"],gid:element["gid"],pid:element["pid"]}
            });
            callback(res["body"]);
        }
    });
}

function get_obj(clas,callback){
    if(objs_store[clas] != null){
        callback(objs_store[clas]);
    }
    else{
        load_objs(()=>{
            callback(objs_store[clas]);
        })
    }
}

function load_obj(name,key,callback){
    $.post( "/get_obj",{name:name,key:key})
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log(res["body"]);
            callback(res["body"]);
        }
    });
}

function dragMoveListener (event) {
    var drag = event.target
    if(drag.id != "none"){obj_click(drag.id)}
    var x = (parseFloat(drag.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(drag.getAttribute('data-y')) || 0) + event.dy
    set_pos(drag,x,y);
}
    let dragzone = document.getElementsByClassName('wall')[0];
interact('.drag').draggable({
    inertia: true,
    modifiers: [
    interact.modifiers.restrictRect({restriction: dragzone,endOnly: true,elementRect:{ left: 0.15, right: 0.85, top: 0, bottom: 1 }}),
    interact.modifiers.snap({targets: [interact.snappers.grid({ x: cm_mod, y: cm_mod })],range: Infinity,relativePoints: [ { x: 0, y: 0 } ]}),
    ],
    autoScroll: true,
    listeners: {move: dragMoveListener, end (event) {}}
})

// interact('.trash').dropzone({
//     accept: '.drag',
//     overlap: 0.2,

//     ondragenter: function (event) {var drag = event.relatedTarget;var zone = event.target; 

//         // console.log(drag.classList);
//         if(objs[drag.classList[0]] != null&&objs[drag.classList[0]][drag.id] != null) {
//             delete objs[drag.classList[0]][drag.id];
//         }
//         calc_total()

//         zone.classList.add('drop-target');drag.classList.add('can-drop');
//         drag.remove();
//     },
//     ondragleave: function (event) {var drag = event.relatedTarget;var zone = event.target;zone.classList.remove('drop-target');drag.classList.remove('in_zone');drag.classList.remove('can-drop');},
//     ondrop: function (event) {var drag = event.relatedTarget;
//         // console.log(drag.id);
//         // console.log(objs);
//         drag.classList.add('in_zone');drag.classList.remove('can-drop');
//     },
//     ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
// })

interact('.dropzone').dropzone({
    accept: '.drag',
    overlap: 0.5,

    ondragenter: function (event) {var drag = event.relatedTarget;var zone = event.target;

        if (objs[drag.classList[0]] == null){ 
            objs[drag.classList[0]] = {};
        }
        if(drag.id == "none") drag.id = get_id(drag.classList[0]);
        if (objs[drag.classList[0]][drag.id] == null){
            objs[drag.classList[0]][drag.id] = {};
            drag.setAttribute("onclick",`obj_click("${drag.id}")`);
            calc_total()
        }
        zone.classList.add('drop-target');drag.classList.add('can-drop');
    },
    ondragleave: function (event) {var drag = event.relatedTarget;var zone = event.target;zone.classList.remove('drop-target');drag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondrop: function (event) {var drag = event.relatedTarget
        
       if (proj_state == "loaded"){objs_back.push(JSON.parse(JSON.stringify(objs)));}
        objs[drag.classList[0]][drag.id] = {y:drag.getAttribute('data-y'),x:drag.getAttribute('data-x'),body:drag.innerHTML,color:drag.getAttribute("color"),layer:drag.getAttribute('layer')};
        drag.classList.add('in_zone');drag.classList.remove('can-drop');
        // console.log(objs["KeyBoard~g~не$основное"]["KeyBoard~g~не$основное_1"]);
        
    },
    ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})

interact('.createzone').dropzone({
    accept: '.spawn',
    overlap: 0.2,

    ondragenter: function (event) {var drag = event.relatedTarget;var zone = event.target;
        zone.classList.add('drop-target');drag.classList.add('can-drop');
    },
    ondragleave: function (event) {var drag = event.relatedTarget;var zone = event.target;

        if(drag.classList[1] == "spawn" && drag.classList[0] == zone.classList[0]){
            get_obj(drag.classList[0],(db_data)=>{
                // drag.transform = `translate(${drag.getAttribute("data-y")}px, ${drag.getAttribute("data-y")}px) scale(${db_data["width"] * cm_mod} ${db_data["height"] * cm_mod})`;
                drag.style.width = `${db_data["width"] * cm_mod}px`;
                drag.style.height = `${db_data["height"] * cm_mod}px`;

                // console.log(db_data);
            })
            let x = zone.getBoundingClientRect().left - document.getElementById("drags").getBoundingClientRect().left;
            let y = zone.getBoundingClientRect().top - document.getElementById("drags").getBoundingClientRect().top;
            create(`${zone.classList[0]} spawn drag`,x,y,null,`none`,false,0);
           if (proj_state == "loaded"){objs_back.push(JSON.parse(JSON.stringify(objs)));}
            drag.classList.remove('spawn');
        }
        zone.classList.remove('drop-target');
    },
    ondrop: function (event) {var drag = event.relatedTarget;
        drag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondropdeactivate: function (event) {var zone = event.target;
        zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})

function drag_start() {
    let spawns = document.getElementsByClassName("spawn");
    Object.entries(spawns).forEach(([key, spawn]) => {
        spawn.parentElement.removeChild(spawn);
    });
    let zones = document.getElementsByClassName("createzone");
    Object.entries(zones).forEach(([key, zone]) => {
        let x = zone.getBoundingClientRect().left - document.getElementById("drags").getBoundingClientRect().left;
        let y = zone.getBoundingClientRect().top - document.getElementById("drags").getBoundingClientRect().top;
        create(`${zone.classList[0]} spawn drag`,x,y,null,`none`,false,0);
    });
}

function get_id(clas){
    if(objs[clas] == null){  return `${clas}_0`}
    else{
        let count = Object.keys(objs[clas]).length;
        return `${clas}_${count}`;
    }
}
var game = new Game(1280, 720, '#efefef', update);
var socket = io();

var characters = [];

var myChar = new Shape("circle", 1280/2 - 25/2, 720/2 - 25/2, 25, 25, "red");

var lastUpdate = 0;


window.addEventListener('keydown', (ev)=>{
    if(ev.key === 'ArrowRight'){
        myChar.vx = 200;
    }else if(ev.key === 'ArrowLeft'){
        myChar.vx = -200;
    }

    if(ev.key === 'ArrowUp'){
        myChar.vy = -200;
    }else if(ev.key === 'ArrowDown'){
        myChar.vy = 200;
    }
});

window.addEventListener('keyup', (ev)=>{
    if(ev.key === 'ArrowRight'){
        myChar.vx = 0;
    }else if(ev.key === 'ArrowLeft'){
        myChar.vx = 0;
    }

    if(ev.key === 'ArrowUp'){
        myChar.vy = 0;
    }else if(ev.key === 'ArrowDown'){
        myChar.vy = 0;
    }
});

function update(){
    var cumTime = game.update();
    lastUpdate += cumTime;

    if(lastUpdate >= 250){
        socket.emit('update', myChar.x + "," + myChar.y);
        lastUpdate = 0;
    }

    for(var i = 0; i < characters.length; i++){
        var char = characters[i];
        char.char.update(cumTime);

        context.font = "20px monospace";
        context.textAlign = "center";
        context.fillText("test", char.char.x, char.char.y - 30, 50);
    }

    myChar.update(cumTime);
    if(myChar.x - myChar.width < 0){
        myChar.x = myChar.width;
    }else if(myChar.x + myChar.width > game.width){
        myChar.x = game.width - myChar.width;
    }

    if(myChar.y - myChar.height < 0){
        myChar.y = myChar.height;
    }else if(myChar.y + myChar.height > game.height){
        myChar.y = game.height - myChar.height;
    }
}

socket.on("join", function(event){
    var variables = event.split(",");

    var id = variables[0];
    var x = parseFloat(variables[1]);
    var y = parseFloat(variables[2]);

    var char = new Shape("circle",x === -1 ? 1280/2 - 25/2: x, y === -1 ? 720/2 - 25/2 : y, 25, 25, "blue");
    characters.push({id:id,char:char});

    console.log(event);
});

socket.on("update", function(event){
    var variables = event.split(",");
    var x = parseFloat(variables[0]);
    var y = parseFloat(variables[1]);
    var id = variables[2];

    for(var i = 0; i < characters.length; i++){
        if(characters[i].id === id){
            var char = characters[i].char;
            char.tween(x, y, 250);
            break;
        }
    }
});

socket.on("leave", function(id){
   for(var i = 0; i < characters.length; i++){
       if(characters[i].id === id){
           characters.splice(i, 1);
           break;
       }
   }
   console.log(id);
});

game.start();
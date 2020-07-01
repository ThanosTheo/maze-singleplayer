// each bit represents a wall
var BOTTOM = 0b10;
var RIGHT = 0b01;
var SIZE = 60;

// FOR DRAWING  MAZE and  PLAYER
var canvas = document.getElementsByTagName('canvas')[0];

if(window.innerHeight < window.innerWidth)
{
    canvas.width = window.innerHeight * 0.8;
    canvas.height = window.innerHeight * 0.8;
}
else
{
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerWidth * 0.8;
}

var width = canvas.width;
var context = canvas.getContext('2d');
var gridSize = width / SIZE;

// for maze generation
var NEIGHBOURS = [
    [-1,0],     // TOP
    [0,1],      // RIGHT
    [1,0],      // BOTTOM
    [0,-1]      // LEFT
]
var maze;

class Maze
{
    constructor()
    {
        this.generatemaze();
    }

    generatemaze() {
        // Reintialize new maze
        var visited = new Array(SIZE);
        maze = new Array(SIZE);
        for(var y = 0; y < SIZE ;y++)
        {
            maze[y] = new Array(SIZE);
            visited[y] = new Array(SIZE);
            for(var x = 0; x < SIZE ; x++)
            {
                // upon initialization each cell has all walls
                maze[y][x] = 0b11;
                visited[y][x] = false;
            }
        }  
        
        //maze generation using the Recursive Backtracker method
        var stack = [];

        //Choose the initial cell, mark it as visited and push it to the stack
        var curCell = [0,0];
        visited[curCell[0]][curCell[1]] = true;
        stack.push(curCell);

        //While the stack is not empty
        while(stack.length)
        {            
            //Pop a cell from the stack and make it a current cell
            curCell = stack.pop();
            //If the current cell has any neighbours which have not been visited
            var [unvisited, validNeighbours] = this.unVisited(curCell,visited);
            if(unvisited)
            {
                //Push the current cell to the stack
                stack.push(curCell);

                //break the wall;
                var chosen = this.breakWall(curCell,validNeighbours);

                //Mark the chosen cell as visited and push it to the stack
                visited[chosen[0]][chosen[1]] = true;
                stack.push(chosen);
            }
        }

        this.draw();
    }

    unVisited(current, visited)
    {        
        var unvisited = false;
        var validNeighbours = [];
        for (var i = 0; i < NEIGHBOURS.length; i++)
        {
            var temp = [current[0] + NEIGHBOURS[i][0] , current[1] + NEIGHBOURS[i][1]];
            if(this.notValid(temp)) continue;
            if(!visited[temp[0]][temp[1]])
            {
                unvisited = true;
                validNeighbours.push(i);
            }
            
        }
        return [unvisited, validNeighbours]
    }

    notValid(cords)
    {
        var yNotValid =  cords[0] < 0 ||  cords[0] > SIZE - 1;
        var xNotValid =  cords[1] < 0 ||  cords[1] > SIZE - 1;
        return yNotValid || xNotValid; 
    }

    breakWall(current,validNeighbours) 
    {
        //Choose one of the unvisited neighbours randomly          
        var chosen = validNeighbours[Math.floor(Math.random()*validNeighbours.length)];

        //Remove the wall between the current cell and the chosen cell
        var neighbour = [current[0] + NEIGHBOURS[chosen][0], current[1] + NEIGHBOURS[chosen][1]];

        switch(chosen)
        {
            case 1:
                maze[current[0]][current[1]] = maze[current[0]][current[1]] ^ RIGHT;
                break;
            case 2:
                maze[current[0]][current[1]] = maze[current[0]][current[1]] ^ BOTTOM;
                break;
            case 3:
                maze[neighbour[0]][neighbour[1]] = maze[neighbour[0]][neighbour[1]] ^ RIGHT;
                break;
            case 0:
                maze[neighbour[0]][neighbour[1]] = maze[neighbour[0]][neighbour[1]] ^ BOTTOM;
                break;
        }

        return neighbour
    }

    draw(){
        // clear canvas before drawing
        context.clearRect(0, 0, canvas.width, canvas.height);
        // draw new maze
        context.beginPath();
        context.moveTo(0, gridSize);
        for (var y = 0; y < SIZE; y++)
        {
            for (var x = 0; x < SIZE; x++)
            {
                var value = maze[y][x];
                //draw bottom line
                if(value & BOTTOM)
                {
                    context.moveTo(x * gridSize, (y+1) * gridSize);
                    context.lineTo((x+1) * gridSize, (y+1) * gridSize);
                }

                
                if(value & RIGHT)
                {
                    context.moveTo((x+1) * gridSize, (y) * gridSize);
                    context.lineTo((x+1) * gridSize, (y+1) * gridSize);
                }
            }
        }
        context.stroke();
    }
}


class Player
{
    constructor()
    {
        this.playerWidth = (gridSize/2)-3;

        // draw player at starting postion
        this.currX = 0;
        this.currY = 0;
        this.draw(0,0);

    }
    
    draw(x,y)
    {        
        context.beginPath();
        context.arc(this.getPosition(x+1), this.getPosition(y+1) , this.playerWidth, 0, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle =  "#009900";
        context.fill();
        
        this.checkWIN();
    }  
    
    clear(x,y)
    {
        context.beginPath();
        context.arc(this.getPosition(x+1), this.getPosition(y+1) , this.playerWidth + 2, 0, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = "#FFFFFF";
        context.fill();
    }

    getPosition(i)
    {
        return (i * gridSize) - (gridSize/2)
    }

    move(dir)
    {
        var  [newX,newY] = this.getNewCords(dir);

        if(this.validMove(newX, newY, dir))
        {
            this.clear(this.currX,this.currY);
            this.draw(newX,newY);
            this.currX = newX;
            this.currY = newY;
            this.checkWIN();
        }
    }

    validMove(x,y,dir)
    {
        if (x < 0 || y < 0 || x > SIZE - 1  || y > SIZE - 1  ) return false;
        
        switch(dir)
        {
            case "UP":             
                return !(maze[y][x] & BOTTOM);
            case "LEFT":
                return !(maze[y][x] & RIGHT);
            case "DOWN":
                return !(maze[this.currY][this.currX] & BOTTOM);
            case "RIGHT":
                return !(maze[this.currY][this.currX] & RIGHT);
        }
    }

    getNewCords(dir) 
    {
        switch (dir) 
        {
            case "UP":
                return [this.currX, this.currY - 1];
            case "RIGHT":
                return [this.currX + 1, this.currY];
            case "DOWN":
                return [this.currX, this.currY + 1];
            case "LEFT":
                return [this.currX - 1, this.currY];
            default: return;
        }
    }

    checkWIN()
    {
        if(this.currX === this.currY && this.currX === SIZE-1)
        {
            setTimeout(function(){
                window.alert("YOU WIN!");
            }, 10);
        }
    }
}


class Astar extends Player
{
    constructor()
    {
        super();
        var validMove = this.__proto__.__proto__.validMove;
        var getNewCords = this.__proto__.__proto__.getNewCords;
    }

    findPath()
    {
        var start = [this.currY, this.currX];
        // The List of discovered nodes that may need to be (re-)expanded.
        // push the start node to the list
        var openList = [start];

        // used for backtracing to find the best path
        var cameFrom = {}; 
        
        var gScore = {};
        var fScore = {};
        for(var i = 0 ; i < SIZE ;i++)
            for(var j = 0 ; j < SIZE ;j++)
            {
                gScore[this.KeyGen([i,j])] = Infinity;
                fScore[this.KeyGen([i,j])] = Infinity;
            }

        // holds the g score of each node
        gScore[this.KeyGen(start)] = 0;

        // holds the f score of each node
        fScore[this.KeyGen(start)] = this.f(start);
        
        while(openList.length)
        {
            // get the lowest f(x) from the set and set the current node
            var lowestNode;
            var lowestF = Infinity;

            for( var i = 0; i < openList.length ; i++)
            {
                var key = this.KeyGen(openList[i]);
                if(lowestF > fScore[key])
                {
                    lowestNode = this.RevKeyGen(key);
                    lowestF = fScore[key];
                }
            }

            var currentNode = lowestNode;
            // will be used in validMove()
            this.currX = currentNode[0];
            this.currY = currentNode[1];

            
            // if current Node is the final Node return the path
            if(currentNode[0] === SIZE-1 && currentNode[1] === SIZE-1)
            {
                // backtrack to find best path
                // The List of moves in the final path
                // will be used for drawing
                this.closedMoveList = this.backtrack(currentNode,cameFrom);
                return true;
            }



            // remove current node from openList
            this.remove(openList, currentNode);

            //get the neighbours of the current node
            var [neighbours,moves] = this.getNeighbours();
            
            
            // foreach neighbor of the current Node
            neighbours.forEach(function(neighbour,indx)
            {
                   
                var newGScore = gScore[this.KeyGen(currentNode)] + this.distance(currentNode, neighbour);


                if(newGScore < gScore[this.KeyGen(neighbour)] || !gScore[this.KeyGen(neighbour)])
                {                           
                    cameFrom[this.KeyGen(neighbour)] = [currentNode, moves[indx]];
                    gScore[this.KeyGen(neighbour)] = newGScore;
                    fScore[this.KeyGen(neighbour)] = this.f(neighbour);

                    if(this.findIndex(openList, neighbour) == -1)
                    {
                        openList.push(neighbour);
                    }
                }
               
            }.bind(this));
        }
        return false;
    }
    
    remove(list, node)
    {
        list.splice(
            list.findIndex( item => 
              item[0] === node[0] && item[1] === node[1]
            ), 
         1);
    }

    findIndex(list, node)
    {
        var indx = -1;
        for(var i = 0; i < list.length; i++)
        {
            if(list[i][0] === node[0] && list[i][1] === node[1])
            {
                indx = i;
            }
        }
        return indx;
    }

    f(node)
    {        
        // return the sum of the distances between the current node and the starting ,final nodes.
        return this.g(node) + this.distance(node, [SIZE-1, SIZE-1]);
    }

    g(node)
    {
        return this.distance(node, [0, 0])
    }

    distance(node, other)
    {
        return Math.sqrt(Math.pow((node[0]-other[0]),2) + Math.pow((node[1]-other[1]),2));
    }

    getNeighbours()
    {

        var directions = ["UP", "DOWN", "LEFT", "RIGHT"];
        var neighbours = [];
        var moves = [];
        directions.forEach(function(dir)
        {
            var [newX,newY] = this.getNewCords(dir);

            // validmove and getNewCords are functions of the player object
            if(this.validMove(newX, newY, dir))
            {
                neighbours.push([newX, newY]);
                moves.push(dir);
            }
        }.bind(this));
        return [neighbours,moves];
    }

    KeyGen(node)
    {
        return String(node[0]) + "," + String(node[1]);
    }

    RevKeyGen(key)
    {
        return  key.split(",").map( function(item){return parseInt(item)});
    }


    backtrack(finalNode, parrent)
    {

        var currentNode = finalNode;
        var moves = [];
        do
        {
            var temp = parrent[this.KeyGen(currentNode)];
            
            currentNode = temp[0];
            moves.unshift(temp[1]);
        }
        while(currentNode[0] !== 0 || currentNode[1] !== 0)
        return moves;
    }     
}

(function () 
{
    var maze = new Maze();
    var player = new Player();
    
    var astar = new Astar();
    astar.findPath()

    window.addEventListener('keydown', 
    function(e){
        var dir;
        switch (e.keyCode) {
            case 38:    // arrow up key
            case 87:    // W key
                dir = "UP";
                break;
            case 39:    // arrow right key
            case 68:    // D key
                dir = "RIGHT";
                break;
            case 40:    // arrow down key
            case 83:    // S key
                dir = "DOWN";
                break;
            case 37:    // arrow left key
            case 65:    // A key
                dir = "LEFT";
                break;
            default: return;
        }

        player.move(dir)
    },true);

    // add a listener to get a new maze and new player
    document.getElementById("newMaze").addEventListener("click",
    function(e)
    {
        maze.generatemaze();
        
        player.currX = 0;
        player.currY = 0;
        player.draw(0,0);
        
        astar = new Astar();
        astar.findPath()
    } ,true);
    

    var i = 0;                                                 

    function myLoop() {                                     
      setTimeout(function() {                              
        player.move(astar.closedMoveList[i])             
        i++;                                                
        if (i < astar.closedMoveList.length) {           
          myLoop();                                     
        }                                               
      }, 100)
    }

    document.getElementById("Solve").addEventListener("click",
    function(e)
    {
        myLoop();
    });
})();


// DEBUG
// console.log(temp[0])
// console.log(temp[1])
// console.log(moves)
// console.log(currentNode)
// var res =  window.prompt() 
// if (res === "exit") return;
// DEBUG
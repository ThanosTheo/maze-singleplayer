// each bit represents a wall
var BOTTOM = 0b10;
var RIGHT = 0b01;
var SIZE = 35;

// FOR DRAWING  MAZE and  PLAYER
var canvas = document.getElementById('mazeContainer');
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
        var  newX,newY;

        switch (dir) 
        {
            case "UP":
                newX = this.currX;
                newY = this.currY - 1;
                break;
            case "RIGHT":    // arrow right key
                newX = this.currX + 1;
                newY = this.currY;
                break;
            case "DOWN":
                newX = this.currX;
                newY = this.currY + 1;
                break;
            case "LEFT":
                newX = this.currX - 1;
                newY = this.currY;
                break;
            default: return;
        }

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

    checkWIN()
    {
        if(this.currX === this.currY && this.currX === SIZE-1)
        {
            console.log("You Win!");
            window.alert("YOU WIN!")
        }
    }
}

(function () 
{
    var maze = new Maze();
    var player = new Player();

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
})();
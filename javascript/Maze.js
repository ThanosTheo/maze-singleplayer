// each bit represents a wall
var BOTTOM = 0b10;
var RIGHT = 0b01;
var SIZE = 25;


var NEIGHBOURS = [
    [-1,0],     // TOP
    [0,1],      // RIGHT
    [1,0],      // BOTTOM
    [0,-1]      // LEFT
]

class Maze
{
    constructor()
    {
        this.generatemaze();
    }

    generatemaze() {
        // Reintialize new maze
        var visited = new Array(SIZE);
        this.maze = new Array(SIZE);
        for(var y = 0; y < SIZE ;y++)
        {
            this.maze[y] = new Array(SIZE);
            visited[y] = new Array(SIZE);
            for(var x = 0; x < SIZE ; x++)
            {
                // upon initialization each cell has all walls
                this.maze[y][x] = 0b1111;
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
                this.maze[current[0]][current[1]] = this.maze[current[0]][current[1]] ^ RIGHT;
                break;
            case 2:
                this.maze[current[0]][current[1]] = this.maze[current[0]][current[1]] ^ BOTTOM;
                break;
            case 3:
                this.maze[neighbour[0]][neighbour[1]] = this.maze[neighbour[0]][neighbour[1]] ^ RIGHT;
                break;
            case 0:
                this.maze[neighbour[0]][neighbour[1]] = this.maze[neighbour[0]][neighbour[1]] ^ BOTTOM;
                break;
        }

        return neighbour
    }

    draw(){
        var canvas = document.getElementById('mazeContainer');
        var width = canvas.width;
        var context = canvas.getContext('2d');

        var gridSize = width / SIZE;
        context.beginPath();
        context.moveTo(0, gridSize);
        for (var y = 0; y < SIZE; y++)
        {
            for (var x = 0; x < SIZE; x++)
            {
                var value = this.maze[y][x];
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
        console.log(this.maze)
    }
}

var maze = new Maze();
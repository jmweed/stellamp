//socket.io setup
const socket = io();

//Canvas setup
const c = document.getElementById("sky");
const ctx = c.getContext("2d");
c.width = 1280;
c.height = 720;

//Canvas GameState rendering functions 
let gameLocalState;

function clearSky ()	{
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, c.width, c.height);
}
clearSky();
function renderStar (star)	{
	ctx.fillStyle = star.color;
	ctx.fillRect(star.x, star.y-1, 1, 3);
	ctx.fillRect(star.x-1, star.y, 3, 1);
}
function renderGalaxy (galaxy)	{
	for (let i = 0; i < galaxy.length; i++)	{
		renderStar(galaxy[i]);
	}
}
function renderLines (gameState)	{
	gameState.lines.forEach(element =>	{
		let orgStar = element.org;
		let dstStar = element.dst;
		ctx.beginPath();
		ctx.moveTo(gameState.galaxy[orgStar].x, gameState.galaxy[orgStar].y);
		ctx.lineTo(gameState.galaxy[dstStar].x, gameState.galaxy[dstStar].y);
		ctx.strokeStyle = "#FFFFFF";
		ctx.stroke();
	})
}
function renderGameState(gameState)	{
	clearSky();
	renderGalaxy(gameState.galaxy);
	renderLines(gameState);
}

//Canvas UI rendering functions
let nearestStarI;
let tempLine =	{
	org : 0,
	dst : 0
}

function renderSelectionArrow (starI)	{
	let star = gameLocalState.galaxy[starI];
	ctx.beginPath();
	ctx.strokeStyle = "#AAFFAA";
	ctx.moveTo(star.x+2, star.y);
	ctx.lineTo(star.x+9, star.y);
	ctx.moveTo(star.x+2, star.y);
	ctx.lineTo(star.x+4, star.y-3)
	ctx.moveTo(star.x+2, star.y);
	ctx.lineTo(star.x+4, star.y+3);
	ctx.stroke();
}
function renderLine (org, dst)	{
	ctx.beginPath();
	ctx.moveTo(gameLocalState.galaxy[org].x, gameLocalState.galaxy[org].y);
	ctx.lineTo(gameLocalState.galaxy[dst].x, gameLocalState.galaxy[dst].y);
	ctx.strokeStyle = "#FFFFFF";
	ctx.stroke();
}

//Event Handler Helper Functions & Vars
let mouseDown = false;

function findNearestStar(gameState, mousePos)
{
	let galaxy = gameState.galaxy;
	//console.log("Galaxy size is: " + galaxy.length);
	let bestdiff = 40000;
	let besti = 0;
	for (let i = 0; i < galaxy.length; i++)
	{
		let xdiff = Math.abs(mousePos.x - galaxy[i].x);
		let ydiff = Math.abs(mousePos.y - galaxy[i].y);
		let diff = xdiff + ydiff;
		//console.log(diff);
		if (diff < bestdiff)
		{
			bestdiff = diff;
			besti = i;
		}
	}
	console.log("Nearest star is distance of: ", bestdiff);
	console.log("Nearest star is at Galaxy Pos: ", besti);
	return besti;
}
function findSecondNearestStar(gameState, mousePos, avoidI)
{
	let galaxy = gameState.galaxy;
	//console.log("Galaxy size is: " + galaxy.length);
	let bestdiff = 40000;
	let besti = 0;
	for (let i = 0; i < galaxy.length; i++)
	{
		if (!(i==avoidI))	{
			let xdiff = Math.abs(mousePos.x - galaxy[i].x);
			let ydiff = Math.abs(mousePos.y - galaxy[i].y);
			let diff = xdiff + ydiff;
			//console.log(diff);
			if (diff < bestdiff)
			{
				bestdiff = diff;
				besti = i;
			}
		}
	}
	console.log("Nearest star is distance of: ", bestdiff);
	console.log("Nearest star is at Galaxy Pos: ", besti);
	return besti;
}

//DOM Event Handlers
let instructionsShown = true; 
let instructionsHTML = 	'<p>Welcome to Stella</p><p>Controls:</p><li>Click and drag to draw lines between stars</li><li>Release left mouse button to add a line to the shared constellation</li><li>Press backspace to delete the most recent line</li><li>Press n for a new galaxy</li><li>Press ESC to toggle instructions</li>'

c.onmousedown = () =>	{
	mouseDown = true;
	//socket.emit('create', galSettings)
	//socket.emit('line', ranline())
}

c.onmousemove = () =>	{
	e = window.event
	let mousePos = {
		x : e.offsetX,
		y : e.offsetY
	}
	if (mouseDown)	{
		secondNearestStarI = findSecondNearestStar(gameLocalState, mousePos, nearestStarI);
		renderGameState(gameLocalState);
		renderSelectionArrow(nearestStarI);
		renderSelectionArrow(secondNearestStarI);
		tempLine.org = nearestStarI;
		tempLine.dst = secondNearestStarI;
		renderLine (tempLine.org, tempLine.dst);
	} else	{
		nearestStarI = findNearestStar(gameLocalState, mousePos);
		renderGameState(gameLocalState);
		renderSelectionArrow(nearestStarI);
	}
}

c.onmouseup = () =>	{
	e = window.event
	let mousePos = {
		x : e.offsetX,
		y : e.offsetY
	}
	mouseDown = false;
	nearestStarI = findNearestStar(gameLocalState, mousePos);
	socket.emit('line', tempLine);
}

window.onkeydown = () =>	{
	k = window.event.key;
	kCode = window.event.keyCode;
	if (k == "n" || k == "N")
	{
		socket.emit('new galaxy');
	}
	else if (k == "Backspace" || k == "Delete" || kCode == 8 || kCode == 46)
	{
		socket.emit('backspace');
	}
	else if (k == "Escape")	{
		if (instructionsShown)	{
			instructionsShown = false;
			document.getElementById("instructions").innerHTML = ""
		}
		else	{
			instructionsShown = true;
			document.getElementById("instructions").innerHTML = instructionsHTML;
		}
	}
}

//Recieve gameState
socket.on('state', gameState => {
	console.log("gameState recieved!");
	gameLocalState = gameState;
	renderGameState(gameLocalState);
})
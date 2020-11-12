//Dependencies
const express = require('express');
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)
const stella = require('./stellagame.js')

//Express setup and file transfer
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) =>	{
	res.sendFile(__dirname + '/client/index.html');
})

//gameState setup and emit function
let gameState = {
	galaxy : {},
	lines : {},
	sendState : function()	{
		io.sockets.emit('state', gameState);}
}

//test settings
const galSettings = {
	starCount : 200,
	galWidth : 1280,
	galHeight : 720
}

gameState.galaxy = stella.generateGalaxy(galSettings);
gameState.lines = [];

//socket.io response function
io.on('connection', function (socket)	{
	console.log('new connection')
	gameState.sendState()

	//Create new galaxy
	socket.on('new galaxy',  () =>	{
		gameState.galaxy = stella.generateGalaxy(galSettings);
		gameState.lines = [];
		gameState.sendState();
	})

	//Add lines to gameState upon request
	socket.on('line', line => {
		//console.log("Line request recieved for org: " + line.org + " and dst: " + line.dst);
		gameState.lines.push(line);
		gameState.sendState();
	})

	//Delete most recent line
	socket.on('backspace', () => {
		if (gameState.lines.length > 0)	{
			gameState.lines.pop();
			gameState.sendState();
		}
	})

	socket.on('disconnect', () => {
		console.log('Disconnection');
	})
})

//Server start
const port = 80;

server.listen(port, () => {
	console.log("Listening on port: " + port);
})
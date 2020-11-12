exports.test = () => {
	console.log("stellagame.js export works!");
};

exports.generateGalaxy = (galSettings) =>	{
	const starCount = galSettings.starCount;
	const galWidth = galSettings.galWidth;
	const galHeight = galSettings.galHeight;

	let galaxy = [];

	for (let i = 0; i < starCount; i++)	{
		let xpos = Math.round(Math.random() * galWidth);
		let ypos = Math.round(Math.random() * galHeight);
		let newcolor = Math.round(Math.random() * 3);
		switch(newcolor)	{
			case 0:
				newcolor = "#FFFFFF";
				break;
			case 1:
				newcolor = "#C0C0FF";
				break;
			case 2:
			default:
				newcolor = "#FFFFC0";
		}
		let star = {
			x : xpos,
			y : ypos,
			color : newcolor
		}
		galaxy.push(star)
	}

	return galaxy;
}
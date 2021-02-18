const radius = 4;
const INVALID_ID = -1;

var deCanvas = null;
var hodCanvas = null;
var deContext = null;
var hodContext = null;

var movingIndex = INVALID_ID;
var movingControlPoints = false;
var fullClear = false;

var controlPoints = [];
var hodographPoints = [];

window.onload = function()
{
	deCanvas = document.getElementById("deCasteljau");
	if (!deCanvas)
	{
		alert("Cannot retrieve de Casteljau canvas!");
		return;
	}

	hodCanvas = document.getElementById("hodograph");
	if (!hodCanvas)
	{
		alert("Cannot retrieve hodograph canvas!");
		return;
	}

	deContext = deCanvas.getContext("2d");
	if (!deContext)
	{
		alert("Cannot load de Casteljau context!");
		return;
	}

	hodContext = hodCanvas.getContext("2d");
	if (!hodContext)
	{
		alert("Cannot load hodograph context!");
		return;
	}

	drawControlPoint(hodContext, centerPoint(), "black");

	//add event listeners
	deCanvas.addEventListener("click", handleLeftClick);
	deCanvas.addEventListener("mousedown", handleMouseDown);
	deCanvas.addEventListener("mousemove", handleMouseMove);
	deCanvas.addEventListener("mouseup", handleMouseUp);
	deCanvas.addEventListener("contextmenu", handleRightClick, false);
}

function handleLeftClick(event)
{
	if (movingControlPoints)
		return;
	
	var point = mousePoint(event);
	
	controlPoints.push(point);

	if(controlPoints.length > 1)
		hodographPoints.push(hodograph(controlPoints.length-1));
	fillCanvas("#2299ab");
}

function handleMouseDown(event)
{
	if (!movingControlPoints)
		return;
	
	var point = mousePoint(event);
	movingIndex = INVALID_ID;

	var radiusPow = Math.pow(radius, 2);
	const tolerance = 5;
	for (var i = 0; i < controlPoints.length; ++i)
	{
		var xExpr = Math.pow(point.x - controlPoints[i].x, 2);
		var yExpr = Math.pow(point.y - controlPoints[i].y, 2);
		if (xExpr + yExpr <= radiusPow + tolerance)
		{
			movingIndex = i;
			break;
		}
	}
}

function handleMouseMove(event)
{
	
	if (movingIndex == INVALID_ID)
		return;

	var point = mousePoint(event);
	controlPoints[movingIndex] = point;
	reHodograph();
	fillCanvas("#1a9c5b");
}

function handleMouseUp(event)
{
	movingIndex = INVALID_ID;
}

function handleRightClick(event)
{
	event.preventDefault();
	
	var point = mousePoint(event);
	var index = INVALID_ID;

	var radiusPow = Math.pow(radius, 2);
	const tolerance = 5;
	for (var i = 0; i < controlPoints.length; i++)
	{
		var xExpr = Math.pow(point.x - controlPoints[i].x, 2);
		var yExpr = Math.pow(point.y - controlPoints[i].y, 2);
		if (xExpr + yExpr <= radiusPow + tolerance)
		{
			index = i;
			break;
		}
	}
	
	if (index == INVALID_ID)
		return false;
	
	controlPoints.splice(index, 1);
	reHodograph();
	if(!movingControlPoints)
		fillCanvas("#2299ab");
	else
		fillCanvas("#1a9c5b");
	
	return false;
}

function mousePoint(event)
{
	var deCanvasRect = deCanvas.getBoundingClientRect();
	var x = event.clientX - deCanvasRect.left;
	var y = event.clientY - deCanvasRect.top;

	return new point(x, y);
}

function hodograph(el)
{
	var cent = centerPoint();
	var a = controlPoints[el];
	var b = controlPoints[el-1];
	var x = cent.x + a.x - b.x;
	var y = cent.y + a.y - b.y;

	return new point(x, y);
}

function fillCanvas(color)
{
	clear();
	drawCurve(deContext, controlPoints);
	drawControlPoints(deContext, controlPoints, color);
	drawCurve(hodContext, hodographPoints);
	drawControlPoints(hodContext, hodographPoints, "black");
}

function clear()
{
	deContext.clearRect(0, 0, deCanvas.width, deCanvas.height);
	hodContext.clearRect(0, 0, hodCanvas.width, hodCanvas.height);
	if(fullClear)
	{
		controlPoints = [];
		hodographPoints = [];
	}
	else
	{
		drawControlPoint(hodContext, centerPoint(), "black");
	}
}

function drawControlPoints(context, points, color)
{
	for (var i = 0; i < points.length; i++)
		drawControlPoint(context, points[i], color);
}

function drawControlPoint(context, point, color)
{
	context.beginPath();
	context.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
	context.lineWidth = 2;
	context.fillStyle = color;
	context.fill();
	context.strokeStyle = color;
	context.stroke();
}

function drawCurve(context, points)
{
	if (points.length == 0)
		return;

	context.strokeStyle = "black";
	for (var t = 0; t < 1; t += 0.001)
	{
		var point = deCasteljau(t, points);
		context.strokeRect(point.x, point.y, 1, 1);
	}
	
	connectControlPoints(context, points);
}

function deCasteljau(t, ctrlPoints)
{
	var parameters = new Array(ctrlPoints.length - 1).fill(t);
	if (!Array.isArray(parameters) || parameters.length != (ctrlPoints.length - 1))
	{
		alert("Invalid input(calulate curve point)");
		return;
	}

	if (ctrlPoints.length == 1)
		return ctrlPoints[0];

	var points = ctrlPoints.slice();
	var iteration = 0;
	while (points.length != 1)
	{
		var t = parameters[iteration];
		var newPoints = [];
		for (var i = 1; i < points.length; ++i)
		{
			var x = (1 - t) * points[i - 1].x + t * points[i].x;
			var y = (1 - t) * points[i - 1].y + t * points[i].y;

			newPoints.push(new point(x, y)); 
		}

		iteration++;
		points = newPoints.slice();
	}

	return points[0];
}

function connectControlPoints(context, ctrlPoints)
{
	var points = ctrlPoints;
	if (points.length == 0)
	{
		alert("Control points missing");
		return;
	}

	context.beginPath();
	context.strokeStyle = "gray";
	context.lineWidth = 1;
	if(context == deContext)
	{
		for (var i = 0; i < points.length - 1; ++i)
		{
			context.moveTo(points[i].x, points[i].y);
			context.lineTo(points[i + 1].x, points[i + 1].y);
			context.stroke();
		}
	}
	else
	{
		var cent = centerPoint();
		var l = points.length - 1;
		for (var i = 0; i < l; ++i)
		{
			context.moveTo(points[i].x, points[i].y);
			context.lineTo(points[i + 1].x, points[i + 1].y);
			context.stroke();
			context.moveTo(cent.x, cent.y);
			context.lineTo(points[i].x, points[i].y);
			context.stroke();
		}
		context.moveTo(cent.x, cent.y);
		context.lineTo(points[l].x, points[l].y);
		context.stroke();
	}
}

function reHodograph()
{
	hodographPoints = [];
	for(var i = 1; i < controlPoints.length; i++)
	{
		hodographPoints.push(hodograph(i));
	}
}

function centerPoint()
{
	var x = hodCanvas.width/2;
	var y = hodCanvas.height/2;
	
	return new point(x, y);
}

function toggleMoveState()
{
	if(!movingControlPoints)
		document.documentElement.style.setProperty('--move', "#21b56b");
	else
		document.documentElement.style.setProperty('--move', "#37b2c4");
	movingControlPoints= !movingControlPoints;
	if(!movingControlPoints)
		fillCanvas("#2299ab");
	else
		fillCanvas("#1a9c5b");
}

function toggleClear()
{
	fullClear = true;
	clear();
	fullClear = false;
	fillCanvas();
}

function point(x, y)
{
	this.x = x;
	this.y = y;
}


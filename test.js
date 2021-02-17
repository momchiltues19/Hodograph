const radius = 4;
const INVALID_IDX = -1;

var deCanvas = null;
var hodCanvas = null;
var deContext = null;
var hodContext = null;

var movingControlPointIdx = INVALID_IDX;
var movingControlPoints = false;

var currentControlPoints = [];
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

	var point = centerPoint(event);
	hodographPoints.push(point);

	//add event listeners
	deCanvas.addEventListener("click", handleLeftClick);
	deCanvas.addEventListener("mousedown", handleMouseDown);
	deCanvas.addEventListener("mousemove", handleMouseMove);
	deCanvas.addEventListener("mouseup", handleMouseUp);
	deCanvas.addEventListener("oncontextmenu", handleRightClick);
}

function handleLeftClick(event)
{
	if (movingControlPoints)
		return;
	
	var point = mousePoint(event);
	
	currentControlPoints.push(point);

	if(currentControlPoints.length > 1)
		hodographPoints.push(hodograph());
	fillCanvas("#2020FF");
}

function hodograph()
{
	var l = currentControlPoints.length-1;
	var a = currentControlPoints[l];
	var b = currentControlPoints[l-1];
	var x = a.x - b.x;
	var y = a.y - b.y;

	return new point(x, y);
}

function fillCanvas(color)
{
	clear();
	drawCurve();
	drawControlPoints(deContext, color);
	drawControlPoints(hodContext, color);
}

function clear()
{
	deContext.clearRect(0, 0, deCanvas.width, deCanvas.height);
}

function drawControlPoints(context, color)
{
	for (var i = 0; i < currentControlPoints.length; i++)
		drawControlPoint(context, currentControlPoints[i], color);
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

function drawCurve()
{
	if (currentControlPoints.length == 0)
		return;

	deContext.strokeStyle = "black";
	for (var t = 0; t < 1; t += 0.001)
	{
		var point = deCasteljau(t, currentControlPoints);
		deContext.strokeRect(point.x, point.y, 1, 1);
	}
	
	connectControlPoints(currentControlPoints);
}

function deCasteljau(t, controlPoints)
{
	var parameters = new Array(controlPoints.length - 1).fill(t);
	if (!Array.isArray(parameters) || parameters.length != (controlPoints.length - 1))
	{
		alert("Invalid input(calulate curve point)");
		return;
	}

	if (controlPoints.length == 1)
		return controlPoints[0];

	var points = controlPoints.slice();
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

function connectControlPoints(controlPoints)
{
	var points = controlPoints;
	if (points.length == 0)
	{
		alert("Control points missing");
		return;
	}

	deContext.beginPath();
	deContext.strokeStyle = "gray";
	deContext.lineWidth = 1;

	for (var i = 0; i < points.length - 1; ++i)
	{
		deContext.moveTo(points[i].x, points[i].y);
		deContext.lineTo(points[i + 1].x, points[i + 1].y);
		deContext.stroke();
	}
}

function handleMouseDown(event)
{
	if (!movingControlPoints)
		return;

	
	var point = mousePoint(event);
	movingControlPointIdx = INVALID_IDX;

	var radiusPow = Math.pow(radius, 2);
	const tolerance = 5;
	for (var i = 0; i < currentControlPoints.length; ++i)
	{
		var xExpr = Math.pow(point.x - currentControlPoints[i].x, 2);
		var yExpr = Math.pow(point.y - currentControlPoints[i].y, 2);
		if (xExpr + yExpr <= radiusPow + tolerance)
		{
			movingControlPointIdx = i;
			break;
		}
	}
}

function handleMouseMove(event)
{
	addingControlPoints = true;
	
	if (movingControlPointIdx == INVALID_IDX)
		return;

	var point = mousePoint(event);
	currentControlPoints[movingControlPointIdx] = point;
	fillCanvas("#197419");
}


function handleMouseUp(event)
{
	movingControlPointIdx = INVALID_IDX;
}

function mousePoint(event)
{
	var deCanvasRect = deCanvas.getBoundingClientRect();
	var x = event.clientX - deCanvasRect.left;
	var y = event.clientY - deCanvasRect.top;

	return new point(x, y);
}

function centerPoint(event)
{
	var hodCanvasRect = hodCanvas.getBoundingClientRect();
	var x = (hodCanvasRect.left + hodCanvasRect.rigth)/2;
	var y = (hodCanvasRect.top + hodCanvasRect.bottom)/2;
	
	return new point(x, y);
}

function toggleMoveState()
{
	movingControlPoints= !movingControlPoints;
	if(!movingControlPoints)
		fillCanvas("#2020FF");
	else
		fillCanvas("#197419");
}

function handleRightClick(event)
{
	
}

function point(x, y)
{
	this.x = x;
	this.y = y;
}


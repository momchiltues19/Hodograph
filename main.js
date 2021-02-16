var controlPoints = [];

var deCanvas = null;
var hodCanvas = null;
var deContext = null;
var hodContext = null;

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

	deCanvas.addEventListener("click", addPoint);
}

function addPoint(event)
{
	var point = createPoint(event);
	
	controlPoints.push(point);
	drawControlPoint(point);
}

function createPoint(event)
{
	var canvasRect = deCanvas.getBoundingClientRect();
	var x = event.clientX - canvasRect.left;
	var y = event.clientY - canvasRect.top;

	return new point(x, y);
}

function drawControlPoint(point)
{
	deContext.beginPath();
	deContext.arc(center.x, center.y, 3, 0, 2 * Math.PI, false);
	deContext.lineWidth = 2;
	deContext.fillStyle = "green";
	deContext.fill();
	deContext.strokeStyle = "green";
	deContext.stroke();
}
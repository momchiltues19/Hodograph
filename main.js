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
	drawPoint(point);
	
	drawCurve();
}

function createPoint(event)
{
	var canvasRect = deCanvas.getBoundingClientRect();
	var x = event.clientX - canvasRect.left;
	var y = event.clientY - canvasRect.top;

	return new point(x, y);
}

function drawCurrentPoints()
{
	 controlPoints.forEach(drawPoint);
}

function drawPoint(point)
{
	deContext.beginPath();
	deContext.arc(point.x, point.y, 3, 0, 2 * Math.PI, false);
	deContext.lineWidth = 2;
	deContext.fillStyle = "red";
	deContext.fill();
	deContext.strokeStyle = "red";
	deContext.stroke();
}

function point(x, y)
{
	this.x = x;
	this.y = y;
}

function drawCurve()
{
	if (controlPoints.length == 0)
		return;
	
	deContext.strokeStyle = "black";
	for (var t = 0; t < 1; t += 0.001)
	{
		var point = calculatePointForT(t, controlPoints);
		deContext.strokeRect(point.x, point.y, 1, 1);
	}

	connectControlPoints(currentControlPoints);
}

function calculatePointForT(t, ctrlPoints)
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

		++iteration;
		points = newPoints.slice();
	}

	return points[0];
}

function clear()
{
	deContext.clearRect(0, 0, canvas.width, canvas.height);
}
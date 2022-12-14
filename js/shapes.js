let shapeCount = 0

function getMousePos(x, y)
{
    const rect = document.getElementById("shape-container").getBoundingClientRect()

    return {
        x: ( x - rect.left ) / rect.width  * 100,
        y: ( y - rect.top )  / rect.height * 100,
    }
}

function shapeClass(_type)
{
    return {
        x: 0,
        y: 0,
        height: defaultSize,
        width: defaultSize,
        angle: 0,
        type: _type,
        color: "blue",
        index: -1
    }
}

function getShapePos(div, shape)
{
    const rect = div.getBoundingClientRect()
    return {
        x: rect.left,
        y: rect.top,
    }
}

function getShapeMid(div)
{
    const rect = div.getBoundingClientRect()
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    }
}

function getShapeTransform(shape)
{
    const originApply = `translate(${shape.width/2}%, ${shape.height/2}%)`
    const originUndo = `translate(${-shape.width/2}%, ${-shape.height/2}%)`

    const posString = `translate(${shape.x}%, ${shape.y}%)`
    const rotationString = `rotateZ(${shape.angle}deg)`
    const sizeString = `scale(${shape.width*10}%, ${shape.height*10}%)`
    // Base 
    return `${posString} ${originApply} ${rotationString} ${originUndo} ${sizeString}`
}

function getShapeStyle(shape)
{
    return `
    {
        color: ${shape.color};
        transform: ${getShapeTransform(shape)}
    }
    `
}

updateShape = function(shape, div)
{
    div.style.transform = getShapeTransform(shape)
    div.style.color = shape.color
    div.style.zIndex = shape.zindex
}

addShape = function(div, _type)
{
    const shape = shapeClass(_type);

    div.onmousedown = (e) => {MouseDown(e, div, shape)}

    div.classList.add("shape")
    updateShape(shape, div)

    drawnShapes.push(shape)
    drawnDivs.push(div)

    shape.index = shapeCount;
    shapeCount++;

    return shape
}

function SquareBase()
{
    const baseGroup = document.createElementNS(NSSvg, "g")
    const square = document.createElementNS(NSSvg, "path")

    square.setAttribute("d", squarePath)
    square.classList.add("square")

    baseGroup.appendChild(square)

    return baseGroup
}

function TriangleBase()
{
    const baseGroup = document.createElementNS(NSSvg, "g")
    const square = document.createElementNS(NSSvg, "path")

    square.setAttribute("d", trianglePath)
    square.classList.add("triangle")

    baseGroup.appendChild(square)

    return baseGroup
}

function SemiCircleBase()
{
    const baseGroup = document.createElementNS(NSSvg, "g")
    const square = document.createElementNS(NSSvg, "path")

    square.setAttribute("d", halfCirclePath)
    square.classList.add("semi-circle")

    baseGroup.appendChild(square)

    return baseGroup
}
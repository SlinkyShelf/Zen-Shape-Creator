const shapeContainer = document.getElementById("shapeContainer")

const activeShapes = []
const shapeDivs = []
let patterns = []

let tool = "Move"

const stallLength = 1
const TransitionLength = 1

let dragging = null;
let dragingDiv = null;
let DragStartX
let DragStartY
let xOffset;
let yOffset;
let startingAngle;
let startingDrag;
let XLineDistance;
let startingPos;

function getDivPos(div)
{
    const rect = div.getBoundingClientRect()
    return {
        x: rect.left + (rect.right-rect.left)/2, 
        y: rect.top + (rect.bottom-rect.top)/2
    }
}

const rotGrid = 5
const moveGrid = 1

function grid(value, gri) {
    return Math.floor(value / gri) * gri
}

function getShapeSVGPosition(shape) 
{
    const boxWidth = document.getElementById("shapeContainer").clientWidth
    const boxWidthToP = boxWidth / 100
    const newx = grid(shape.x / boxWidthToP, moveGrid)// - dragging.width/20
    const newy = grid(shape.y / boxWidthToP, moveGrid)// - dragging.height/20

    return {
        x: newx, y: newy
    }
}

function getShapeSVGSize(shape)
{
    const boxWidth = document.getElementById("shapeContainer").clientWidth
    const scaleConversion = boxWidth / 100 * 10 
    return {width: shape.width / scaleConversion, height: shape.height / scaleConversion}
}

function sizeUpdate(shape, div)
{
    div.style.scale= `${shape.width}% ${shape.height}%`
}

function calcOrigin(shape)
{
    return {x: shape.width/100*5, y: shape.height/100*5}
}

function getShapeTransform(shape)
{
    const pos = getShapeSVGPosition(shape)
    const origin = calcOrigin(shape)

    const originApply = `translate(${origin.x}%, ${origin.y}%)`
    const originUndo = `translate(${-origin.x}%, ${-origin.y}%)`

    const posString = `translate(${pos.x}%, ${pos.y}%)`
    const rotationString = `rotateZ(${shape.angle}deg)`
    const sizeString = `scale(${shape.width}%, ${shape.height}%)`
    // Base 
    return `${posString} ${originApply} ${rotationString} ${originUndo} ${sizeString}`
}

function updateShape(shape, div)
{
    div.style.transform = getShapeTransform(shape)
    div.style.color = shape.color
    // div.style.transformOrigin = calcOrigin(shape)
}

function registerShape(div, _type) {
    const shape = {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        angle: 0,
        type: _type,
        color: "blue"
    }

    div.onmousedown = (ev) => {
        console.log("Dragging")
        const x = ev.clientX
        const y = ev.clientY

        DragStartX = x
        DragStartY = y

        xOffset = x - shape.x
        yOffset = y - shape.y
        dragging = shape;
        dragingDiv = div

        const pos = getDivPos(div)
        startingPos = pos
        const originalAngle = Math.atan2(
            y - pos.y, 
            x - pos.x) 
        / Math.PI * 180;

        startingAngle = (shape.angle || 0) - originalAngle;

        startingDrag = structuredClone(shape)

        // Line Distance
        const point = closestPointOnLine([pos.x, pos.y], dragging.angle, [x, y])
        XLineDistance = Math.sqrt(Math.pow(point[0]-pos.x, 2) + Math.pow(point[1]-pos.y, 2))

        switch (tool)
        {
            case "WidthUp":
                shape.width += 10
                updateShape(shape, div)
                break;
            case "WidthDown":
                shape.width -= 10
                updateShape(shape, div)
                break;
            case "HeightUp":
                shape.height += 10
                updateShape(shape, div)
                break;
            case "HeightDown":
                shape.height -= 10
                updateShape(shape, div)
                break;
            case "SetColor":
                const color = document.getElementById("ColorInput").value
                shape.color = color
                updateShape(shape, div)
        }
    }

    div.classList.add("shape")
    updateShape(shape, div)

    shapeDivs.push(div)

    activeShapes.push(shape)

    return shape
}

//#region shape Creation
function CreateTriangle() {
    const baseGroup = document.createElementNS(NSSvg, "g")
    const triangle = document.createElementNS(NSSvg, "path")

    triangle.setAttribute("d", trianglePath)
    triangle.classList.add("triangle")

    baseGroup.appendChild(triangle)

    const shape = registerShape(baseGroup, "Triangle");

    shapeContainer.appendChild(baseGroup)
}

function CreateSquare() {
    const baseGroup = document.createElementNS(NSSvg, "g")
    const square = document.createElementNS(NSSvg, "path")

    square.setAttribute("d", squarePath)
    square.classList.add("square")

    baseGroup.appendChild(square)

    const shape = registerShape(baseGroup, "Square");

    shapeContainer.appendChild(baseGroup)
}

function CreateHalfCircle() {
    const baseGroup = document.createElementNS(NSSvg, "g")
    const halfCircle = document.createElementNS(NSSvg, "path")

    halfCircle.setAttribute("d", halfCirclePath)
    halfCircle.classList.add("halfCircle")

    baseGroup.appendChild(halfCircle)

    const shape = registerShape(baseGroup, "HalfCircle");

    shapeContainer.appendChild(baseGroup)
}

// Buttons
document.getElementById("CreateTriangle").onclick = CreateTriangle
document.getElementById("CreateSquare").onclick = CreateSquare
document.getElementById("CreateHalfCircle").onclick = CreateHalfCircle

//#endregion

function UpdateTool(newTool)
{
    tool = newTool;
    document.getElementById("CurrentTool").innerHTML = newTool
}

document.getElementById("MoveTool").onclick   = () => UpdateTool("Move")
document.getElementById("RotateTool").onclick = () => UpdateTool("Rotate")
document.getElementById("WidthUpTool").onclick = () => UpdateTool("WidthUp")
document.getElementById("WidthDownTool").onclick = () => UpdateTool("WidthDown")
document.getElementById("HeightUpTool").onclick = () => UpdateTool("HeightUp")
document.getElementById("HeightDownTool").onclick = () => UpdateTool("HeightDown")
document.getElementById("SetColorTool").onclick = () => UpdateTool("SetColor")

document.onmousemove = (ev) => {
    const x = ev.clientX
    const y = ev.clientY

    const widthStuff = shapeContainer.clientWidth / 100

    if (dragging) {
        if (tool == "Move") {
            dragging.x = (x - xOffset)
            dragging.y = (y - yOffset)

            updateShape(dragging, dragingDiv)
        } else if (tool == "Rotate") {
            const angle = Math.atan2(y - startingPos.y, x - startingPos.x)
            dragging.angle = grid(startingAngle + angle / Math.PI * 180, 5)
            updateShape(dragging, dragingDiv)
        } else if (tool == "ScaleX") {
            // const pos = startingPos
            // const point = closestPointOnLine([pos.x, pos.y], dragging.angle, [x, y])
            // debugPoint(3, point[0], point[1])
            // const distance = Math.sqrt(Math.pow(point[0]-pos.x, 2) + Math.pow(point[1]-pos.y, 2))
            // console.log(distance, XLineDistance)
            // dragging.width = startingDrag.width + grid((distance-XLineDistance)/widthStuff*10, 10)
            // dragingDiv.style.scale= `${dragging.width}% ${dragging.height}%`

            // debugPoint(1, pos.x, pos.y)
            // debugPoint(2, x, y)
        }
    }
}

document.getElementById("SavePattern").onclick = () => {
    patterns.push(structuredClone(activeShapes))
}

function sectForShape(shape) {
    return `
    {   
        transform: ${getShapeTransform(shape)};
        color: ${shape.color};
    }
`
}

document.getElementById("Compile").onclick = () => {

    // Reorganizing data

    const shapes = []

    let shapeCount = 0
    for (let shapeIndex in patterns[0]) {
        const shape = patterns[0][shapeIndex]
        shapes.push({
            type: shape.type,
            sects: []
        })
        shapeCount++;
    }

    const patternCount = patterns.length
    const time = patternCount * (stallLength + TransitionLength)
    const sectionLength = 100 / patternCount
    const stallPercent = stallLength/(stallLength+TransitionLength) * sectionLength
    const TransitionPercent = TransitionLength/(stallLength+TransitionLength)  * sectionLength

    for (let patternIndex in patterns) {
        const pattern = patterns[patternIndex]
        for (let i = 0; i < shapeCount; i++) {
            shapes[i].sects.push(pattern[i])
        }
    }

    // Basic File Starters
    let svgFile = SVGStart
    let styleSheet = baseStyleSheet

    // Creating the middle bulk of files
    for (const shapeIndex in shapes) {
        // Importing the svg text
        const shape = shapes[shapeIndex]

        let currentPercent = 0

        let shapeSVG = ""
        switch(shape.type) {
            case "Triangle":
                shapeSVG = `
<g id="shape${shapeIndex}">
    <path class="TrianglePath" id="shapePath${shapeIndex}" d="${trianglePath}"></path>
</g>
`
                break;
            case "Square":
                shapeSVG = `
<g id="shape${shapeIndex}">
    <path class="SquarePath" id="shapePath${shapeIndex}" d="${squarePath}"></path>
</g>
`           
                break;
            case "HalfCircle":
                    shapeSVG = `
<g id="shape${shapeIndex}">
    <path class="HalfCirclePath" id="shapePath${shapeIndex}" d="${halfCirclePath}"></path>
</g>
`           
                    break;
        }
        svgFile += shapeSVG

        styleSheet += `
        @keyframes shape${shapeIndex}Anim {`
        styleSheet += `${currentPercent}% ${sectForShape(shape.sects[patternCount - 1])}\n`

        for (let i = 0; i < patternCount; i++) {
            styleSheet += `${currentPercent}% ${sectForShape(shape.sects[i])}`
            currentPercent += stallPercent
            styleSheet += `${currentPercent}% ${sectForShape(shape.sects[i])}`
            currentPercent += TransitionPercent
        }

        styleSheet += `100% ${sectForShape(shape.sects[0])}`

        styleSheet += `}`

        styleSheet += `
#shape${shapeIndex} {
    animation-name: shape${shapeIndex}Anim;
    animation-duration: ${time}s;
    animation-iteration-count: infinite;
}
`
        
    }

    // Ending files and displaying somehow
    svgFile += SVGEnd
    svgFile = svgFile.replace("/* Styles */", styleSheet)
    console.log(svgFile)

    // Displaying the compiled stuff
    svgFile = svgFile.replaceAll("&", "&amp").replaceAll("<", "&lt").replaceAll(">", "&gt")
    document.getElementById("compileDisplay").style.visibility = "visible"
    document.getElementById("compiledText").innerHTML = svgFile
}

function HidCompileDisplay()
{
    console.log("Test")
    document.getElementById("compileDisplay").style.visibility = "hidden"
}

document.getElementById("HideCompileDisplay").onclick = HidCompileDisplay

document.onmouseup = () => {
    dragging = null;
}
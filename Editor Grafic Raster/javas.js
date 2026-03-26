//STAREA GLOBALA 
const state = {
    currentTool: 'ellipse', //elementul selectat de a fi desenat.Default este elipsa,dar poate fi si dreptunghi sau linie 
    drawing: false,         //proprietate care ne arata daca se deseneaza sau nu   
    startX: 0,              //pozitia X de unde incepem sa desenam
    startY: 0,              //pozitia Y de unde incepem sa desenam
    shapes: [],             //lista cu toate formele desenate
    selectedShapeIndex: -1, //care forma este selectata in momentul de fata
    currentColor: '#000000', //culoarea curenta a formei
    currentLineWidth: 2,       //grosimea actuala
    backgroundColor: '#ffffff' //culoarea fundalului canvas
};

//ELEMENTE DIN PAGINA (DOM)
//Variabilele declarate aici,dar initializate mai jos in functia init()
let canvas, ctx;
let butonEllipse, butonRect, butonLine;
let colorInput, widthInput, bgInput;
let shapesList, propertiesPanel;
let propX, propY, propW, propH, propColor, propWidth, btnDelete;

//Initializare aici
function init() {
    //Iei elemenetele din pagina 
    canvas = document.getElementById('drawing-canvas');
    if (!canvas) {
        console.error("Nu am gasit elementul canvas!");
        return;
    }
    ctx = canvas.getContext('2d');

    butonEllipse = document.getElementById('buton-ellipse');
    butonRect = document.getElementById('buton-rect');
    butonLine = document.getElementById('buton-line');

    colorInput = document.getElementById('color-stroke');
    widthInput = document.getElementById('line-width');
    bgInput = document.getElementById('bg-color');

    shapesList = document.getElementById('shapes-list');
    propertiesPanel = document.getElementById('properties-panel');

    //proprietati
    propX = document.getElementById('prop-x');
    propY = document.getElementById('prop-y');
    propW = document.getElementById('prop-w');
    propH = document.getElementById('prop-h');
    propColor = document.getElementById('prop-color');
    propWidth = document.getElementById('prop-width');
    btnDelete = document.getElementById('buton-delete-shape');

    //se seteaza valorile initiale 
    if (colorInput) colorInput.value = state.currentColor;
    if (widthInput) widthInput.value = state.currentLineWidth;
    if (bgInput) bgInput.value = state.backgroundColor;


    setupEventListeners(); // leaga interactiunea mouseului cu butoanele si comenzile utilizatorului
    renderAll(); // deseneaza pe ecran sau pregateste canvasul
}

// redeseneaza tot canvasul de la 0
function renderAll(previewShape = null) { // previewShape = null inseamna o previz a formei cand alegi sa denezi si ti-o arata inainte sa salvezi
    if (!ctx) return; // daca canvasul nu s-a incarcat nu mai executa codul ptr a evita eventuale erori

    //punem culoarea de fundal si cureti canvasul
    ctx.fillStyle = state.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //deseneaza toate formele salvate
    state.shapes.forEach(shape => drawShape(shape));

    //deseneaza  forma pe care a selectat-o mouseul
    if (previewShape) {
        drawShape(previewShape);
    }
}

//deseneaza propriu-zis forma aleasa
function drawShape(shape) {
    ctx.beginPath();
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.lineWidth;

    if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
    }
    else if (shape.type === 'ellipse') {
        //deseneaza elipsa
        ctx.beginPath();
        //seteaza prorpietatile elipsei
        const radiusX = Math.abs(shape.w) / 2;
        const radiusY = Math.abs(shape.h) / 2;
        const centerX = shape.x + shape.w / 2;
        const centerY = shape.y + shape.h / 2;

        if (ctx.ellipse) {
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        } else {
            //daca se foloseste internet explorer(adica cv browser vechi)
            ctx.rect(shape.x, shape.y, shape.w, shape.h);
        }
        ctx.stroke();
    }
    else if (shape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.w, shape.h);
        ctx.stroke();
    }
}


function setupEventListeners() {
    //selectare elemente (verifica daca exista butoanele)
    const buttons = [butonEllipse, butonRect, butonLine];
    buttons.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            //actualizare interfata
            if (document.querySelectorAll) {
                document.querySelectorAll('.buton-tool').forEach(b => b.classList.remove('active'));
            }
            btn.classList.add('active');

            state.currentTool = btn.dataset.tool;
            state.selectedShapeIndex = -1;
            updatePropertiesPanel();
            renderAll();
        });
    });

    //acualizari setari
    if (colorInput) colorInput.addEventListener('input', (e) => state.currentColor = e.target.value);
    if (widthInput) widthInput.addEventListener('input', (e) => state.currentLineWidth = parseInt(e.target.value, 10));
    if (bgInput) bgInput.addEventListener('input', (e) => {
        state.backgroundColor = e.target.value;
        renderAll();
    });

    //evenimentele de mouse
    if (canvas) {
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
    }

    //proprietatule formei selectate
    const props = [propX, propY, propW, propH, propColor, propWidth];
    props.forEach(input => {
        if (input) input.addEventListener('input', updateSelectedShapeFromInputs);
    });

    if (btnDelete) btnDelete.addEventListener('click', deleteSelectedShape);

    //butoanele pentru export
    const btnExRaster = document.getElementById('buton-export-raster');
    const btnExSvg = document.getElementById('buton-export-svg');
    if (btnExRaster) btnExRaster.addEventListener('click', exportRaster);
    if (btnExSvg) btnExSvg.addEventListener('click', exportSVG);
}

//GESTIONARE MOUSE

function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    state.startX = e.clientX - rect.left;
    state.startY = e.clientY - rect.top;
    state.drawing = true;
}

function onMouseMove(e) {
    if (!state.drawing) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - state.startX;
    const height = currentY - state.startY;

    //construieste o forma petru previzualizare (temporara)
    const previewShape = {
        type: state.currentTool,
        x: state.startX,
        y: state.startY,
        w: state.currentTool === 'line' ? currentX : width,
        h: state.currentTool === 'line' ? currentY : height,
        color: state.currentColor,
        lineWidth: state.currentLineWidth
    };

    renderAll(previewShape);
}

function onMouseUp(e) {
    if (!state.drawing) return;
    state.drawing = false;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - state.startX;
    const height = currentY - state.startY;

    //ignora clickurile accidentale
    if (Math.abs(width) < 2 && Math.abs(height) < 2 && state.currentTool !== 'line') {
        renderAll();
        return;
    }

    const newShape = {
        id: Date.now(),
        type: state.currentTool,
        x: state.startX,
        y: state.startY,
        w: state.currentTool === 'line' ? currentX : width,
        h: state.currentTool === 'line' ? currentY : height,
        color: state.currentColor,
        lineWidth: state.currentLineWidth
    };

    state.shapes.push(newShape);
    addShapeToList(newShape, state.shapes.length - 1);
    renderAll();
}



function addShapeToList(shape, index) {
    if (!shapesList) return;
    const div = document.createElement('div');
    div.className = 'shape-item';
    div.dataset.index = index;
    div.innerHTML = `<span>${getShapeName(shape.type)} #${index + 1}</span>`;

    div.addEventListener('click', () => selectShape(index));
    shapesList.appendChild(div);
}

function refreshShapesList() {
    if (!shapesList) return;
    shapesList.innerHTML = '';
    state.shapes.forEach((shape, idx) => addShapeToList(shape, idx));
}

function getShapeName(type) {
    switch (type) {
        case 'ellipse': return 'Elipsa';
        case 'rectangle': return 'Dreptunghi';
        case 'line': return 'Linie';
        default: return 'Forma';
    }
}

function selectShape(index) {
    state.selectedShapeIndex = index;
    const shape = state.shapes[index];

    //evidentiere forma aleasa
    document.querySelectorAll('.shape-item').forEach(item => {
        item.classList.toggle('selected', parseInt(item.dataset.index) === index);
    });

    //populare forimular
    if (propX) propX.value = shape.x;
    if (propY) propY.value = shape.y;
    if (propW) propW.value = shape.w;
    if (propH) propH.value = shape.h;
    if (propColor) propColor.value = shape.color;
    if (propWidth) propWidth.value = shape.lineWidth;

    //Afiseaza panoul cu proprietati
    if (propertiesPanel) propertiesPanel.classList.remove('hidden');
}

//actualizeaza forma selectata
function updateSelectedShapeFromInputs() {
    if (state.selectedShapeIndex === -1) return;

    const shape = state.shapes[state.selectedShapeIndex];
    if (propX) shape.x = parseFloat(propX.value);
    if (propY) shape.y = parseFloat(propY.value);
    if (propW) shape.w = parseFloat(propW.value);
    if (propH) shape.h = parseFloat(propH.value);
    if (propColor) shape.color = propColor.value;
    if (propWidth) shape.lineWidth = parseInt(propWidth.value, 10);

    renderAll();
}

//sterge forma selectata
function deleteSelectedShape() {
    if (state.selectedShapeIndex === -1) return;

    state.shapes.splice(state.selectedShapeIndex, 1);
    state.selectedShapeIndex = -1;
    updatePropertiesPanel();
    refreshShapesList();
    renderAll();
}

//curata interfata daca nu sunt forme selectate si ascunde panoul de setari
function updatePropertiesPanel() {
    if (state.selectedShapeIndex === -1 && propertiesPanel) {
        propertiesPanel.classList.add('hidden');
        document.querySelectorAll('.shape-item').forEach(i => i.classList.remove('selected'));
    }
}

//exporta imaginea ca PNG
function exportRaster() {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'desen.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function exportSVG() {
    const svgContent = generateSVG();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'desen.svg';
    link.href = url;
    link.click();
}


//Genereaza codul SVG din lista de forme
function generateSVG() {
    let shapesSVG = '';

    for (const s of state.shapes) {
        if (s.type === 'rectangle') {
            shapesSVG += `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" 
                stroke="${s.color}" stroke-width="${s.lineWidth}" fill="none"/>`;
        }
        else if (s.type === 'ellipse') {
            const rx = Math.abs(s.w) / 2;
            const ry = Math.abs(s.h) / 2;
            const cx = s.x + s.w / 2;
            const cy = s.y + s.h / 2;
            shapesSVG += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" 
                stroke="${s.color}" stroke-width="${s.lineWidth}" fill="none"/>`;
        }
        else if (s.type === 'line') {
            shapesSVG += `<line x1="${s.x}" y1="${s.y}" x2="${s.w}" y2="${s.h}" 
                stroke="${s.color}" stroke-width="${s.lineWidth}"/>`;
        }
    }

    return `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${state.backgroundColor}"/>
        ${shapesSVG}
    </svg>`;
}

//porneste aplicatia dupa ce se incarca fereastra
window.onload = init;

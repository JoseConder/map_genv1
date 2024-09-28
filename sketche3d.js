let cols, rows;
let scl = 20; // Escala de cada celda del terreno
let w = 2000; // Ancho del terreno
let h = 2000; // Alto del terreno

let terrain = [];

let flying = 0;

function setup() {
  createCanvas(800, 600, WEBGL); // Activar el modo 3D

  cols = w / scl;
  rows = h / scl;

  // Inicializar el array para el terreno
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0; // Inicializamos las alturas a 0
    }
  }
}

function draw() {
  flying -= 0.1; // Esto mueve el terreno hacia adelante en el eje Z

  let yOff = flying;
  for (let y = 0; y < rows; y++) {
    let xOff = 0;
    for (let x = 0; x < cols; x++) {
      terrain[x][y] = map(noise(xOff, yOff), 0, 1, -100, 100); // Generar la altura
      xOff += 0.1; // Controlar la frecuencia del ruido Perlin
    }
    yOff += 0.1;
  }

  background(135, 206, 250); // Color de fondo cielo
  noFill();
  noStroke(); 

  // Controlar la cámara
  rotateX(PI / 3);
  translate(-w / 2, -h / 2);

  // Dibujar el terreno
  for (let y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP); 
    for (let x = 0; x < cols; x++) {
      fill(terrainColor(terrain[x][y])); // Asignar color dependiendo de la altura
      vertex(x * scl, y * scl, terrain[x][y]); // Vértice de la malla
      fill(terrainColor(terrain[x][y + 1]));
      vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]); // Vértice adyacente
    }
    endShape();
  }
}

function terrainColor(height) {
  // Definir colores basados en la altura
  if (height < -50) {
    return color(30, 144, 255); // Agua
  } else if (height < 0) {
    return color(240, 230, 140); // Arena
  } else if (height < 50) {
    return color(34, 139, 34); // Pasto
  } else if (height < 80) {
    return color(139, 69, 19); // Montañas
  } else {
    return color(255); // Nieve
  }
}
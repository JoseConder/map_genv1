let cols, rows;
let scale = 20; // Escala de cada celda del terreno
let w = 2000; // Ancho del terreno
let h = 2000; // Alto del terreno
let terrain = [];
let flying = 0;

function setup() {
  createCanvas(1920, 1080, WEBGL); // Activar el modo 3D
  cols = w / scale;
  rows = h / scale;

  // Inicializar el array para el terreno
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0; // Inicializamos las alturas a 0
    }
  }
}

function draw() {
  flying -= 0.1; // Mueve el terreno hacia adelante en el eje Z

  let yOff = flying;
  for (let y = 0; y < rows; y++) {
    let xOff = 0;
    for (let x = 0; x < cols; x++) {
      let baseHeight = map(noise(xOff, yOff), 0, 1, -100, 100); // Generar la altura base
      let variation = map(noise(xOff + 100, yOff), 0, 1, -10, 10); // Variación adicional
      terrain[x][y] = baseHeight + variation; // Altura total
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
    beginShape(TRIANGLE_STRIP); // O puedes cambiar a TRIANGLES
    for (let x = 0; x < cols; x++) {
      fill(terrainColor(terrain[x][y])); // Asignar color dependiendo de la altura
      vertex(x * scale, y * scale, terrain[x][y]); // Vértice de la malla
      fill(terrainColor(terrain[x][y + 1]));
      vertex(x * scale, (y + 1) * scale, terrain[x][y + 1]); // Vértice adyacente
    }
    endShape();
  }
}

function terrainColor(height) {
  // Definir colores y variaciones basados en la altura
  if (height < -50) {
    return color(random(0, 50), random(50, 150), 255); // Agua con variaciones de azul
  } else if (height < 0) {
    return color(random(200, 255), random(200, 240), 150); // Arena con variaciones de color
  } else if (height < 50) {
    return color(34, random(120, 160), 34); // Pasto con variaciones de verde
  } else if (height < 80) {
    return color(random(150, 180), random(50, 70), 20); // Montañas con variaciones marrón
  } else {
    return color(255); // Nieve
  }
}

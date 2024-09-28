class TerrainType {
    constructor(minHeight, maxHeight, minColor, maxColor, lerpAdjustment = 0) {
      this.minHeight = minHeight;  // Altura mínima
      this.maxHeight = maxHeight;  // Altura máxima
      this.minColor = minColor;    // Color mínimo
      this.maxColor = maxColor;    // Color máximo
      // Un ajuste para la interpolación de color para el tipo de mapa, esto pesa el color
      // hacia el color mínimo o máximo.
      this.lerpAdjustment = lerpAdjustment;
    }
  }
  
  let waterTerrain;  // Terreno de agua
  let sandTerrain;   // Terreno de arena
  let grassTerrain;  // Terreno de pasto
  let treesTerrain;  // Terreno de árboles
  let mountainTerrain; // Terreno de montaña
  let snowTerrain;   // Terreno de nieve
  
  let zoomFactor = 100;  // Factor de zoom
  let mapChanged = true; // Indica si el mapa ha cambiado
  // El desplazamiento x e y necesitan ser grandes porque el ruido de Perlin se refleja alrededor de 0.
  let xOffset = 10000;
  let yOffset = 10000;
  const cameraSpeed = 10; // Velocidad de la cámara
  
  function setup() {
    createCanvas(1920, 1080);
  
    // Ajusta el nivel de detalle creado por el ruido de Perlin al superponer
    // múltiples versiones de él.
    noiseDetail(9, 0.5);
  
    // El ruido de Perlin rara vez va por debajo de 0.2, así que se asume que el mínimo es 0.2 y no
    // 0 para que los colores estén más distribuidos uniformemente. De lo contrario, hay 
    // poca agua profunda representada. Esto es lo mismo para establecer el máximo para 
    // 'árboles' a 0.75: el ruido rara vez supera 0.8 y los colores de los árboles lucen 
    // mejor asumiendo 0.75 como el máximo.
    waterTerrain =
      new TerrainType(0.2, 0.4, color(30, 176, 251), color(40, 255, 255));
    sandTerrain =
      new TerrainType(0.4, 0.5, color(215, 192, 158), color(255, 246, 193), 0.3);
    grassTerrain =
      new TerrainType(0.5, 0.7, color(2, 166, 155), color(118, 239, 124));
    treesTerrain =
      new TerrainType(0.7, 0.75, color(22, 181, 141), color(10, 145, 113), -0.5);
    mountainTerrain = 
      new TerrainType(0.75, 0.9, color(120, 120, 120), color(160, 160, 160)); 
    snowTerrain = 
      new TerrainType(0.9, 1.0, color(220, 220, 220), color(255, 255, 255)); 
  
    initializeChunks(); // Inicializa los chunks
  }
  
  function getTerrainColor(noiseValue, mapType) {
    // Dado un valor de ruido, normaliza para estar entre 0 y 1 representando qué tan
    // cerca está de la altura mínima o máxima para el tipo de terreno dado.
    const normalized =
      normalize(noiseValue, mapType.maxHeight, mapType.minHeight);
    // Mezcla entre los colores de altura mínima y máxima basado en el valor de ruido normalizado.
    return lerpColor(mapType.minColor, mapType.maxColor,
      normalized + mapType.lerpAdjustment);
  }
  
  // Devuelve un número entre 0 y 1 entre el máximo y mínimo basado en el valor.
  function normalize(value, max, min) {
    if (value > max) {
      return 1;
    }
    if (value < min) {
      return 0;
    }
    return (value - min) / (max - min);
  }
  
  function mouseWheel(event) {
    zoomFactor -= event.delta / 10; // Ajusta el factor de zoom según la rueda del ratón
    // Establece el factor de zoom mínimo a 10 para que el mapa se mantenga algo reconocible.
    zoomFactor = Math.max(10, zoomFactor);
    mapChanged = true; // Marca el mapa como cambiado
    regenerateChunks(); // Regenera los chunks
  }
  
  let chunkSize = 100; // Tamaño de cada sección
  let chunks = []; // Array de chunks
  let visibleChunks = []; // Chunks visibles
  
  function initializeChunks() {
    for (let x = -chunkSize; x < width + chunkSize; x += chunkSize) {
      for (let y = -chunkSize; y < height + chunkSize; y += chunkSize) {
        let chunk = {
          x: x,
          y: y,
          pixels: createGraphics(chunkSize, chunkSize) // Guardar los píxeles en un gráfico aparte
        };
        generateChunk(chunk); // Generar el chunk
        chunks.push(chunk); // Añadir el chunk al array de chunks
      }
    }
  }
  
  function generateChunk(chunk) {
    for (let x = 0; x < chunkSize; x++) {
      for (let y = 0; y < chunkSize; y++) {
        let xVal = (chunk.x + x - width / 2) / zoomFactor + xOffset;
        let yVal = (chunk.y + y - height / 2) / zoomFactor + yOffset;
        let noiseValue = noise(xVal, yVal); // Obtener el valor de ruido
  
        let terrainColor;
        if (noiseValue < waterTerrain.maxHeight) {
          terrainColor = getTerrainColor(noiseValue, waterTerrain);
        } else if (noiseValue < sandTerrain.maxHeight) {
          terrainColor = getTerrainColor(noiseValue, sandTerrain);
        } else if (noiseValue < grassTerrain.maxHeight) {
          terrainColor = getTerrainColor(noiseValue, grassTerrain);
        } else if (noiseValue < treesTerrain.maxHeight) {
          terrainColor = getTerrainColor(noiseValue, treesTerrain);
        } else if (noiseValue < mountainTerrain.maxHeight) {
          terrainColor = getTerrainColor(noiseValue, mountainTerrain);
        } else if (noiseValue < snowTerrain.maxHeight) {
          terrainColor = getTerrainColor(noiseValue, snowTerrain);
        } else {
          terrainColor = getTerrainColor(noiseValue, treesTerrain); // Color por defecto
        }
        chunk.pixels.set(x, y, terrainColor); // Establecer el color del píxel
      }
    }
    chunk.pixels.updatePixels(); // Aplicar los píxeles generados
  }
  
  function regenerateChunks() {
    for (let chunk of chunks) {
      generateChunk(chunk); // Recalcular los chunks con el nuevo zoom
    }
  }
  
  function draw() {
    if (keyIsDown(RIGHT_ARROW)) {
      xOffset += 1 / zoomFactor * cameraSpeed; // Mover la cámara a la derecha
      mapChanged = true; // Marcar el mapa como cambiado
    }
    if (keyIsDown(LEFT_ARROW)) {
      xOffset -= 1 / zoomFactor * cameraSpeed; // Mover la cámara a la izquierda
      mapChanged = true; // Marcar el mapa como cambiado
    }
    if (keyIsDown(UP_ARROW)) {
      yOffset -= 1 / zoomFactor * cameraSpeed; // Mover la cámara hacia arriba
      mapChanged = true; // Marcar el mapa como cambiado
    }
    if (keyIsDown(DOWN_ARROW)) {
      yOffset += 1 / zoomFactor * cameraSpeed; // Mover la cámara hacia abajo
      mapChanged = true; // Marcar el mapa como cambiado
    }
  
    if (mapChanged) {
      visibleChunks = getVisibleChunks(); // Obtener los chunks visibles
      background(255); // Limpiar la pantalla con blanco
  
      for (let chunk of visibleChunks) {
        image(chunk.pixels, chunk.x, chunk.y); // Mostrar los chunks visibles
      }
  
      mapChanged = false; // Restablecer la marca de cambio
    }
  }
  
  function getVisibleChunks() {
    let visibleChunks = [];
    for (let chunk of chunks) {
      // Comprobar si el chunk está dentro de la vista
      if (chunk.x + chunkSize > 0 && chunk.x < width && chunk.y + chunkSize > 0 && chunk.y < height) {
        visibleChunks.push(chunk); // Añadir el chunk visible
      }
    }
    return visibleChunks; // Devolver los chunks visibles
  }
  
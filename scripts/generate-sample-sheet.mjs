import * as XLSX from 'xlsx';
import * as path from 'path';

// Definir los datos de ejemplo con todos los campos en Castellano (excepto imágenes)
const sampleData = [
  {
    Nombre: "Remera Oversize Algodón",
    Marca: "Glamours",
    Categoría: "Remeras",
    Género: "unisex",
    Precio: 18500,
    "Precio Anterior": 22000,
    Descripción: "Remera oversize confeccionada en algodón 100% peinado. Súper cómoda y fresca.",
    "Imagen URL": "",
    Material: "Algodón 100%",
    Etiquetas: "remera, oversize, algodon, basico",
    Sección: "general",
    Estado: "activo",
    Colores: "Negro, Blanco, Gris Melange",
    XS: 5,
    S: 12,
    M: 20,
    L: 15,
    XL: 8,
    XXL: 2
  },
  {
    Nombre: "Jeans Slim Fit Elastizado",
    Marca: "Levis",
    Categoría: "Jeans",
    Género: "hombre",
    Precio: 35000,
    "Precio Anterior": 0,
    Descripción: "Jeans corte slim fit con elastano para mayor comodidad. Lavado medio.",
    "Imagen URL": "",
    Material: "Denim elastizado",
    Etiquetas: "jeans, slim, denim, clasico",
    Sección: "nueva-coleccion",
    Estado: "activo",
    Colores: "Azul Localizado, Celeste",
    XS: 0,
    S: 10,
    M: 15,
    L: 15,
    XL: 5,
    XXL: 0
  },
  {
    Nombre: "Sweater Hilo Cuello Redondo",
    Marca: "Glamours",
    Categoría: "Sweaters",
    Género: "mujer",
    Precio: 24000,
    "Precio Anterior": 29900,
    Descripción: "Sweater tejido en hilo de algodón premium, ideal para media estación.",
    "Imagen URL": "",
    Material: "Hilo de algodón",
    Etiquetas: "sweater, tejido, invierno, abrigo",
    Sección: "ofertas",
    Estado: "activo",
    Colores: "Beige, Terracota, Verde Seco",
    XS: 2,
    S: 5,
    M: 10,
    L: 8,
    XL: 4,
    XXL: 0
  }
];

// Crear la hoja de trabajo
const ws = XLSX.utils.json_to_sheet(sampleData);

// Crear el libro de trabajo (workbook)
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Productos");

// Definir el destino del archivo en public
const destPath = path.resolve('public', 'planilla_ejemplo.xlsx');

// Escribir el archivo
XLSX.writeFile(wb, destPath);

console.log(`Planilla de ejemplo creada exitosamente en: ${destPath}`);

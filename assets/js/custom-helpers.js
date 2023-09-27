// Función para obtener el color claro u oscuro
function getBrightness(hex) {
    const red = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue = parseInt(hex.slice(5, 7), 16);
    return (red + green + blue) / 3; // Promedio de los componentes RGB
}

// Función para convertir un color a formato hexadecimal
function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Función washed-color
Handlebars.registerHelper('washed-color', function(hexcode) {
    const brightness = getBrightness(hexcode);
    const threshold = 128; // 256 / 2 (considerando el rango de 0 a 255)

    let newBrightness;
    if (brightness < threshold) {
        // Color oscuro, hazlo claro un 20%
        newBrightness = Math.min(brightness + threshold * 0.2, 255);
    } else {
        // Color claro, hazlo oscuro un 20%
        newBrightness = Math.max(brightness - threshold * 0.2, 0);
    }

    // Obtener los componentes RGB del nuevo color
    const newHex = rgbToHex(newBrightness, newBrightness, newBrightness);
    return newHex;
});

// Función intense-color
Handlebars.registerHelper('intense-color', function(hexcode) {
    const brightness = getBrightness(hexcode);
    const threshold = 128; // 256 / 2 (considerando el rango de 0 a 255)

    let newBrightness;
    if (brightness < threshold) {
        // Color claro, hazlo claro un 20%
        newBrightness = Math.min(brightness + threshold * 0.2, 255);
    } else {
        // Color oscuro, hazlo oscuro un 20%
        newBrightness = Math.max(brightness - threshold * 0.2, 0);
    }

    // Obtener los componentes RGB del nuevo color
    const newHex = rgbToHex(newBrightness, newBrightness, newBrightness);
    return newHex;
});

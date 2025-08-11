function calculateIndex(str) {
    str = str.toLowerCase();
    var r = parseInt(str.substring(0,2), 16);
    var g = parseInt(str.substring(2,4), 16);
    var b = parseInt(str.substring(4), 16);
    var a = 255;
    return (3*r + 5*g + 7*b + 11*a) % 64;
}

function toHex(n) {
    var s = n.toString(16);
    return s.length == 1 ? '0' + s : s;
}

function isValidColor(input) {
    return input.value != '' && input.checkValidity();
}

function resetState() {
    var inputs = document.querySelectorAll('.row > input');
    inputs.forEach(function(input) {
        input.value = '';
        input.dataset.valid = '';
    });

    var cells = document.querySelectorAll('.cell');
    cells.forEach(function(cell) {
        cell.style.backgroundColor = '';
    });

    cacheColors = Array(64).fill([]);
}

function generatePalette() {
    var str = 'GIMP Palette\n';
    var inputs = document.querySelectorAll('.row > input');
    inputs.forEach(function(input) {
        var hex = input.dataset.valid;
        if (hex != '') {
            var r = parseInt(hex.substring(0,2), 16);
            var g = parseInt(hex.substring(2,4), 16);
            var b = parseInt(hex.substring(4), 16);
            str += r + ' ' + g + ' ' + b + ' ' + hex + '\n';
        }
    });
    return str;
}

function parsePalette(str) {
    var colors = [];
    var lines = str.split('\n');
    if (lines[0] != 'GIMP Palette') {
        return undefined;
    } else {
        lines.shift();
    }
    for (var line of lines) {
        if (line == '' || line[0] == '#') {
            continue;
        }
        components = line.split(' ');
        if (components.length < 3) {
            return undefined;
        }
        colors.push(toHex(parseInt(components[0])) + toHex(parseInt(components[1])) + toHex(parseInt(components[2])));
    }
    return colors;
}

var cacheColors = Array(64).fill([]);

window.onload = function() {
    resetState();

    document.querySelector('#exportButton').addEventListener('click', function() {
        var paletteContent = generatePalette();
        const blob = new Blob([paletteContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'palette.gpl';
        link.click();
        URL.revokeObjectURL(link.href);
    })

    document.querySelector('#importButton').addEventListener('click', function() {
        document.querySelector('#paletteFile').click();
    });

    document.querySelector('#paletteFile').addEventListener('change', async function(e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var text = e.target.result;
            var colors = parsePalette(text);
            if (colors != undefined) {
                var j = 0;
                resetState();
                for (var color of colors) {
                    var input = document.querySelector('#inputPanel > :nth-child(' + (Math.floor(j/8)+1) + ') > :nth-child(' + (j%8+1)  + ') > input');
                    input.value = color;
                    j++;
                    input.dispatchEvent(new InputEvent('input'));
                }
            } else {
                console.log('Failed loading palette!');
            }
        };
        reader.readAsText(file);
    });

    document.querySelector('#analyzeImageButton').addEventListener('click', function() {
        document.querySelector('#imageFile').click();
    });

    document.querySelector('#imageFile').addEventListener('change', async function(e) {
        var file = e.target.files[0];
        var bitmap = await createImageBitmap(file);
        var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        var imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
        var pixels = imageData.data;

        var colorCount = 0;
        var colors = {};

        for (var i = 0; i < pixels.length/4; i += 4) {
            var hex = toHex(pixels[i]) + toHex(pixels[i+1]) + toHex(pixels[i+2]);
            if (hex in colors) {
                colors[hex]++;
            } else {
                colors[hex] = 1;
                colorCount++;
            }
            if (colorCount > 64) {
                break;
            }
        }
        console.log(colors);
        if (colorCount > 64) {
            alert('Pallete is too big!');
        } else {
            var j = 0;
            resetState();
            for (var color in colors) {
                var input = document.querySelector('#inputPanel > :nth-child(' + (Math.floor(j/8)+1) + ') > :nth-child(' + (j%8+1)  + ') > input');
                input.value = color;
                j++;
                input.dispatchEvent(new InputEvent('input'));
            }
        }
    });

    var inputs = document.querySelectorAll('.row > input');
    inputs.forEach(function(input) {
        input.addEventListener('input', function(e) {
            if (isValidColor(this)) {
                var index = calculateIndex(this.value);
                document.querySelector('#cache :nth-child(' + index +')').style.backgroundColor = '#' + this.value;
                this.dataset.valid = this.value;
                cacheColors[index].push(this.value);
            } else {
                if (this.dataset.valid != "") {
                    var index = calculateIndex(this.dataset.valid);
                    document.querySelector('#cache :nth-child(' + index +')').style.backgroundColor = '';
                    var colorPos = cacheColors[index].indexOf(this.dataset.valid);
                    if (colorPos != -1) {
                        cacheColors[index].splice(colorPos, 1);
                        if (cacheColors[index].length > 0) {
                            document.querySelector('#cache :nth-child(' + index +')').style.backgroundColor = '#' + cacheColors[index][cacheColors[index].length - 1];
                        }
                    }
                    this.dataset.valid = '';
                }
            }
            if (index != undefined) {
                console.log(cacheColors[index].length);
            }
        });
    });

    document.querySelector('#resetButton').addEventListener('click', resetState);
};
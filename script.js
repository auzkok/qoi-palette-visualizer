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

var cacheColors = Array(64).fill([]);

window.onload = function() {
    resetState();

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
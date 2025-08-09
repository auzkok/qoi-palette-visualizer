

function calculateIndex(str) {
    str = str.toLowerCase();
    var r = parseInt(str.substring(0,2), 16);
    var g = parseInt(str.substring(2,4), 16);
    var b = parseInt(str.substring(4), 16);
    var a = 255;
    return (3*r + 5*g + 7*b + 11*a) % 64;
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
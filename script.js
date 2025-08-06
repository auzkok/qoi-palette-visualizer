

function calculateIndex(str) {
    str = str.toLowerCase();
    var r = parseInt(str.substring(0,2), 16);
    var g = parseInt(str.substring(2,4), 16);
    var b = parseInt(str.substring(4), 16);
    var a = 255;
    return (3*r + 5*g + 7*b + 11*a) % 64;
}

window.onload = function() {
    var inputs = document.querySelectorAll('.row > input');
    inputs.forEach(function(input) {
        input.addEventListener('input', function(e) {
            if (this.checkValidity()) {
                document.querySelector('#cache :nth-child(' + calculateIndex(this.value) +')').style.backgroundColor = '#' + this.value;
                this.dataset.valid = this.value;
            } else {
                if (this.dataset.valid != "") {
                    document.querySelector('#cache :nth-child(' + calculateIndex(this.dataset.valid) +')').style.backgroundColor = '';
                    this.dataset.valid = '';
                }
            }
        });
    })
};
const uri = "http://localhost:3000/login";
const login = document.getElementById('login');

login.addEventListener('click', e => {
    e.preventDefault();
});

function enviar() {
    senha = document.getElementById('pin').value;
    fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senha: senha }),
    })
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                alert('Senha incorreta');
                remove();
            }
        })
        .then(data => {
            if (data) {
                window.localStorage.setItem("usertechman", JSON.stringify(data));
                window.location.href = './home.html';
                remove();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function add(value) {
    var mascara = document.getElementById('mascara');
    var pin = document.getElementById('pin');
    mascara.value += value;
    setTimeout(() => {
        mascara.value = mascara.value.slice(0, -1);
        mascara.value += '*';
    }, 100);
    pin.value += value;
    //Veirificar se o pin tem 6 digitos e habilitar o botão de enviar
    if (pin.value.length == 6) {
        document.getElementById('send').disabled = false;
    }
}

function remove() {
    var mascara = document.getElementById('mascara');
    var pin = document.getElementById('pin');
    mascara.value = '';
    pin.value = '';
    document.getElementById('send').disabled = true;
}
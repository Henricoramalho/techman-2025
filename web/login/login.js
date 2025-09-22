        const inputDisplay = document.getElementById('inputDisplay');
        let enteredDigits = [];

        function updateDisplay() {
            if (enteredDigits.length === 0) {
                inputDisplay.textContent = '';
                return;
            }
            let masked = '*'.repeat(enteredDigits.length - 1);
            inputDisplay.textContent = masked + enteredDigits[enteredDigits.length - 1];
        }

        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => {
                const key = button.getAttribute('data-key');
                if (key !== null) {
                    if (enteredDigits.length < 6) {
                        enteredDigits.push(key);
                        updateDisplay();
                    }
                }
            });
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            enteredDigits = [];
            inputDisplay.textContent = '';
        });

        document.getElementById('enterBtn').addEventListener('click', () => {
            if (enteredDigits.length === 0) {
                alert('Nenhum número digitado!');
                return;
            }
            const senhaDigitada = enteredDigits.join('');

            fetch('http://localhost:3000/usuario')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na requisição: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    const usuario = data.find(u => u.senha === senhaDigitada);

                    if (usuario) {
                        alert('Senha correta! Bem vindo ');
                        window.location.href = '../dashboard/dashboard.html';
                    } else {
                        alert('Senha incorreta.');
                    }

                    enteredDigits = [];
                    updateDisplay();
                })
                .catch(error => {
                    console.error('Erro ao buscar usuários:', error);
                    alert('Erro na validação, tente novamente.');
                });
        });
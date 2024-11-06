function atualizarResultado(result) {
    fetch('/game-result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ result })
    }).then(response => response.json())
      .then(data => {
          console.log('Resultado registrado no backend');
          // Atualizar interface com as vitórias e derrotas
          // Exemplo: fetch para obter estatísticas atualizadas
          fetch('/user-stats', {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
          }).then(response => response.json())
            .then(stats => {
                document.getElementById('victories').textContent = stats.victories;
                document.getElementById('defeats').textContent = stats.defeats;
            });
      });


    // Lógica do jogo (Pedra, Papel, Tesoura)
    const rockCard = document.getElementById("Rock");
    const paperCard = document.getElementById("Throw");
    const scissorsCard = document.getElementById("Scissors");
    const monster = document.getElementById("monster");

    rockCard.addEventListener("click", function () {
        play("rock");
    });
    paperCard.addEventListener("click", function () {
        play("paper");
    });
    scissorsCard.addEventListener("click", function () {
        play("scissors");
    });

    function play(choose) {
        animation(choose);

        setTimeout(function () {
            const escolhaComputador = computadorEscolha();
            determinarVencedor(choose, escolhaComputador);
        }, 5000);
    }

    function animation(choose) {
        // Aqui você pode manter a animação de carta que já estava no seu código
    }

    function computadorEscolha() {
        const escolhas = ["rock", "paper", "scissors"];
        const randomIndex = Math.floor(Math.random() * escolhas.length);
        return escolhas[randomIndex];
    }

    function determinarVencedor(jogador, computador) {
        let resultado = "";

        if (jogador === computador) {
            resultado = "Empate!";
        } else if (
            (jogador === "rock" && computador === "scissors") ||
            (jogador === "paper" && computador === "rock") ||
            (jogador === "scissors" && computador === "paper")
        ) {
            resultado = "Você ganhou!";
            // Atualizar vitórias no backend
            atualizarResultado("win");
        } else {
            resultado = "Você perdeu!";
            // Atualizar derrotas no backend
            atualizarResultado("lose");
        }

        console.log(resultado);
    }

    // Função para atualizar o resultado da partida no backend
    function atualizarResultado(result) {
        fetch('/game-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ result })
        }).then(response => response.json())
          .then(data => {
              console.log('Resultado registrado no backend');
          });
    }
};

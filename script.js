const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

        // Configurações do jogo
        const sheep = {
            x: 50,
            y: 240,
            width: 40,
            height: 40,
            gravity: 0.6,
            lift: -15,
            velocity: 0,
            isJumping: false
        };

        // Remover configurações do sol
        const fences = [];
        const FENCE_WIDTH = 8;
        const MIN_FENCE_GAP = 180;
        const MAX_FENCE_GAP = 300;
        let score = 0;
        let gameOver = false;
        let gameSpeed = 2;

        // Configurações das nuvens e sol
        const clouds = [
            { x: 80, y: 40, width: 90, height: 45 },    // Primeira nuvem ajustada
            { x: 220, y: 30, width: 100, height: 50 },  // Segunda nuvem ajustada
            { x: 380, y: 45, width: 85, height: 40 }    // Terceira nuvem ajustada
        ];
        
        const sun = {
            x: 170,          // Posicionado entre a primeira e segunda nuvem
            y: 50,           // Altura ajustada para ficar entre as nuvens
            radius: 18       
        };

        // Função para calcular a velocidade baseada no score
        function calculateGameSpeed() {
            return gameSpeed + (score * 0.1);
        }

        // Função para gerar distância aleatória entre cercas
        function getRandomFenceGap() {
            const bonusGap = score * 5;
            const minGap = MIN_FENCE_GAP + bonusGap;
            const maxGap = MAX_FENCE_GAP + bonusGap;
            return Math.random() * (maxGap - minGap) + minGap;
        }

        // Criar cerca
        function createFence() {
            fences.push({
                x: canvas.width,
                width: FENCE_WIDTH,
                height: 100,
                passed: false
            });
        }

        // Desenhar ovelha
        function drawSheep() {
            // Corpo principal (lã)
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(sheep.x + 20, sheep.y + 20, 20, 0, Math.PI * 2);
            ctx.fill();

            // Cabeça
            ctx.fillStyle = '#FFE4C4'; // Bege claro
            ctx.beginPath();
            ctx.arc(sheep.x + 35, sheep.y + 15, 12, 0, Math.PI * 2);
            ctx.fill();

            // Orelhas
            ctx.fillStyle = '#FFE4C4';
            ctx.beginPath();
            ctx.ellipse(sheep.x + 35, sheep.y + 5, 5, 8, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            // Olho
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(sheep.x + 38, sheep.y + 12, 2, 0, Math.PI * 2);
            ctx.fill();

            // Pernas
            ctx.fillStyle = '#8B4513'; // Marrom escuro
            // Perna frontal
            ctx.fillRect(sheep.x + 30, sheep.y + 35, 4, 15);
            // Perna traseira
            ctx.fillRect(sheep.x + 15, sheep.y + 35, 4, 15);

            // Detalhes da lã (textura)
            ctx.strokeStyle = '#f0f0f0';
            for(let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(sheep.x + 20 + Math.cos(i) * 8, 
                       sheep.y + 20 + Math.sin(i) * 8, 
                       8, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Desenhar cerca
        function drawFence() {
            ctx.fillStyle = '#8B4513'; // Marrom escuro para a madeira

            fences.forEach(fence => {
                // Poste vertical mais fino
                ctx.fillRect(fence.x, canvas.height - fence.height, fence.width, fence.height);
                
                // Tábuas horizontais ainda mais finas
                const numBoards = 3;
                const boardHeight = 6; // Reduzido de 10 para 6
                const gapBetweenBoards = (fence.height - (numBoards * boardHeight)) / (numBoards - 1);
                
                // Desenhar tábuas horizontais mais finas
                for(let i = 0; i < numBoards; i++) {
                    const boardY = (canvas.height - fence.height) + (i * (boardHeight + gapBetweenBoards));
                    // Tábuas mais finas e curtas
                    ctx.fillRect(fence.x - 8, boardY, 24, boardHeight); // Ajustado de -10,28 para -8,24
                }

                // Linhas verticais mais sutis
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 0.3; // Reduzido de 0.5 para 0.3
                
                // Linhas de textura mais sutis
                for(let i = 0; i < 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(fence.x + (i * 3), canvas.height - fence.height);
                    ctx.lineTo(fence.x + (i * 3), canvas.height);
                    ctx.stroke();
                }
            });
        }

        // Desenhar pontuação
        function drawScore() {
            ctx.fillStyle = 'black';
            ctx.font = '24px Arial';
            ctx.fillText('Score: ' + score, 10, 30);
        }

        // Função para desenhar nuvens e sol
        function drawSkyElements() {
            // Desenhar sol
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
            ctx.fill();

            // Desenhar nuvens
            ctx.fillStyle = 'white';
            clouds.forEach(cloud => {
                // Corpo principal da nuvem
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y + cloud.height/2, cloud.height/2, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.width/3, cloud.y + cloud.height/2, cloud.height/2, 0, Math.PI * 2);
                ctx.arc(cloud.x + (cloud.width/3)*2, cloud.y + cloud.height/2, cloud.height/2, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Atualizar jogo
        function update() {
            if (gameOver) {
                ctx.fillStyle = 'black';
                ctx.font = '48px Arial';
                ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
                ctx.font = '24px Arial';
                ctx.fillText('Press Space to Restart', canvas.width/2 - 100, canvas.height/2 + 40);
                return;
            }

            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Desenhar elementos do céu
            drawSkyElements();

            // Física da ovelha
            if (sheep.isJumping) {
                sheep.velocity += sheep.gravity;
                sheep.y += sheep.velocity;

                // Verificar se atingiu o chão
                if (sheep.y >= 240) { // 280 (altura do canvas) - 40 (altura da ovelha)
                    sheep.y = 240;
                    sheep.velocity = 0;
                    sheep.isJumping = false;
                }
            }

            // Criar cercas
            if (fences.length === 0 || canvas.width - fences[fences.length - 1].x >= getRandomFenceGap()) {
                createFence();
            }

            // Atualizar cercas
            for (let i = fences.length - 1; i >= 0; i--) {
                fences[i].x -= calculateGameSpeed(); // Usa a velocidade calculada

                // Verificar colisão
                if (sheep.x + sheep.width > fences[i].x && 
                    sheep.x < fences[i].x + FENCE_WIDTH &&
                    sheep.y + sheep.height > canvas.height - fences[i].height) {
                    gameOver = true;
                }

                // Pontuação
                if (!fences[i].passed && sheep.x > fences[i].x + FENCE_WIDTH) {
                    score++;
                    fences[i].passed = true;
                }

                // Remover cercas fora da tela
                if (fences[i].x + FENCE_WIDTH < 0) {
                    fences.splice(i, 1);
                }
            }

            // Desenhar chão
            ctx.fillStyle = '#654321'; // Marrom para o chão
            ctx.fillRect(0, 280, canvas.width, 40);

            // Desenhar elementos
            drawSheep();
            drawFence();
            drawScore();

            requestAnimationFrame(update);
        }

        // Controles
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                if (gameOver) {
                    // Reiniciar jogo
                    sheep.y = 240;
                    sheep.velocity = 0;
                    sheep.isJumping = false;
                    fences.length = 0;
                    score = 0;
                    gameSpeed = 2; // Reseta a velocidade inicial
                    gameOver = false;
                    requestAnimationFrame(update);
                } else if (!sheep.isJumping) {
                    sheep.velocity = sheep.lift;
                    sheep.isJumping = true;
                }
            }
        });

        // Iniciar jogo
        update();
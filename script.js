document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Kiểm tra xem canvas có tồn tại không
    if (!canvas) {
        console.error("Không tìm thấy phần tử canvas!");
        return;
    }

    // Game state
    let gameRunning = false;
    let score = 0;
    let highScore = 0;
    let birdX = 50;
    let birdY = canvas.height / 2;
    let birdVelocity = 0;
    const gravity = 0.5;
    const flapPower = -10;
    const pipeWidth = 50;
    let pipeX = canvas.width;
    let pipeHeight = 200;
    const pipeGap = 150;

    // Element HTML
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const startButton = document.getElementById('startButton');
    const overlay = document.getElementById('overlay');
    const scoreForm = document.getElementById('scoreForm');
    const submitButton = document.getElementById('submitButton');
    const nameInput = document.getElementById('name');

    // Hàm vẽ chim
    function drawBird() {
        ctx.beginPath();
        ctx.arc(birdX, birdY, 20, 0, Math.PI * 2);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.closePath();
    }

    // Hàm vẽ ống
    function drawPipes() {
        ctx.fillStyle = "green";
        ctx.fillRect(pipeX, 0, pipeWidth, pipeHeight);
        ctx.fillRect(pipeX, pipeHeight + pipeGap, pipeWidth, canvas.height - (pipeHeight + pipeGap));
    }

    // Hàm cập nhật game
    function updateGame() {
        if (!gameRunning) return;

        // Xóa canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cập nhật vị trí chim
        birdVelocity += gravity;
        birdY += birdVelocity;

        // Cập nhật vị trí ống
        pipeX -= 3;
        if (pipeX < -pipeWidth) {
            pipeX = canvas.width;
            pipeHeight = Math.floor(Math.random() * 200) + 100;
            score++;
            scoreElement.textContent = `Score: ${score}`;
        }

        // Kiểm tra va chạm
        if (birdY > canvas.height || birdY < 0 || (pipeX < birdX && birdX < pipeX + pipeWidth && (birdY < pipeHeight || birdY > pipeHeight + pipeGap))) {
            gameOver();
            return;  // Dừng vòng lặp nếu game over
        }

        // Vẽ
        drawBird();
        drawPipes();

        // Gọi lại hàm updateGame
        requestAnimationFrame(updateGame);
    }
    // Hàm bắt đầu game
    function startGame() {
        gameRunning = true;
        score = 0;
        birdY = canvas.height / 2;
        birdVelocity = 0;
        pipeX = canvas.width;
        scoreElement.textContent = `Score: ${score}`;
        overlay.style.display = "none";
        scoreForm.style.display = "none";

        updateGame();
    }

    // Hàm kết thúc game
    function gameOver() {
        gameRunning = false;
        overlay.style.display = "block";
        scoreForm.style.display = "block";
    }

    // Xử lý sự kiện
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && gameRunning) {
            birdVelocity = flapPower;
        }
    });

    // Bắt đầu trò chơi khi nhấn nút
    startButton.addEventListener('click', startGame);

    // Gửi điểm
    submitButton.addEventListener('click', () => {
        const name = nameInput.value;
        sendScore(name, score);
    });

    // Hàm lấy điểm cao nhất từ server (ví dụ)
    async function getHighScores() {
        try {
            const response = await fetch('/high_scores');
            const data = await response.json();

            // Cập nhật giao diện người dùng
            if (data && data.length > 0) {
                highScoreElement.textContent = `High Score: ${data[0].score} (${data[0].name})`;
            }
        } catch (error) {
            console.error("Lỗi khi lấy điểm cao nhất:", error);
        }
    }

    // Hàm gửi điểm lên server (ví dụ)
    async function sendScore(name, score) {
        try {
            const response = await fetch('/submit_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name, score: score })
            });

            const data = await response.json();
            alert(data.message);

            await getHighScores(); // Lấy lại điểm cao sau khi gửi
            scoreForm.style.display = "none"; // Ẩn form
        } catch (error) {
            console.error("Lỗi khi gửi điểm:", error);
        }
    }

    // Khởi tạo
    getHighScores();
    overlay.style.display = "block";
});

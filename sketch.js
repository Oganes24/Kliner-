let score = 0;
let totalScore = 0;
let clicks = 0;
let totalClicks = 0;
let victories = 0;
let totalBattles = 0;
let invitedFriends = 0;
let totalTONEarned = 0;
let level = 1;
let nextLevelScore = 1000;
let clickPower = 4;
let circleSize = 100;
let circleX, circleY;
let animationScale = 1;
let isAnimating = false;
let playerName = "Игрок";

let profileWindowOpen = false;
let achievementsWindowOpen = false;
let leaderboardWindowOpen = false;

let rewardGeneratedTime = 0;
const rewardInterval = 12 * 60 * 60 * 1000;

let achievements = [];
let leaderboard = [];
let scrollOffset = 0;

let animations = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    textSize(16);
    textAlign(CENTER, CENTER);

    circleX = width / 2;
    circleY = height / 2 + 50;

    // Создаем список топа игроков
    for (let i = 1; i <= 100; i++) {
        leaderboard.push({
            name: `Игрок${i}`,
            score: int(random(5000, 50000)),
            ton: int(random(100, 1000))
        });
    }

    // Достижения
    achievements = [
        {name: "За 50 кликов", condition: () => clicks >= 50, achieved: false, reward: 1000, claimed: false},
        {name: "За 10 побед", condition: () => victories >= 10, achieved: false, reward: 2000, claimed: false},
        {name: "За 10 битв", condition: () => totalBattles >= 10, achieved: false, reward: 2000, claimed: false},
        {name: "За вход в игру", condition: () => millis() - rewardGeneratedTime >= rewardInterval, achieved: true, reward: 1500, claimed: false}
    ];

    checkRewardGeneration();
}

function draw() {
    background(20);
    textAlign(CENTER, CENTER);

    checkRewardGeneration();

    if (!profileWindowOpen && !achievementsWindowOpen && !leaderboardWindowOpen) {
        drawClickerScene();
        drawInterfaceButtons();
    }

    if (profileWindowOpen) {
        drawWindow("Профиль", drawPlayerProfile);
    }
    if (achievementsWindowOpen) {
        drawWindow("Достижения", drawAchievements);
    }
    if (leaderboardWindowOpen) {
        drawLeaderboard();
    }

    // Анимация клика
    if (isAnimating) {
        animationScale += 0.05;
        if (animationScale > 1.2) {
            animationScale = 1;
            isAnimating = false;
        }
    }

    // Анимация текста
    for (let i = animations.length - 1; i >= 0; i--) {
        let anim = animations[i];
        anim.y -= 1;
        anim.alpha -= 5;
        fill(255, anim.alpha);
        text(`+${anim.value}`, anim.x, anim.y);
        if (anim.alpha <= 0) {
            animations.splice(i, 1);
        }
    }
}

function drawClickerScene() {
    fill(255);
    textSize(24);
    text(`Очки: ${score}`, width / 2, height / 2 - 100);
    text(`Уровень: ${level}`, width / 2, height / 2 - 60);
    drawClickableCircle();
}

function drawClickableCircle() {
    fill(0, 150, 255);
    stroke(255);
    strokeWeight(4);
    ellipse(circleX, circleY, circleSize * animationScale, circleSize * animationScale);
}

function mousePressed() {
    if (!profileWindowOpen && !achievementsWindowOpen && !leaderboardWindowOpen) {
        if (dist(mouseX, mouseY, circleX, circleY) < circleSize * animationScale / 2) {
            addPoints(1);
            triggerAnimation(mouseX, mouseY, clickPower);
        }
    }
}

function addPoints(numTouches) {
    let pointsToAdd = clickPower * numTouches;
    score += pointsToAdd;
    totalScore += pointsToAdd;
    clicks += numTouches;
    totalClicks += numTouches;

    if (score >= nextLevelScore) {
        level++;
        nextLevelScore *= 2;
    }

    isAnimating = true;
    checkAchievements();
}

function triggerAnimation(x, y, value) {
    let offsetX = random(-30, 30);
    let offsetY = random(-30, 30);
    animations.push({x: x + offsetX, y: y + offsetY, value: value, alpha: 255});
}

function drawInterfaceButtons() {
    drawButton("Профиль", width / 2 - 180, height / 2 - 230, toggleProfileWindow);
    drawButton("Достижения", width / 2 - 60, height / 2 - 230, toggleAchievementsWindow);
    drawButton("Топ", width / 2 + 60, height / 2 - 230, toggleLeaderboardWindow);
}

function drawButton(label, x, y, onClick) {
    fill(0, 150, 255);
    stroke(255);
    strokeWeight(2);
    rect(x - 40, y - 15, 80, 30, 10);
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text(label, x, y);

    if (mouseIsPressed && mouseX > x - 40 && mouseX < x + 40 && mouseY > y - 15 && mouseY < y + 15) {
        onClick();
    }
}

function drawWindow(title, content) {
    fill(50);
    stroke(255);
    rect(width / 2 - 170, height / 2 - 170, 340, 340, 20);
    
    fill(255);
    textSize(18);
    textAlign(CENTER, TOP);
    text(title, width / 2, height / 2 - 150);

    content();
}

function toggleProfileWindow() {
    profileWindowOpen = !profileWindowOpen;
}

function toggleAchievementsWindow() {
    achievementsWindowOpen = !achievementsWindowOpen;
}

function toggleLeaderboardWindow() {
    leaderboardWindowOpen = !leaderboardWindowOpen;
    document.getElementById('leaderboardWindow').style.display = leaderboardWindowOpen ? 'block' : 'none';
}

function drawLeaderboard() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);
    let yOffset = height / 2 - 130 + scrollOffset;

    for (let i = 0; i < leaderboard.length; i++) {
        let player = leaderboard[i];
        let textX = width / 2 - 150;

        let distanceFromCenter = Math.abs((yOffset + 25 * i) - height / 2);
        let alphaValue = map(distanceFromCenter, 0, height / 2, 255, 0); // Плавное исчезновение текста
        fill(255, alphaValue);

        text(`${i + 1}. ${player.name}`, textX, yOffset);
        text(`Очки: ${player.score}`, textX + 100, yOffset);
        text(`TON: ${player.ton}`, textX + 200, yOffset);
        yOffset += 25;
    }
}

function mouseWheel(event) {
    if (leaderboardWindowOpen) {
        scrollOffset += event.delta;
        scrollOffset = constrain(scrollOffset, -1500, 0); // Ограничение прокрутки
    }
}

function drawPlayerProfile() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(16);
    text(`Имя: ${playerName}`, width / 2 - 150, height / 2 - 120);
    text(`Уровень: ${level}`, width / 2 - 150, height / 2 - 90);
    text(`Очки: ${score}`, width / 2 - 150, height / 2 - 60);
    text(`Всего очков: ${totalScore}`, width / 2 - 150, height / 2 - 30);
    text(`Клики: ${clicks}`, width / 2 - 150, height / 2);
    text(`Всего кликов: ${totalClicks}`, width / 2 - 150, height / 2 + 30);
    text(`Победы: ${victories}`, width / 2 - 150, height / 2 + 60);
    text(`Всего битв: ${totalBattles}`, width / 2 - 150, height / 2 + 90);
    text(`Приглашенные друзья: ${invitedFriends}`, width / 2 - 150, height / 2 + 120);
    text(`Заработано TON: ${totalTONEarned}`, width / 2 - 150, height / 2 + 150);
}

function drawAchievements() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(14);
    let yOffset = height / 2 - 110;

    for (let achievement of achievements) {
        let textX = width / 2 - 130;
        let rewardText = `${achievement.name} - ${achievement.reward}`;

        fill(achievement.achieved ? 'green' : 'white');
        textAlign(LEFT, TOP);
        text(rewardText, textX, yOffset);

        if (achievement.achieved && !achievement.claimed) {
            drawRewardButton(width / 2 + 40, yOffset, achievement);
        } else if (achievement.claimed) {
            drawInactiveRewardButton(width / 2 + 40, yOffset);
        }

        yOffset += 40;
    }
}

function drawRewardButton(x, y, achievement) {
    fill(0, 255, 0);
    stroke(255);
    strokeWeight(2);
    rect(x, y - 10, 100, 30, 10);
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Забрать", x + 50, y + 5);

    if (mouseIsPressed && mouseX > x && mouseX < x + 100 && mouseY > y - 10 && mouseY < y + 20) {
        claimReward(achievement);
    }
}

function drawInactiveRewardButton(x, y) {
    fill(100);
    stroke(255);
    strokeWeight(2);
    rect(x, y - 10, 100, 30, 10);
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Забрано", x + 50, y + 5);
}

function claimReward(achievement) {
    score += achievement.reward;
    achievement.claimed = true;
}

function checkAchievements() {
    for (let achievement of achievements) {
        if (achievement.condition() && !achievement.achieved) {
            achievement.achieved = true;
        }
    }
}

function checkRewardGeneration() {
    if (millis() - rewardGeneratedTime >= rewardInterval) {
        rewardGeneratedTime = millis();
        let newAchievement = {
            name: `За ${clicks + 50} кликов`,
            condition: () => clicks >= clicks + 50,
            achieved: false,
            reward: (level + 1) * 1000,
            claimed: false
        };
        achievements.push(newAchievement);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
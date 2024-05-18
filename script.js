// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const ROWS = canvas.height / TILE_SIZE;
const COLS = canvas.width / TILE_SIZE;
const blocks = [];
const items = [];
const inventory = {
    dirt: 0,
    wood: 0,
};

for (let row = 0; row < ROWS; row++) {
    const rowBlocks = [];
    for (let col = 0; col < COLS; col++) {
        rowBlocks.push(null);
    }
    blocks.push(rowBlocks);
}

let player = { x: 1, y: 1, hp: 10 };
let enemies = [{ x: 5, y: 5, hp: 3 }];

document.getElementById('moveLeft').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('moveRight').addEventListener('click', () => movePlayer(1, 0));
document.getElementById('moveUp').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('moveDown').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('placeBlock').addEventListener('click', () => placeBlock());
document.getElementById('removeBlock').addEventListener('click', () => removeBlock());
document.getElementById('craftItem').addEventListener('click', () => craftItem());

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS) {
        player.x = newX;
        player.y = newY;
    }
    pickUpItems();
    draw();
}

function placeBlock() {
    const { x, y } = player;
    if (!blocks[y][x] && inventory.dirt > 0) {
        blocks[y][x] = 'dirt';
        inventory.dirt--;
    }
    updateInventory();
    draw();
}

function removeBlock() {
    const { x, y } = player;
    if (blocks[y][x]) {
        dropItem(x, y, blocks[y][x]);
        blocks[y][x] = null;
    }
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (blocks[row][col]) {
                ctx.fillStyle = 'brown';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
            ctx.strokeStyle = 'lightgray';
            ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // プレイヤーの描画
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

    // 敵の描画
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });

    // アイテムの描画
    items.forEach(item => {
        ctx.fillStyle = item.type === 'dirt' ? 'brown' : 'green';
        ctx.fillRect(item.x * TILE_SIZE, item.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
}

function gameLoop() {
    moveEnemies();
    checkCollisions();
    draw();
    requestAnimationFrame(gameLoop);
}

function moveEnemies() {
    enemies.forEach(enemy => {
        const direction = Math.floor(Math.random() * 4);
        let dx = 0, dy = 0;
        if (direction === 0) dx = -1;
        if (direction === 1) dx = 1;
        if (direction === 2) dy = -1;
        if (direction === 3) dy = 1;
        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS && !blocks[newY][newX]) {
            enemy.x = newX;
            enemy.y = newY;
        }
    });
}

function checkCollisions() {
    enemies.forEach(enemy => {
        if (enemy.x === player.x && enemy.y === player.y) {
            player.hp -= 1;
            if (player.hp <= 0) {
                alert('ゲームオーバー');
                player.hp = 10;
                player.x = 1;
                player.y = 1;
            }
        }
    });
}

function dropItem(x, y, type) {
    items.push({ x, y, type });
}

function pickUpItems() {
    items.forEach((item, index) => {
        if (item.x === player.x && item.y === player.y) {
            inventory[item.type]++;
            items.splice(index, 1);
            updateInventory();
        }
    });
}

function updateInventory() {
    const inventoryItems = document.getElementById('inventoryItems');
    inventoryItems.innerHTML = '';
    for (const [item, count] of Object.entries(inventory)) {
        const itemDiv = document.createElement('div');
        itemDiv.textContent = `${item}: ${count}`;
        inventoryItems.appendChild(itemDiv);
    }
}

function craftItem() {
    if (inventory.dirt >= 2) {
        inventory.dirt -= 2;
        inventory.wood += 1;
        updateInventory();
    } else {
        alert('材料が足りません');
    }
}

draw();
updateInventory();
gameLoop();

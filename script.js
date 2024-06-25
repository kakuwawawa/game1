document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    let boxes = [];
    let lines = [];
    let selectedBox = null;
    let isAddingBox = false;
    let isRemovingBox = false;

    document.getElementById('addBoxButton').addEventListener('click', () => {
        isAddingBox = true;
        isRemovingBox = false;
    });

    document.getElementById('removeBoxButton').addEventListener('click', () => {
        isRemovingBox = true;
        isAddingBox = false;
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isAddingBox) {
            addBox(x, y);
            isAddingBox = false;
        } else if (isRemovingBox) {
            removeBox(x, y);
            isRemovingBox = false;
        } else {
            selectBox(x, y);
        }

        draw();
    });

    const addBox = (x, y) => {
        const name = prompt("箱の名前を入力してください:");
        if (name) {
            boxes.push({ x, y, name });
        }
    };

    const removeBox = (x, y) => {
        boxes = boxes.filter(box => !isPointInBox(x, y, box));
        lines = lines.filter(line => !isPointInBox(x, y, line.start) && !isPointInBox(x, y, line.end));
    };

    const selectBox = (x, y) => {
        for (const box of boxes) {
            if (isPointInBox(x, y, box)) {
                if (selectedBox) {
                    lines.push({ start: selectedBox, end: box });
                    selectedBox = null;
                } else {
                    selectedBox = box;
                }
                break;
            }
        }
    };

    const isPointInBox = (x, y, box) => {
        return x >= box.x - 20 && x <= box.x + 20 && y >= box.y - 20 && y <= box.y + 20;
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 線を描く
        ctx.beginPath();
        for (const line of lines) {
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.end.x, line.end.y);
        }
        ctx.stroke();

        // 箱を描く
        for (const box of boxes) {
            ctx.beginPath();
            ctx.rect(box.x - 20, box.y - 20, 40, 40);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'black';
            ctx.fillText(box.name, box.x - 10, box.y + 5);
        }

        // 正多角形を描く
        drawPolygon();
    };

    const drawPolygon = () => {
        const polygonPoints = [];

        for (const line of lines) {
            const startIndex = polygonPoints.indexOf(line.start);
            const endIndex = polygonPoints.indexOf(line.end);

            if (startIndex === -1 && endIndex === -1) {
                polygonPoints.push(line.start, line.end);
            } else if (startIndex === -1) {
                polygonPoints.splice(endIndex + 1, 0, line.start);
            } else if (endIndex === -1) {
                polygonPoints.splice(startIndex + 1, 0, line.end);
            }
        }

        if (polygonPoints.length > 2 && polygonPoints[0] === polygonPoints[polygonPoints.length - 1]) {
            polygonPoints.pop();
            const n = polygonPoints.length;
            const angleStep = (2 * Math.PI) / n;
            const radius = 50;

            ctx.beginPath();
            for (let i = 0; i < n; i++) {
                const x = polygonPoints[0].x + radius * Math.cos(i * angleStep);
                const y = polygonPoints[0].y + radius * Math.sin(i * angleStep);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }
    };

    draw();
});

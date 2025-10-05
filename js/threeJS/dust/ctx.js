import * as THREE from 'three';

export default function makeTextTargetsSimple(
    text = "Connect",
    size = 256,
    fontFamily = "Space Grotesk",
    fontWeight = 600,
    fontStyle = "normal",
    fontSize = 180,
    canvasW = 1024,
    canvasH = 512,
    step = 1,
) {
    const cvs = document.createElement("canvas");
    cvs.width = canvasW; cvs.height = canvasH;
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle = "#fff";
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px '${fontFamily}'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvasW * 0.5, canvasH * 0.5);

    const img = ctx.getImageData(0, 0, canvasW, canvasH).data;
    const pts = [];
    for (let y = 0; y < canvasH; y += step) {
        for (let x = 0; x < canvasW; x += step) {
            const i = (y * canvasW + x) * 4;
            if (img[i + 3] > 10) {
                const nx = (x - canvasW / 2) / (canvasW / 2);
                const ny = -(y - canvasH / 2) / (canvasH / 2);
                pts.push([nx, ny]);
            }
        }
    }

    const count = size * size;
    const data = new Float32Array(count * 4);
    for (let k = 0; k < count; k++) {
        const p = pts[(k * 1315423911) % pts.length];
        data[k * 4 + 0] = p[0];
        data[k * 4 + 1] = p[1];
        data[k * 4 + 2] = 0.0;
        data[k * 4 + 3] = 1.0;
    }

    const tex = new THREE.DataTexture(
        data,
        size,
        size,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
}
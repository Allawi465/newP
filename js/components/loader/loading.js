import gsap from "gsap";
const progressBar = document.getElementById('progressBar');
const counterNumber = document.getElementById('counterNumber');
const progressCounter = document.getElementById('progressCounter');
export const loadingContainer = document.getElementById('loadingContainer');
export const loadingProgress = { value: 0 };

export default function getTransform(progress) {
    if (progress <= 10) {
        return '0%';
    } else if (progress >= 95) {
        return '-100%';
    } else if (progress >= 85) {
        return '-75%';
    } else {
        return '-50%';
    }
}

export function updateProgressUI() {
    const currentProgress = loadingProgress.value;
    const displayProgress = Math.floor(currentProgress);

    counterNumber.textContent = displayProgress;
    gsap.set(progressBar, { width: currentProgress + '%' });
    gsap.set(progressCounter, {
        left: currentProgress + '%',
        x: getTransform(currentProgress)
    });
}
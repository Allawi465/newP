import gsap from "gsap";
export const progressBar = document.getElementById('progressBar');
export const counterNumber = document.getElementById('counterNumber');
export const progressCounter = document.getElementById('progressCounter');
export const loadingContainer = document.getElementById('loadingContainer');
export const loadingProgress = { value: 0 };

// Calculate transform based on progress to prevent overflow
/* export default function getTransform(progress) {
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

gsap.to(loadingProgress, {
    value: 30,
    duration: 0.5,
    ease: 'power1.in',
    onUpdate: function () {
        const currentProgress = loadingProgress.value;
        const displayProgress = Math.floor(currentProgress);

        // Update counter number
        counterNumber.textContent = displayProgress;

        // Update progress bar width
        gsap.set(progressBar, { width: currentProgress + '%' });

        // Update counter position with smooth transform
        gsap.set(progressCounter, {
            left: currentProgress + '%',
            x: getTransform(currentProgress)
        });
    }
});

gsap.to(loadingProgress, {
    value: 70,
    duration: 0.8,
    delay: 0.5,
    ease: 'linear',
    onUpdate: function () {
        const currentProgress = loadingProgress.value;
        const displayProgress = Math.floor(currentProgress);

        counterNumber.textContent = displayProgress;
        gsap.set(progressBar, { width: currentProgress + '%' });
        gsap.set(progressCounter, {
            left: currentProgress + '%',
            x: getTransform(currentProgress)
        });
    }
});

gsap.to(loadingProgress, {
    value: 100,
    duration: 0.7,
    delay: 1.3,
    ease: 'power2.out',
    onUpdate: function () {
        const currentProgress = loadingProgress.value;
        const displayProgress = Math.floor(currentProgress);

        counterNumber.textContent = displayProgress;
        gsap.set(progressBar, { width: currentProgress + '%' });
        gsap.set(progressCounter, {
            left: currentProgress + '%',
            x: getTransform(currentProgress)
        });
    },
}); */
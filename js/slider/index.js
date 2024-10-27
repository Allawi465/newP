import gsap from 'gsap';
import { applyDistanceScale } from './onpointer.js';

export function onPointerMove(event, context) {
    if (!context.isDragging) return;

    const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    if (clientX === undefined) return;

    const delta = clientX - context.startX;

    // Apply some smoothing to the dragDelta to make it feel more constant
    const smoothingFactor = 0.5; // Adjust this factor for more or less smoothness
    context.dragDelta = context.dragDelta * (1 - smoothingFactor) + Math.abs(delta) * smoothingFactor;

    // Adjust the position with some easing to avoid abrupt jumps
    context.currentPosition += (delta / context.movementSensitivity) * smoothingFactor;

    // Calculate drag speed and apply smoothing to it
    const rawSpeed = clientX - context.lastX;
    context.dragSpeed = context.dragSpeed * (1 - smoothingFactor) + rawSpeed * smoothingFactor;

    // Limit the maximum speed for more control
    context.dragSpeed = Math.max(Math.min(context.dragSpeed, 60), -60);

    context.lastX = clientX;

    if (!context.isMomentumStarted) {
        context.isMomentumStarted = true;
        startMomentumMotion(context);
    }

    context.updatePositions();

    // Smooth the velocity as well
    context.velocity = context.velocity * (1 - smoothingFactor) + (delta / context.movementSensitivity) * smoothingFactor;
    context.startX = clientX;
}

export function onPointerDown(event, context) {
    context.isDragging = true;
    context.startX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    context.startY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches[0].clientY);
    context.dragDelta = 1;
    context.lastX = context.startX;
    context.isMoving = false;
    context.isMomentumStarted = false;

    // Store the initial click position
    context.initialClick = { x: context.startX, y: context.startY };
}

export function onPointerUp(event, context) {
    const endX = event.clientX !== undefined
        ? event.clientX
        : (event.touches && event.touches[0] && event.touches[0].clientX);
    const endY = event.clientY !== undefined
        ? event.clientY
        : (event.touches && event.touches[0] && event.touches[0].clientY);

    // If endX or endY is undefined, exit early to prevent errors
    if (endX === undefined || endY === undefined) return;

    const deltaX = Math.abs(endX - context.initialClick.x);
    const deltaY = Math.abs(endY - context.initialClick.y);
    const clickThreshold = 5; // Small movement threshold to consider it a click

    // Reset dragging state
    context.isDragging = false;

    // Check if it was a click (minimal movement)
    if (deltaX < clickThreshold && deltaY < clickThreshold) {
        // Treat it as a click
        handleClick(event, context);
    } else {
        // Treat it as a drag, stop dragging and start momentum
        context.isMoving = true;
        startMomentumMotion(context);
    }
}



export function startMomentumMotion(context) {
    if (!context.isMoving && !context.isDragging) return;

    context.currentPosition += context.velocity;

    applyDistanceScale(context);

    context.velocity *= context.friction;

    let offsetValue = context.velocity * 50;
    const maxOffset = 50;
    offsetValue = Math.max(Math.min(offsetValue, maxOffset), -maxOffset);

    context.group.children.forEach(child => {
        gsap.to(child.material.uniforms.uOffset.value, {
            x: offsetValue,
            ease: "power4.out",
            duration: 0.5,
        });
    });

    if (Math.abs(context.velocity) > 0.1 || context.isDragging) {
        requestAnimationFrame(() => startMomentumMotion(context));
    } else {
        context.velocity = 0;
        context.isMoving = false;

        context.group.children.forEach(child => {
            gsap.to(child.material.uniforms.uOffset.value, {
                x: 0,
                ease: "power4.out",
                duration: 0.5,
            });

            gsap.to(child.material.uniforms.uDistanceScale, {
                value: context.initialDistanceScale,
                duration: 0.5,
                ease: "power1.out",
            });
        });
    }
}

export function onMouseMoveHover(event, context) {
    context.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    context.raycaster.setFromCamera(context.mouse, context.camera);

    const intersects = context.raycaster.intersectObjects(context.group.children);
    context.group.children.forEach(child => {
        const isIntersected = intersects.length > 0 && intersects[0].object === child;
        if (isIntersected && !child.userData.hovered) {
            child.userData.hovered = true;
            child.userData.tl.play();
        } else if (!isIntersected && child.userData.hovered) {
            child.userData.hovered = false;
            child.userData.tl.reverse();
        }
    });
}

function handleClick(event, context) {
    // If the infoDiv is open, prevent new card interactions
    if (context.isDivOpen) {
        return; // Prevent further clicks when the div is open
    }

    // Normalize mouse position
    context.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    // Set the raycaster based on the camera and mouse position
    context.raycaster.setFromCamera(context.mouse, context.camera);

    // Check if the raycaster intersects any objects in the scene
    const intersects = context.raycaster.intersectObjects(context.group.children);

    // If there is an intersection, open the div with content
    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const meshIndex = mesh.userData.index;

        // Check if the images array is initialized and meshIndex is valid
        if (context.images && meshIndex >= 0 && meshIndex < context.images.length) {
            // Show the div with the image, title, and description
            showDivWithContent(meshIndex, context);
        } else {
            console.error(`Invalid mesh index: ${meshIndex} or images array is not initialized`);
        }
    }
}

function showDivWithContent(index, context) {
    const selectedImage = context.images[index];

    if (!selectedImage) {
        console.error(`No image found for index: ${index}`);
        return;
    }

    const infoDiv = document.getElementById('infoDiv');

    // Update the div content
    infoDiv.innerHTML = `
        <img src="${selectedImage.src}" alt="${selectedImage.title}" class="projectsImg" />
        <h2>${selectedImage.title}</h2>
        <p>${selectedImage.description}</p>
    `;

    // Add event listener to the close button after the content is rendered
    const closeBtn = document.getElementById('close');
    closeBtn.addEventListener('click', () => closeInfoDiv(context));

    // Make the div visible
    infoDiv.style.display = 'block';

    context.isDivOpen = true;
}

function closeInfoDiv(context) {
    // Hide the info div
    document.getElementById('infoDiv').style.display = 'none';

    context.isDivOpen = false;
}

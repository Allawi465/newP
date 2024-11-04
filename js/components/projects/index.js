import closeInfoDiv from "../close";

function showDivWithContent(index, context) {
    const selectedImage = context.images[index];

    if (!selectedImage) {
        console.error(`No image found for index: ${index}`);
        return;
    }

    const infoDiv = document.getElementById('projects_info');

    // Update the div content
    infoDiv.innerHTML = `
        <img src="${selectedImage.src}" alt="${selectedImage.title}" class="projectsImg" />
        <h2>${selectedImage.title}</h2>
        <p>${selectedImage.description}</p>
        <div id="close" class="close">Close</div>
    `;

    // Add event listener to the close button after the content is rendered
    const closeBtn = document.getElementById('close');
    closeBtn.addEventListener('click', () => closeInfoDiv(context));

    closeBtn.style.display = 'block';

    // Make the div visible
    infoDiv.style.display = 'block';

    // Stop Lenis scrolling when the info div is open
    context.stopScrolling();

    context.isDivOpen = true;
}

export default showDivWithContent;
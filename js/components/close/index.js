function closeInfoDiv(context) {
    const aboutDiv = document.getElementById('about');
    aboutDiv.classList.remove('show');
    aboutDiv.style.zIndex = 0;

    const closeBtn = document.getElementById('close');
    closeBtn.style.display = 'none';

    // Stop aboutDiv scrolling and start body scrolling
    /*     context.stopAboutScrolling(); */
    context.startBodyScrolling();

    context.isDivOpen = false;
    context.toggleAboutfbo(false);

    // Pause the horizontalLoop animation
    if (context.tl) {
        context.tl.pause();
    }
}

export default closeInfoDiv;
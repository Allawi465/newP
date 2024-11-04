function closeInfoDiv(context) {
    // Hide the info div
    document.getElementById('projects_info').style.display = 'none';
    document.getElementById('about').style.display = 'none';
    const closeBtn = document.getElementById('close');
    closeBtn.style.display = 'none';
    // Resume Lenis scrolling when the info div is closed
    context.startScrolling();

    context.isDivOpen = false;

    context.toggleAboutfbo(false);
}

export default closeInfoDiv;
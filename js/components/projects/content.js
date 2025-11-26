export default function setInfoDivContent(selectedImage) {
    const infoDiv = document.querySelector('.projects_wrapper');
    if (!infoDiv) return console.error("projects_wrapper not found");

    infoDiv.innerHTML = `
        <div class="projects_container">
            <div class="project_img">
                <img src="${selectedImage.src}" alt="${selectedImage.title}" class="projectsImg"/>
            </div>
            <div class="project_info">
                <h2 class="project_title">${selectedImage.title}</h2>
                <div class="p_container">
                    <p class="projects_description">${selectedImage.description}</p> 
                </div>
                <div class="role">
                    <div class="role_title">Role</div> 
                    <div class="role_item">
                        <div class="role_p">Web Design</div> 
                        <div class="role_p">Development</div> 
                        <div class="role_p">Branding</div> 
                    </div>
                </div>
                <p class="link_cta"><a href="${selectedImage.link}" target="_blank">Visit website</a></p> 
            </div>
        </div>
    `;
}
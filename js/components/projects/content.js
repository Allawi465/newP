export default function setInfoDivContent(selectedImage) {
    const infoDiv = document.getElementById('projects_info');
    infoDiv.innerHTML = `
        <div class="projects_container c1">
            <div class="project_details">
                <div class="projects_titles_hidden">    
                    <h1 class="projects_title">${selectedImage.title}</h1>
                    <h2 class="projects_slogans">${selectedImage.slogan}</h2>
                </div>
                <div class="project_img">
                    <div class="projects_titles">    
                        <h1 class="projects_title project_title">${selectedImage.title}</h1>
                    </div>
                    <img src="${selectedImage.src}" alt="${selectedImage.title}" class="projectsImg" />
                </div>
                <div class="project_descri_wrap">
                    <div class="project_description">
                        <h2 class="projects_slogan">${selectedImage.slogan}</h2>
                        <p class="projects_description">${selectedImage.description}</p>
                        <p class="txt hidden_link bottom_link" ><a class="link_cta " href="${selectedImage.link}" target="_blank">See project</a></p>
                    </div>
                    <div class="projects_detils">
                        <div class="projects_detils_links">
                            <p class="projects_detils_text">Website</p>
                            <p class="txt"><a class="link_cta" style="margin: 0;" href="${selectedImage.link}" target="_blank">See project</a></p>
                        </div>   
                        <div class="projects_detils_links">
                            <p class="projects_detils_text">Role</p>
                            <p class="txt">Design, Web Development</p>
                        </div>   
                        <div class="projects_detils_links">
                            <p class="projects_detils_text">Tech</p>
                            <p class="txt">threeJS, GSLS</p>
                        </div>   
                    </div>
                </div>
            </div>
        </div>`;
}
export default function setInfoDivContent(selectedImage) {
    const infoDiv = document.getElementById('projects_info');
    infoDiv.innerHTML = `
        <div class="projects_container c1">
            <div class="projects_titles">    
                <h1 class="projects_title project_title">${selectedImage.title}</h1>
                <p class="project_slogan">${selectedImage.slogan}</p>
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
                       <p class="projects_detils_text">Technology</p>
                    <p class="txt">threeJS, GSLS</p>
                </div>   
            </div>
              <p class="txt hidden_link" ><a class="link_cta" style="margin: 0;" href="${selectedImage.link}" target="_blank">See project</a></p>

            <div class="project_img">
                <img src="${selectedImage.src}" alt="${selectedImage.title}" class="projectsImg" />
            </div>
            <div class="project_second">
                 <div class="project_imgSmall">
                    <img src="${selectedImage.src}" alt="${selectedImage.title}" class="projectsImg projectsImg_small" />
                </div>
                <div class="project_descri_wrap">
                    <p class="txt projects_description">${selectedImage.description}</p>
                    <p class="txt link_description bottom_link"><a class="link_cta" style="margin: 0;" href="${selectedImage.link}" target="_blank">See project</a></p>
                </div>
            </div>
            <p class="txt hidden_link bottom_link" ><a class="link_cta " href="${selectedImage.link}" target="_blank">See project</a></p>
        </div>`;
}
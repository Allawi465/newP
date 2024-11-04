import closeInfoDiv from "../close";
import { gmail, github, linkedin, discord } from "./icons";

function showAbout(context) {
    const aboutDiv = document.getElementById('about');

    aboutDiv.innerHTML = `
       <div class="about_wrapper">
            <div class="about_section">
                <div class="about-content c3">
                    <h3 class="about_headings">About</h3>
                    <div class="about_flex">
                        <h4 class="about_headings2">me.</h4>
                        <div class="text_about">
                            <p class="txt">I’m a Norwegian web developer passionate about creating immersive 3D experiences with
                                GLSL,
                                Three.js, Blender, and 3D design. While 3D is my focus,
                                I’m also skilled in building engaging, responsive web experiences with a strong foundation in
                                tools like
                                NestJS,
                                TailwindCSS, and Figma. My goal is to bring depth and interactivity to web projects,
                                blending design and technology seamlessly.
                            </p>
                        </div>
                    </div>
                       <div class="contact_info">  
                            <a class="icons" href="https://github.com/Allawi465" target="_blank">
                                ${github}<span class="icons-txt">Github</span>
                            </a>  
                            <a class="icons" href="https://www.linkedin.com/in/mohammed-allawi-89830621a"target="_blank">
                                ${linkedin}<span class="icons-txt">Linkedin</span>
                            </a>  
                            <a class="icons" href="" target="_blank">
                                ${discord}<span class="icons-txt">Discord</span>
                            </a>  
                            <a class="icons" href="mailto:allawi465@gmail.com" target="_blank">
                                ${gmail}<span class="icons-txt">Gmail</span>
                            </a>
                       </div>
                </div>
            </div>
            
            <div style="transform: translate3d(0%, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;"
                class="title_play">
                <div class="title-w">
                    <div class="title-single">
                        <h1 class="title-heading rolling_h1"
                            style="translate: none; rotate: none; scale: none; transform: translate(89.7549%, 0%) translate3d(0px, 0px, 0px);">
                            Web developer &amp;&nbsp;Interactive 3D Creator &amp;</h1>
                        <h1 class="title-heading rolling_h1"
                            style="translate: none; rotate: none; scale: none; transform: translate(94.2656%, 0%) translate3d(0px, 0px, 0px);">
                            Web developer &amp;&nbsp;Interactive 3D Creator</h1>
                        <h1 class="title-heading rolling_h1"
                            style="translate: none; rotate: none; scale: none; transform: translate(93.972%, 0%) translate3d(0px, 0px, 0px);">
                            Web developer &amp;&nbsp;Interactive 3D Creator</h1>
                        <h1 class="title-heading rolling_h1"
                            style="translate: none; rotate: none; scale: none; transform: translate(-317.413%, 0%) translate3d(0px, 0px, 0px);">
                            Web developer &amp;&nbsp;Interactive 3D Creator</h1>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listener to the close button after the content is rendered
    const closeBtn = document.getElementById('close');
    closeBtn.addEventListener('click', () => closeInfoDiv(context));
    closeBtn.style.display = 'block';

    // Show the about div
    aboutDiv.style.display = 'block';
    context.stopScrolling();

    // Toggle the cube visibility in EffectShell
    context.toggleAboutfbo(true); // Show the cube when about is open

    context.isDivOpen = true;
}

export default showAbout;

export const images = [
    {
        id: 'slider_1',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'Adventure',
        slogan: 'Explore the Uncharted',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_2',
        src: '2.jpg',
        src2: '2.jpg',
        title: 'Holidaze',
        slogan: 'Relax in Style',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_3',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'NoxB',
        slogan: 'Innovating Tomorrow',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_4',
        src: '4.jpg',
        src2: '4.jpg',
        title: 'Buyers',
        slogan: 'Shop Smart',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_5',
        src: '5.jpg',
        src2: '5.jpg',
        title: 'Portfolio 02',
        slogan: 'Digital Craftsmanship',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_6',
        src: '6.jpg',
        src2: '6.jpg',
        title: 'Note',
        slogan: 'Moments That Matter',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_1',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'Adventure',
        slogan: 'Explore the Uncharted',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_2',
        src: '2.jpg',
        src2: '2.jpg',
        title: 'Holidaze',
        slogan: 'Relax in Style',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_3',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'NoxB',
        slogan: 'Innovating Tomorrow',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_4',
        src: '4.jpg',
        src2: '4.jpg',
        title: 'Buyers',
        slogan: 'Shop Smart',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_5',
        src: '5.jpg',
        src2: '5.jpg',
        title: 'Portfolio 02',
        slogan: 'Digital Craftsmanship',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_6',
        src: '6.jpg',
        src2: '6.jpg',
        title: 'Note',
        slogan: 'Moments That Matter',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_1',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'Adventure',
        slogan: 'Explore the Uncharted',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_2',
        src: '2.jpg',
        src2: '2.jpg',
        title: 'Holidaze',
        slogan: 'Relax in Style',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_3',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'NoxB',
        slogan: 'Innovating Tomorrow',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_4',
        src: '4.jpg',
        src2: '4.jpg',
        title: 'Buyers',
        slogan: 'Shop Smart',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_5',
        src: '5.jpg',
        src2: '5.jpg',
        title: 'Portfolio 02',
        slogan: 'Digital Craftsmanship',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_6',
        src: '6.jpg',
        src2: '6.jpg',
        title: 'Note',
        slogan: 'Moments That Matter',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
];

export function calculatePositionX(index, currentPosition, meshSpacing) {
    const totalLength = meshSpacing * images.length;
    return ((((index * meshSpacing + currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;
}
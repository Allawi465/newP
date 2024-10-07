
export const images = [
    { src: '1.jpg', title: 'Adventure', description: 'Explore the Unexplored' },
    { src: '2.jpg', title: 'Holidaze', description: 'Your Gateway to Relaxation' },
    { src: '3.jpg', title: 'NoxB', description: 'Innovate Your World' },
    { src: '4.jpg', title: 'Buyers', description: 'Where Every Purchase Counts' },
    { src: '5.jpg', title: 'Portfolio 02', description: 'Crafting Your Digital Identity' },
    { src: '6.jpg', title: 'Note', description: 'Capture Every Moment' },
    { src: '1.jpg', title: 'Adventure', description: 'Explore the Unexplored' },
    { src: '2.jpg', title: 'Holidaze', description: 'Your Gateway to Relaxation' },
    { src: '3.jpg', title: 'NoxB', description: 'Innovate Your World' },
    { src: '4.jpg', title: 'Buyers', description: 'Where Every Purchase Counts' },
    { src: '5.jpg', title: 'Portfolio 02', description: 'Crafting Your Digital Identity' },
    { src: '6.jpg', title: 'Note', description: 'Capture Every Moment' },
    { src: '1.jpg', title: 'Adventure', description: 'Explore the Unexplored' },
    { src: '2.jpg', title: 'Holidaze', description: 'Your Gateway to Relaxation' },
    { src: '3.jpg', title: 'NoxB', description: 'Innovate Your World' },
    { src: '4.jpg', title: 'Buyers', description: 'Where Every Purchase Counts' },
    { src: '5.jpg', title: 'Portfolio 02', description: 'Crafting Your Digital Identity' },
    { src: '6.jpg', title: 'Note', description: 'Capture Every Moment' },

];

export function calculatePositionX(index, currentPosition, meshSpacing) {
    const totalLength = meshSpacing * images.length;
    return ((((index * meshSpacing + currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;
}
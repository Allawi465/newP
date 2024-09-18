
export const images = [
    { src: '1.png', title: 'Adventure', description: 'Explore the Unexplored' },
    { src: '2.png', title: 'Holidaze', description: 'Your Gateway to Relaxation' },
    { src: '3.png', title: 'NoxB', description: 'Innovate Your World' },
    { src: '4.png', title: 'Buyers', description: 'Where Every Purchase Counts' },
    { src: '5.png', title: 'Portfolio 02', description: 'Crafting Your Digital Identity' },
    { src: '6.png', title: 'Note', description: 'Capture Every Moment' },
    { src: '1.png', title: 'Adventure', description: 'Explore the Unexplored' },
    { src: '2.png', title: 'Holidaze', description: 'Your Gateway to Relaxation' },
    { src: '3.png', title: 'NoxB', description: 'Innovate Your World' },
    { src: '4.png', title: 'Buyers', description: 'Where Every Purchase Counts' },
    { src: '5.png', title: 'Portfolio 02', description: 'Crafting Your Digital Identity' },
    { src: '6.png', title: 'Note', description: 'Capture Every Moment' },
    { src: '1.png', title: 'Adventure', description: 'Explore the Unexplored' },
    { src: '2.png', title: 'Holidaze', description: 'Your Gateway to Relaxation' },
    { src: '3.png', title: 'NoxB', description: 'Innovate Your World' },
    { src: '4.png', title: 'Buyers', description: 'Where Every Purchase Counts' },
    { src: '5.png', title: 'Portfolio 02', description: 'Crafting Your Digital Identity' },
    { src: '6.png', title: 'Note', description: 'Capture Every Moment' },

];

export function calculatePositionX(index, currentPosition, meshSpacing) {
    const totalLength = meshSpacing * images.length;
    return ((((index * meshSpacing + currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;
}
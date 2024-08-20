
export const images = [
    { src: '1.png', title: 'Adventure' },
    { src: '2.png', title: 'Holidaze' },
    { src: '3.png', title: 'NoxB' },
    { src: '4.png', title: 'Buyers' },
    { src: '5.png', title: 'Portfolio 02' },
    { src: '6.png', title: 'Note' },
];


export function calculatePositionX(index, currentPosition, meshSpacing) {
    const totalLength = meshSpacing * images.length;
    return ((((index * meshSpacing + currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;
}
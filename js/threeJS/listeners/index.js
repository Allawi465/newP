import * as THREE from 'three';
/* import { onPointerDown, onPointerMove, onPointerUp } from '../slider/index.js'; */
/* import { onMouseMoveHover } from '../slider/mouseHover/index.js'; */
import showAbout from '../../components/about/index.js';
import closeInfoDiv from '../../components/close/index.js';
import { onWindowResize } from '../index.js';

export default function setupEventListeners(context) {
    window.addEventListener('resize', () => onWindowResize(context));



}
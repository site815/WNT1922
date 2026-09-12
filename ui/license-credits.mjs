import { musicCredits } from './music.mjs';
const target = document.querySelector('#music-credits');
if (target) target.innerHTML = musicCredits();

const bgmIcon = document.getElementById('bgm-icon');
const bgmAudio = document.getElementById('bgm-audio');
const body = document.body;

bgmIcon.addEventListener('click', () => {
    if (bgmAudio.paused) {
        bgmAudio.play();
        body.classList.add('bgm-active');
        bgmIcon.classList.add('spinning');
        bgmIcon.classList.add('glowing');
    } else {
        bgmAudio.pause();
        body.classList.remove('bgm-active');
        bgmIcon.classList.remove('spinning');
        bgmIcon.classList.remove('glowing');
    }
});
import { H as Hls } from './hls-dru42stk.js';

function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function setMessage(message) {
    var messageNode = document.querySelector('[data-player-message]');
    if (messageNode) {
        messageNode.textContent = message || '';
    }
}

function setupPlayer() {
    var video = document.querySelector('video[data-video-url]');
    var button = document.querySelector('[data-play-button]');
    var shell = document.querySelector('[data-player-shell]');

    if (!video) {
        return;
    }

    var source = video.dataset.videoUrl;
    var hlsInstance = null;

    function loadSource() {
        if (!source) {
            setMessage('当前详情页没有可用播放源。');
            return false;
        }
        if (video.dataset.loaded === 'true') {
            return true;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.loaded = 'true';
            return true;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage('播放源加载失败，请稍后重试或更换浏览器。');
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                }
            });
            video.dataset.loaded = 'true';
            return true;
        }

        setMessage('当前浏览器不支持 HLS 播放。');
        return false;
    }

    function startPlay() {
        if (!loadSource()) {
            return;
        }
        if (shell) {
            shell.classList.add('is-playing');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setMessage('浏览器阻止了自动播放，请再次点击视频播放按钮。');
            });
        }
    }

    if (button) {
        button.addEventListener('click', startPlay);
    }

    video.addEventListener('play', function () {
        if (shell) {
            shell.classList.add('is-playing');
        }
        setMessage('');
    });

    video.addEventListener('error', function () {
        setMessage('视频播放出现错误，请刷新页面后重试。');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

ready(setupPlayer);

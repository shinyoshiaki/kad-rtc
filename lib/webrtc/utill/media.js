"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getLocalVideo(option) {
    return new Promise((resolve) => {
        navigator.getUserMedia = navigator.getUserMedia;
        navigator.mediaDevices
            .getUserMedia({
            audio: true,
            video: option || true
        })
            .then(stream => {
            resolve(stream);
        });
    });
}
exports.getLocalVideo = getLocalVideo;
function getLocalAudio() {
    return new Promise((resolve) => {
        navigator.getUserMedia = navigator.getUserMedia;
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then(stream => {
            resolve(stream);
        });
    });
}
exports.getLocalAudio = getLocalAudio;
function getLocalDesktop(option) {
    return new Promise((resolve) => {
        navigator.mediaDevices
            .getDisplayMedia({
            video: option || true
        })
            .then((stream) => {
            resolve(stream);
        });
    });
}
exports.getLocalDesktop = getLocalDesktop;
//# sourceMappingURL=media.js.map
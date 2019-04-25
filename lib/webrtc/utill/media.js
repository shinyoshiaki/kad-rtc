"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getLocalVideo(option) {
    return new Promise(function (resolve) {
        navigator.getUserMedia = navigator.getUserMedia;
        navigator.mediaDevices
            .getUserMedia({
            audio: true,
            video: option || true
        })
            .then(function (stream) {
            resolve(stream);
        });
    });
}
exports.getLocalVideo = getLocalVideo;
function getLocalAudio() {
    return new Promise(function (resolve) {
        navigator.getUserMedia = navigator.getUserMedia;
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then(function (stream) {
            resolve(stream);
        });
    });
}
exports.getLocalAudio = getLocalAudio;
function getLocalDesktop(option) {
    return new Promise(function (resolve) {
        navigator.mediaDevices
            .getDisplayMedia({
            video: option || true
        })
            .then(function (stream) {
            resolve(stream);
        });
    });
}
exports.getLocalDesktop = getLocalDesktop;
//# sourceMappingURL=media.js.map
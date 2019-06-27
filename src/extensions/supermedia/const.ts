import { abHash, jsonHash } from "../../utill/crypto";

export const interval = 500;

export const mimeType = `video/webm; codecs="opus,vp9"`;

export const abs2torrent = (abs: ArrayBuffer[]) =>
  abs.map((ab, i) => ({ i, v: abHash(ab) }));

export type Torrent = ReturnType<typeof abs2torrent>;

export const torrent2hash = (torrent: Torrent) => jsonHash(torrent);

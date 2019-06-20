import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate
} from "wrtc";

import { Pack, Wait } from "rx.mini";
import SetupServices from "./services";

export interface message {
  label: string | "datachannel";
  data: any;
  nodeId: string;
}

interface option {
  disable_stun: boolean;
  stream: MediaStream;
  track: MediaStreamTrack;
  nodeId: string;
  trickle: boolean;
}

export default class WebRTC {
  rtc: RTCPeerConnection;

  private pack = Pack();
  private event = this.pack.event;

  onSignal = this.event<any>();
  onConnect = this.event();
  onDisconnect = this.event();
  onData = this.event<message>();
  onAddTrack = this.event<MediaStream>();

  private wait4DC = new Wait<RTCDataChannel | undefined>();

  private dataChannels: { [key: string]: RTCDataChannel };

  nodeId: string;
  isConnected = false;
  isDisconnected = false;
  isOffer = false;

  remoteStream: MediaStream | undefined;
  timeoutPing: any | undefined;

  services = SetupServices();

  constructor(public opt: Partial<option> = {}) {
    const { nodeId, stream, track } = opt;
    const { arrayBufferService } = this.services;

    this.dataChannels = {};
    this.nodeId = nodeId || "peer";

    this.rtc = this.prepareNewConnection();

    if (stream) {
      stream.getTracks().forEach(track => this.rtc.addTrack(track, stream));
    } else if (track) {
      this.rtc.addTrack(track);
    }

    arrayBufferService.listen(this);
  }

  private prepareNewConnection() {
    const { disable_stun, trickle } = this.opt;

    const peer: RTCPeerConnection = disable_stun
      ? new RTCPeerConnection({
          iceServers: []
        })
      : new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302"
            }
          ]
        });

    peer.ontrack = evt => {
      const stream = evt.streams[0];
      this.onAddTrack.execute(stream);
      this.remoteStream = stream;
    };

    peer.oniceconnectionstatechange = () => {
      switch (peer.iceConnectionState) {
        case "failed":
          break;
        case "disconnected":
          if (this.rtc)
            try {
              this.timeoutPing = setTimeout(() => {
                this.hangUp();
              }, 2000);

              this.send("ping", "live");
            } catch (error) {
              console.warn("disconnected", { error });
            }
          break;
        case "connected":
          if (this.timeoutPing) clearTimeout(this.timeoutPing);
          break;
        case "closed":
          break;
        case "completed":
          break;
      }
    };

    peer.onicecandidate = evt => {
      if (!this.isConnected) {
        if (evt.candidate) {
          if (trickle) {
            this.onSignal.execute({ type: "candidate", ice: evt.candidate });
          }
        } else {
          if (!trickle && peer.localDescription) {
            this.onSignal.execute(peer.localDescription);
          }
        }
      }
    };

    peer.ondatachannel = evt => {
      const dataChannel = evt.channel;
      this.dataChannels[dataChannel.label] = dataChannel;
      this.dataChannelEvents(dataChannel);
    };

    peer.onsignalingstatechange = e => {
      this.negotiating = peer.signalingState != "stable";
    };

    return peer;
  }

  hangUp() {
    this.isDisconnected = true;
    this.isConnected = false;
    this.onDisconnect.execute({});
    this.disconnect();
  }

  makeOffer() {
    this.isOffer = true;
    const { trickle } = this.opt;
    this.createDatachannel("datachannel");

    this.rtc.onnegotiationneeded = async () => {
      if (this.negotiating || this.rtc.signalingState != "stable") return;
      this.negotiating = true;

      const sdp = await this.rtc.createOffer().catch(console.warn);

      if (!sdp) return;

      const result = await this.rtc.setLocalDescription(sdp).catch(() => "err");
      if (result) return;

      const local = this.rtc.localDescription;

      if (trickle && local) {
        this.onSignal.execute(local);
      }

      this.negotiationSetting();
    };
  }

  negotiating = false;
  private negotiationSetting() {
    this.rtc.onnegotiationneeded = async () => {
      if (!this.isConnected) return;
      if (this.negotiating || this.rtc.signalingState != "stable") return;

      this.negotiating = true;

      const offer = await this.rtc.createOffer({}).catch(console.warn);
      if (!offer) return;

      const err = await this.rtc.setLocalDescription(offer).catch(() => "err");
      if (err) return;

      const local = this.rtc.localDescription;
      if (local) this.send(JSON.stringify(local), "update");

      this.negotiating = false;
    };
  }

  private async setAnswer(sdp: any) {
    await this.rtc
      .setRemoteDescription(new RTCSessionDescription(sdp))
      .catch(console.warn);
  }

  private async makeAnswer(offer: any) {
    const { trickle } = this.opt;

    const err = await this.rtc
      .setRemoteDescription(new RTCSessionDescription(offer))
      .catch(() => "err");
    if (err) return;

    const answer = await this.rtc.createAnswer().catch(console.warn);
    if (!answer) return;

    await this.rtc.setLocalDescription(answer).catch(console.warn);

    const local = this.rtc.localDescription;
    if (!local) return;

    if (this.isConnected) this.send(JSON.stringify(local), "update");
    else if (trickle) this.onSignal.execute(local);

    this.negotiationSetting();
  }

  async setSdp(sdp: any) {
    switch (sdp.type) {
      case "offer":
        this.makeAnswer(sdp);
        break;
      case "answer":
        this.setAnswer(sdp);
        break;
      case "candidate":
        await this.rtc
          .addIceCandidate(new RTCIceCandidate(sdp.ice))
          .catch(console.warn);
        break;
    }
  }

  private isDCOpend = (label: string) => {
    const dc = this.dataChannels[label];
    if (dc) {
      return dc.readyState === "open";
    }
    return false;
  };

  private async createDatachannel(label: string) {
    const wait = async () => {
      try {
        const dc = this.rtc.createDataChannel(label);
        await this.dataChannelEvents(dc);
        if (dc.readyState === "open") return dc;
      } catch (dce) {
        console.error(dce);
      }
    };

    if (!this.isDCOpend(label)) {
      const { exist, result } = await this.wait4DC.create(label, wait);

      if (exist) {
        const res = await exist.asPromise().catch(() => {});
        if (res) this.dataChannels[label] = res;
      }
      if (result) {
        this.dataChannels[label] = result;
      }
    }
  }

  private dataChannelEvents(channel: RTCDataChannel) {
    return new Promise(resolve => {
      channel.onopen = () => {
        if (!this.isConnected) {
          this.isConnected = true;
          this.onConnect.executeNull();
        }
        resolve();
      };

      channel.onmessage = async event => {
        if (!event) return;
        try {
          if (channel.label === "update") {
            const sdp = JSON.parse(event.data);
            this.setSdp(sdp);
          } else if (channel.label === "live") {
            if (event.data === "ping") this.send("pong", "live");
            else if (this.timeoutPing) clearTimeout(this.timeoutPing);
          } else {
            this.onData.execute({
              label: channel.label as string | "datachannel",
              data: event.data,
              nodeId: this.nodeId
            });
          }
        } catch (error) {
          console.warn(error);
        }
      };

      channel.onerror = err => console.warn(err);
      channel.onclose = () => {};
    });
  }

  async send(data: string | ArrayBuffer | Buffer, label = "datachannel") {
    const { arrayBufferService } = this.services;
    const sendData = async () => {
      try {
        if (typeof data === "string") {
          const err = await this.createDatachannel(label).catch(() => "error");
          if (err) return err;
          this.dataChannels[label].send(data);
        } else {
          if (data.byteLength > 16000) {
            const err = await this.createDatachannel(
              arrayBufferService.label
            ).catch(() => "error");
            if (err) return err;
            arrayBufferService.send(
              data,
              label,
              this.dataChannels[arrayBufferService.label]
            );
          } else {
            const err = await this.createDatachannel(label).catch(
              () => "error"
            );
            if (err) return err;
            this.dataChannels[label].send(data);
          }
        }
      } catch (error) {
        return "unhandle datachannel error";
      }
    };

    const err = await sendData();
    if (err) {
      console.warn("retry send data channel");
      await new Promise(r => setTimeout(r, 10));
      const error = await sendData();
      console.warn("fail", error, (data as Buffer).length);
    }
  }

  addTrack(track: MediaStreamTrack, stream: MediaStream) {
    this.rtc.addTrack(track, stream);
  }

  private disconnect() {
    const { rtc, dataChannels } = this;

    if (!rtc) return;

    for (let key in dataChannels) {
      const channel = dataChannels[key];
      channel.onmessage = null;
      channel.onopen = null;
      channel.onclose = null;
      channel.onerror = null;
      channel.close();
    }
    // this.dataChannels = null as any;

    rtc.oniceconnectionstatechange = null;
    rtc.onicegatheringstatechange = null;
    rtc.onsignalingstatechange = null;
    rtc.onicecandidate = null;
    rtc.ontrack = null;
    rtc.ondatachannel = null;
    rtc.close();
    this.rtc = null as any;

    this.pack.finishAll();
  }
}

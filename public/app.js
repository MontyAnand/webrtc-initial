const socket = io();
var id;
var room;

const form = document.getElementById("loginForm");
const startButton = document.getElementById("startButton");
const hangupButton = document.getElementById("hangupButton");
const notify = document.getElementById("notify");

const iceConfiguration = {
    iceServers: [
        {
            urls: [
                'STUN:stun.f.haeder.net:3478'
            ],
        }
    ]
}


const peerConnection = new RTCPeerConnection(iceConfiguration);

peerConnection.addEventListener("negotiationneeded", async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { room: room, offer });
});

peerConnection.ontrack = (event) => {
    console.log("Data sent");
    const video = document.getElementById("remoteVideo");
    video.srcObject = event.streams[0];
}


socket.on("connection", async (data) => {
    console.log("Connected");
});

socket.on("message", async (data) => {
    console.log("Data fom server : ", data);
});

socket.on("alert", async (data) => {
    alert("joined");
    notify.style.display = "none";
    startButton.style.display = "block";
    hangupButton.style.display = "block";
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { room: room, offer: offer });
})

socket.on("offer", async (offer) => {
    notify.style.display = "none";
    startButton.style.display = "block";
    hangupButton.style.display = "block";
    alert("Offer received");
    console.log(offer);
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", { room: room, answer: answer });
});

socket.on("answer", async (answer) => {
    alert("Answer received");
    await peerConnection.setRemoteDescription(answer);
})

form.onsubmit = (e) => {
    e.preventDefault();
    console.log("Clicked");
    const formData = new FormData(e.target);
    id = formData.get("username");
    room = formData.get("roomId");
    const loginContainer = document.getElementById("loginPage");
    const videoContainer = document.getElementById("videoCall");
    loginContainer.style.display = "none";
    videoContainer.style.display = "table";
    socket.emit("join", room);
}

startButton.addEventListener("click", (e) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((mediastream) => {
            const videoElement = document.getElementById("localVideo");
            videoElement.srcObject = mediastream;
            mediastream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, mediastream);
            });
        }).catch((e) => {
            alert(e);
        });
});
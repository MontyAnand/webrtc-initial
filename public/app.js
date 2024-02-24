const socket = io();
const iceConfiguration = {
    iceServers: [
        {
            urls: [
                'STUN:stun.f.haeder.net:3478'
            ],
        }
    ]
}

var room;

const peerConnection = new RTCPeerConnection(iceConfiguration);

peerConnection.addEventListener("negotiationneeded", async ()=>{
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer",{room: room, offer});
});

peerConnection.ontrack = (event)=>{
    console.log("Data sent");
    const video = document.getElementById("video");
    video.srcObject = event.streams[0];
}


socket.on("connection",async (data)=>{
    console.log("Connected");
});

socket.on("message", async (data)=>{
    console.log("Data fom server : ",data);
});

socket.on("alert",(data)=>{
    alert("joined");
})

socket.on("offer", async (offer)=>{
    alert("Offer received");
    console.log(offer);
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer" , {room:room, answer:answer});
});

socket.on("answer", async (answer)=>{
    alert("Answer received");
    await peerConnection.setRemoteDescription(answer);
})

const enter_button = document.getElementById("enter-button");
const call_button = document.getElementById("call-button");
const start_button  = document.getElementById("start-button");

enter_button.addEventListener("click", ()=>{
    room = document.getElementById("email").value;
    socket.emit("join",room);
});

call_button.addEventListener("click", async ()=>{
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", {room: room,offer:offer});
});

start_button.addEventListener("click",async ()=>{
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(
        (stream) =>{
            stream.getTracks().forEach((track)=>{
                peerConnection.addTrack(track,stream);
            });
        }).catch((err) =>{
            alert("Error occur during getUserMedia");
        });
});
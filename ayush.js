console.log('Spotify Running Successfully');
let currentSong = new Audio();
let songs;
let currFolder;

function SecondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

//   // Example usage:
//   const seconds = 125;
//   const timeString = convertSecondsToMinutesAndSeconds(seconds);
//   console.log(timeString); // Output: "02:05"


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}`);

    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all songs in playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" style="padding-right: 8px;" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Ayush</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="cplay" src="img/cplay.svg" alt="">
            </div>
            </li>`;
    }

    //attach an event list 
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    // let audio=new Audio("/songs/"+track);
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        // document.querySelector(".playnow").getElementsByTagName("span").innerHTML="Playing"
        playS.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track.replace(".mp3", ""))
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors);
    for (let index = 2; index < array.length; index++) {
        const e = array[index];
        // if(e.href!="http://127.0.0.1:5500/")console.log(e.href)

        if (e.href.includes("/songs") && !e.href.includes(".htaccess") && e.href!="/") {
            let folder = e.href.split("/").slice(-1)[0]

            // console.log(e.href.split("/").slice(-2)[0])

            //get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.5 16V8L16 12L9.5 16Z" stroke="#141B34" stroke-width="3"
                        stroke-linejoin="miter" fill="#141B34" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="not found" />

            <h2 style="font-weight: bold; font-size: 25px;">${response.title}</h2>
            <p style="color: #a7a7a7; font-size: 13px;">${response.description}</p>
            </div>`

        }

    }
    //load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })

}
async function main() {
    await getSongs("songs/romantic")
    // songs = await getSongs("songs/a")

    playMusic(songs[Math.floor(Math.random() * songs.length)],true)

    //display all the albums on the page
    await displayAlbums()

    //attach an event listener to play,next,prev
    playS.addEventListener("click", () => {
        if (currentSong.paused) {
            playS.src = "img/pause.svg"
            currentSong.play()
        }
        else {
            playS.src = "img/cplay.svg"
            currentSong.pause()
        }
    })

    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);

        document.querySelector(".songtime").innerHTML = `${SecondsToMinutesSeconds(currentSong.currentTime)} / ${SecondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        //css for circle
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {

        if (window.innerWidth < 1200) {
            document.querySelector(".left").style.left = "-120%"
            document.querySelector(".left").style.transition = "all 1s"
        }
    })
    //add an event listener for prev 
    document.getElementById("previous").addEventListener("click", () => {
        console.log("Previous Clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index > 0) {
            playMusic(songs[index - 1])
        }
        else { playMusic(songs[songs.length - 1]) }
    })

    //add an event listener for next
    document.getElementById("next").addEventListener("click", () => {
        console.log("Next Clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs,index)

        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
        else { playMusic(songs[0]) }

    })

    // //add an event listener to volume
    // document.getElementsByTagName("input")[0].addEventListener("change", (e) => {
    //     console.log("Volume: ", e.target.value)
    //     currentSong.volume = parseInt(e.target.value) / 100  //range bw 0 and 1
    // })


    //add event listener for mute
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target.src)

        if (e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.getElementsByTagName("input")[0].value=0;
            document.querySelector(".slider").style.background = `linear-gradient(to right, white 0%, white 0%, black 0%, black 100%)`;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.2;
            document.querySelector(".slider").value = currentSong.volume * 100
            document.querySelector(".slider").style.background = `linear-gradient(to right, white 0%, white 20%, black 20%, black 100%)`;
            document.querySelector(".slider").style.value = `0`;
        }
    })

    document.getElementsByClassName("slider").oninput = function () {
        var value = (this.value - this.min) / (this.max - this.min) * 100
        this.style.background = 'linear-gradient(to right, #82CFD0 0%, #82CFD0 ' + value + '%, #fff ' + value + '%, white 100%)'
    };

    // Add an event listener for volume change
    document.querySelector("input[type='range']").addEventListener("input", function () {
        // Update the volume based on the slider position
        currentSong.volume = this.value / 100;

        // Update the slider position
        this.style.background = `linear-gradient(to right, white 0%, white ${this.value}%, black ${this.value}%, black 100%)`;

    });

}
main()

// let s = document.createElement("style");
// document.head.appendChild(s);
// itr.addEventListener("input", () => {
// s.textContent = `.slider::-webkit-slider-thumb{background-color: hsl(${itr.value}, 100%, 50%)}`
// })
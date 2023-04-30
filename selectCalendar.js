import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.21.0/+esm';

async function initSupabase() {
  const SUPABASE_URL = 'https://whwkeouhmenvcbjwgbqq.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod2tlb3VobWVudmNiandnYnFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4Mjc3OTg5MywiZXhwIjoxOTk4MzU1ODkzfQ.kcp9RCb5ItbzXlfPPZq-ZyufQQJcgVnaLyIq8_vsSUA';

  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

let supabaseClient = await initSupabase();

// const { data, error } = await supabaseClient
//     .from('Events')
//     .insert([
//       { Name: "battle"},
//     ]);
//   console.log(data, error);

let outDays;
let outTimes;
let didSelectedTimesChange = false;
let values = []; // This will store all the selected times

const columns = document.querySelectorAll(".day");
let dayStates = Array(7).fill(false);
const dayEnum = ["S", "M", "Tu", "W", "Th", "F", "S"];



columns.forEach((col, i) => {
    col.addEventListener("mousedown", () => {
        dayStates[i] = !dayStates[i];
    })
    
})

onmousedown = () => {
    columns.forEach((col, i) => {
        if(dayStates[i]) {
            col.style.backgroundColor = "#159b42";
        } else {
            col.style.backgroundColor = "#fe6f6f";

        }
    })

}

async function formatTime(num) {
    let hours = Math.floor(num / 100);
    let minutes = num % 100;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}


const createEventbtn = document.getElementById("create-event-btn");

createEventbtn.onclick = async (e) => {
    e.preventDefault();


    // Sanitization of input
    const fromTime = parseInt(document.getElementById("from").value);
    const toTime = parseInt(document.getElementById("to").value);
    if(fromTime >= toTime) return;

    // 11:00 -> 1100

    // 1:30 -> 1330

    // 2:30 -> 1430

    const eventName = document.getElementById("eventname").value;
    if(!eventName || !dayStates.some((el) => {return Boolean(el)})) return;


    let { data, error } = await supabaseClient
    .from('Events')
    .insert([
      { Name: eventName},
    ]);
    console.log(data, error);

    const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];

    let fromTimeFormatted = await formatTime(fromTime);
    let toTimeFormatted = await formatTime(toTime);

    let fromIdx = times.indexOf(fromTimeFormatted);
    let toIdx = times.indexOf(toTimeFormatted);

    outTimes = times.slice(fromIdx, toIdx + 1);
    outDays = [];

    dayStates.forEach((day, i) => {
        if(day) {
            outDays.push(dayEnum[i])
        }
    })

    const reqs = [];

    outDays.forEach((day) => {
        outTimes.forEach((time) => {
            reqs.push({Event: eventName, Day: day, Time: time, UserID: null})
        })
    });

    console.log(reqs);

    const { data1, error1 } = ( await supabaseClient
    .from('Times')
    .insert(
      reqs,
    ));
    console.log(data1, error1);

    document.getElementById("group-event").style.display = "flex";

    document.querySelector("#group-event h3").innerText = "Your schedule for " +  eventName;

    document.getElementById("setup").style.display = "none";
}

const updateSelectedTimes = (event) => {

}


const nameBtn = document.getElementById("auth-submit");

let username;
nameBtn.onclick = async (e) => {
    e.preventDefault();

    if(!document.getElementById("username").value) return;

    username = document.getElementById("username").value

    document.getElementById("auth").style.display = "none";

    const fromTime = parseInt(document.getElementById("from").value);
    const toTime = parseInt(document.getElementById("to").value);

    const eventName = document.getElementById("eventname").value;

    // Account for half hours being kinda weird
    const userCalendar = document.getElementById("user-calendar");
    let atHalfHour = fromTime.toString().charAt(fromTime.toString().length - 2) == "3";

    const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];

    let fromTimeFormatted = await formatTime(fromTime);
    let toTimeFormatted = await formatTime(toTime);

    let fromIdx = times.indexOf(fromTimeFormatted);
    let toIdx = times.indexOf(toTimeFormatted);

    let numRows = toIdx - fromIdx + 1;


    let numCols = 0;

    // CONSTRUCT THE CALENDAR topmost light blue headers based on number of days
    let out = `<div class='day-header'></div>`
    for(let i = 0; i < 7; i++) {
        if(!dayStates[i]) continue;
        
        out += `<div class="day-header">${dayEnum[i]}</div>`;
        numCols += 1;
    }

    let currTime = fromTime;

    // Times (left most column light blue)
    out += "<div>";
    for(let i = 0; i < numRows; i++) {
        let s = currTime.toString().slice(0, -2) + ":" + currTime.toString().slice(-2);

        out += `<div draggable="false" class='cell cell-time'>${s}</div>`;
        if(atHalfHour) {
            currTime += 70;
        } else {
            currTime += 30;
        }
        atHalfHour = !atHalfHour;
    }

    out += "</div>";

    // The actual clickable times of day
    for(let i = 0; i < 8; i++) {

        if(!dayStates[i]) continue;

        out += `<div draggable="false" class='cell-col'>`;

        for(let j = 0; j < numRows; j++) {
            out += `<div class='cell'></div>`
        }
        out += "</div>"

    }


    // Update them
    userCalendar.style.gridTemplateColumns = `1fr repeat(${numCols}, 2fr)`;
    userCalendar.innerHTML = out;

    const cols = document.querySelectorAll("#user-calendar .cell-col");
    cols.forEach((col) => {
        values.push([Array(col.children.length).fill(false)]);
    })

    console.log("Values initialized as, ", values);

        // WIP RESET BUTTON
    // document.getElementById("reset-calendar").onclick = (event) => {
    //     event.preventDefault();
    //     values = [];
    
    //     cols.forEach((col) => {
    //         values.push([Array(col.children.length).fill(false)]);

    //     })

    // }

    document.querySelector(".user-calendar-settings").style.display = "block";

    // userCalendarSettings

    // DRAGGING AND SELECTING TIMES
    let selectedTimes = [];
    let isDragging = false;

    let tabs = [];

    cols.forEach((col) => {
        let toPush = [];

        for(let i = 0; i < col.children.length; i++) {
            toPush.push(col.children[i]);
        }

        tabs.push(toPush);

    });



    onmousedown = () => {
        isDragging = true;
    }

    onmouseup = () => {
        isDragging = false;
        didSelectedTimesChange = true;
    }

    // {"M": [{900: true, 930: true., ,}]}
    let cloned;
    tabs.forEach((col, i) => {
        col.forEach((tab, j) => {
            tab.addEventListener("mouseenter", (event) => {
                if(!isDragging) return;
                tab.classList.toggle("selected");
                console.log(`changing values index i =${i} index y = ${j}`)
                cloned = values[i];
                cloned[j] = !cloned[j];
                console.log("cloned", cloned.length, cloned);
                values[i][j] = !values[i][j];
                console.log("values updated as ,", values);
            })

            tab.addEventListener("mousedown", (event) => {
                tab.classList.toggle("selected")
                console.log(`changing values index i =${i} index y = ${j}`)
                cloned = values[i];
                cloned[j] = !cloned[j];
                console.log("cloned", cloned.length, cloned);
                values[i][j] = values[i][j];
                console.log("values updated as ,", values);
                
            })

        })
    })


    
    const groupCalendar = document.getElementById("group-calendar");

    groupCalendar.style.gridTemplateColumns = `1fr repeat(${numCols}, 2fr)`;

    groupCalendar.innerHTML = out;

//              M            Friday
// values = [[t, t, f], [t, f, f]...]





    setInterval(async () => {
        if(didSelectedTimesChange) {
            values.forEach((day, i) => {
                day.forEach((time, j) => {
                    if(time) {
                        selectedTimes.push({Day: outDays[i], Time: outTimes[j], Event: eventName, UserID: username});
                    }
                })
            })


            console.log(selectedTimes);
            const { data1, error1 } = ( await supabaseClient
                .from('Times')
                .insert(
                  selectedTimes,
                ));
            console.log(data1, error1)
        
        
        
            let AvailableCounter = {}
            outDays.forEach((day) => {
                AvailableCounter[day] = {};
                outTimes.forEach((time) => {
                    AvailableCounter[day][time] = [] // Use day instead of "day"
                })
            });
        
            const { data, error } = await supabaseClient
            .from('Times')
            .select()
            .not('UserID', 'is', null)
            console.log('read combined times', data, error)
        

            didSelectedTimesChange = false;
        }


    }, 1000) 
}


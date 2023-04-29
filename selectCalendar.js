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


const columns = document.querySelectorAll(".day");
let dayStates = Array(7).fill(false);


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

    let atHalfHour = fromTime.toString().charAt(fromTime.toString().length - 2) == "3";
    let numRows;

    if(atHalfHour) {
        numRows = 1 + (toTime - fromTime + 70) / 50;
    } else {
        numRows = (toTime - fromTime + 30) / 30;
    }



    // const reqs = {
    //     ID: "",
    //     Time: "",
    //     Day: "",
    //     Event: "",
    //     UserID: null
    // }

    // ({ data, error }) = ( await supabaseClient
    // .from('Times')
    // .insert([
    //   reqs,
    // ]));
    // console.log(data, error);


    


    document.getElementById("group-event").style.display = "flex";

    document.querySelector("#group-event h3").innerText = "Your schedule for " +  eventName;

    document.getElementById("setup").style.display = "none";
}


const nameBtn = document.getElementById("auth-submit");

let values;
nameBtn.onclick = (e) => {
    e.preventDefault();

    if(!document.getElementById("username").value) return;

    document.getElementById("auth").style.display = "none";

    // ------------------------------------
    // GET HTTP STUFF HERE FROM DATABASE
    // ------------------------------------


    const fromTime = parseInt(document.getElementById("from").value);
    const toTime = parseInt(document.getElementById("to").value);

    const eventName = document.getElementById("eventname").value;

    // Account for half hours being kinda weird
    const userCalendar = document.getElementById("user-calendar");
    let atHalfHour = fromTime.toString().charAt(fromTime.toString().length - 2) == "3";
    let numRows;

    if(atHalfHour) {
        numRows = 1 + (toTime - fromTime + 70) / 50;
    } else {
        numRows = (toTime - fromTime + 30) / 30;
    }

    const dayEnum = ["S", "M", "Tu", "W", "Th", "F", "S"];

    let numCols = 0;

    // CONSTRUCT THE CALENDAR based on number of rows, cols, times, etc.
    let out = `<div class='day-header'></div>`
    for(let i = 0; i < 7; i++) {
        if(!dayStates[i]) continue;
        
        out += `<div class="day-header">${dayEnum[i]}</div>`;
        numCols += 1;
    }

    let currTime = fromTime;

    // Times (left most column)
    out += "<div>";
    for(let i = 0; i < numRows; i++) {
        s = currTime.toString().slice(0, -2) + ":" + currTime.toString().slice(-2);

        out += `<div draggable="false" class='cell cell-time'>${s}</div>`;
        if(atHalfHour) {
            currTime += 70;
        } else {
            currTime += 30;
        }
        atHalfHour = !atHalfHour;
    }

    out += "</div>";

    // The actual days and selectable cells
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

    // DRAGGING AND SELECTING TIMES
    const cols = document.querySelectorAll("#user-calendar .cell-col");
    values = []; // This will store all the highlighted stuff
    let isDragging = false;

    cols.forEach((col) => {
        values.push([Array(col.children.length).fill(false)]);
    })

    let tabs = [];

    cols.forEach((col) => {
        let toPush = [];

        for(let i = 0; i < col.children.length; i++) {
            toPush.push(col.children[i]);
        }

        tabs.push(toPush);

    });

    // WIP RESET BUTTON
    // document.getElementById("reset-calendar").onclick = (event) => {
    //     event.preventDefault();
    //     values = [];
    
    //     cols.forEach((col) => {
    //         values.push([Array(col.children.length).fill(false)]);

    //     })

    // }

    onmousedown = () => {
        isDragging = true;
    }

    onmouseup = () => {
        isDragging = false;
    }

    tabs.forEach((col, i) => {
        col.forEach((tab, j) => {
            tab.addEventListener("mouseenter", (event) => {
                if(!isDragging) return;
                tab.classList.toggle("selected");
                values[i][j] = !values[i][j];
            })

            tab.addEventListener("mousedown", (event) => {
                tab.classList.toggle("selected")
                values[i][j] = !values[i][j];
            })

        })
    })
}


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
const dayEnum = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];



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

    const flavour = document.getElementById("flavour-text")


    // Sanitization of input
    const fromTime = parseInt(document.getElementById("from").value);
    const toTime = parseInt(document.getElementById("to").value);
    if(fromTime >= toTime) {
        flavour.innerText = "The starting time has to come before the ending time!"
        return
    }

    const eventName = document.getElementById("eventname").value;
    if(!eventName) {
        flavour.innerText = "That's not a very good event name! (Please insert a valid one)"
        return
    }
    
    if(!dayStates.some((el) => {return Boolean(el)})) {
        flavour.innerText = "Please select at LEAST one available day from the calendar on the left!"
        return
    }


    let { data, error } = await supabaseClient
    .from('Events')
    .insert([
      { Name: eventName},
    ]);
    // console.log(data, error);

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

    // console.log(reqs);

    // const { data1, error1 } = ( await supabaseClient
    // .from('Times')
    // .insert(
    //   reqs,
    // ));
    // console.log(data1, error1);

    document.getElementById("group-event").style.display = "flex";

    document.querySelector("#group-event h3").innerText = "Your schedule for " +  eventName;

    document.getElementById("setup").style.display = "none";
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
        values.push(Array(col.children.length).fill(false));
    })


    document.getElementById("reset-calendar").onclick = (event) => {
        event.preventDefault();

        values = [];
    
        cols.forEach((col) => {
            values.push(Array(col.children.length).fill(false));

        })

        tabs.forEach((col) => {
            
            col.forEach((tab) => {       
                tab.classList.remove("selected");
        
        })})

    }

    document.querySelector(".user-calendar-settings").style.display = "block";

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


    
    const groupCalendar = document.getElementById("group-calendar");

    groupCalendar.style.gridTemplateColumns = `1fr repeat(${numCols}, 2fr)`;

    groupCalendar.innerHTML = out;



    // Right Calendar
    let groupCols = document.querySelectorAll("#group-calendar .cell-col");

    let groupTabs = [];

    groupCols.forEach((col) => {
        let toPush = [];

        for(let i = 0; i < col.children.length; i++) {
            toPush.push(col.children[i]);
        }

        groupTabs.push(toPush);

    });

    // TEMPORARY: THIS MIRRORS THE ACTIVITY ON THE LEFT CALENDAR ONTO THE RIGHT ONE
    setInterval(() => {
        if(!didSelectedTimesChange) return;

        groupTabs.forEach((col, i) => {
            col.forEach((tab, j) => {

                if(values[i][j]) { 
                    tab.classList.add("selected-by-user");
                } else {
                    tab.classList.remove("selected-by-user");

                }
            })

        didSelectedTimesChange = false;

    })}, 1000)


    const heatmap = [];

    cols.forEach((col) => {
        heatmap.push(Array(col.children.length).fill(0));
    })


    heatmap.forEach((col, i) => {
        col.forEach((entry, j) => {
            
            let crowdedness = Math.floor(Math.random() * 7);

            heatmap[i][j] = crowdedness;

        })

    })

    console.log(heatmap);



    setInterval(async () => {

        // if(!didSelectedTimesChange) return;

        
        for(let i = 0; i < heatmap.length; i++) {
            for(let j = 0; j < heatmap[i].length; j++) {
                if(values[i][j]) {
                    heatmap[i][j] += 1;
                }

            }
        }

        // console.log(heatmap);

        didSelectedTimesChange = false;


        let allUnselected = true;
       for(let i = 0; i < values.length; i++) {
        for(let j = 0; j < values[i].length; j++) {
            if(values[i][j]) {
                allUnselected = false;
            }
        }

       }



        groupTabs.forEach((col, i) => {
            col.forEach((tab, j) => {

                if(!allUnselected) {
                    tab.classList.add("darken")
                } else {
                    tab.classList.remove("darken")
                }
              if (heatmap[i][j] >= 5) {
                tab.classList.add(`selected-4`);
                
              } else {
                tab.classList.add(`selected-${heatmap[i][j]}`);
              }
            });
          });
        
        // values.forEach((day, i) => {
        //     day.forEach((time, j) => {
        //         if(time) {
        //             selectedTimes.push({Day: outDays[i], Time: outTimes[j], Event: eventName, UserID: username});
        //         }
        //     })
        // })

        // async function getData () {
        //     let { data3, error3 } = await supabaseClient
        //     .from('Times')
        //     .select()
        //     .eq("Event", eventName);
    
        //     console.log(data3);

        //     if(data3) {
        //         data3.forEach((entry) => {
        //             if(!entry["UserID"]) return;

        //             if(entry["Event"] === "This is my event") console.log("HEY!");
        
        //             console.log("ENTRY", entry);
                        
        //         })
        //     }


        // }

        // getData();






        // // console.log(selectedTimes);
        // // const { data1, error1 } = ( await supabaseClient
        // //     .from('Times')
        // //     .insert(
        // //       selectedTimes,
        // //     ));
    
    
    
        // let AvailableCounter = {}
        // outDays.forEach((day) => {
        //     AvailableCounter[day] = {};
        //     outTimes.forEach((time) => {
        //         AvailableCounter[day][time] = [] // Use day instead of "day"
        //     })
        // });
    
        // const { data, error } = await supabaseClient
        // .from('Times')
        // .select()
        // .not('UserID', 'is', null)

        // console.log(data);
    

        // didSelectedTimesChange = false;
        


    }, 1000) 
}


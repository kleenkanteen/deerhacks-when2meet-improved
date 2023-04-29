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



const btn = document.getElementById("create-event-btn");

btn.onclick = (e) => {
    e.preventDefault();

    const fromTime = parseInt(document.getElementById("from").value);
    const toTime = parseInt(document.getElementById("to").value);
    if(fromTime >= toTime) return;

    const eventName = document.getElementById("eventname").value;
    if(!eventName || !dayStates.some((el) => {return Boolean(el)})) return;

    document.querySelector("#group-event h3").innerText = eventName;

    const userCalendar = document.getElementById("user-calendar");
    let atHalfHour = fromTime.toString().charAt(fromTime.toString().length - 2) == "3";
    let numRows;

    if(atHalfHour) {
        numRows = 1;
        numRows += (toTime - fromTime + 70) / 50;
    } else {
        numRows += (toTime - fromTime + 50) / 50;
    }

    const dayEnum = ["S", "M", "Tu", "W", "Th", "F", "S"];

    let numCols = 0;

    let out = `<div class='day-header'></div>`

    for(let i = 0; i < 7; i++) {
        if(!dayStates[i]) continue;
        
        out += `<div class="day-header">${dayEnum[i]}</div>`;
        numCols += 1;

    }

    let currTime = fromTime;

    out += "<div class=''>";
    for(let i = 0; i < numRows; i++) {
        s = currTime.toString().slice(0, -2) + ":" + currTime.toString().slice(-2);

        out += `<div class='cell cell-time'>${s}</div>`;
        if(atHalfHour) {
            currTime += 70;
        } else {
            currTime += 30;
        }
        atHalfHour = !atHalfHour;
    }

    out += "</div>";

    for(let i = 0; i < 8; i++) {

        if(!dayStates[i]) continue;

        out += `<div class="">`;

        for(let j = 0; j < numRows; j++) {
            out += `<div class='cell'></div>`
        }
        out += "</div>"

    }

    userCalendar.style.gridTemplateColumns = `1fr repeat(${numCols}, 2fr)`;
    userCalendar.innerHTML = out;


}


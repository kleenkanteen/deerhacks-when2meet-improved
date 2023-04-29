const columns = document.querySelectorAll(".day");
const states = Array(7).fill(false);


columns.forEach((col, i) => {
    col.addEventListener("mousedown", () => {
        states[i] = !states[i];
    })
    
})

onmousedown = () => {
    columns.forEach((col, i) => {
        if(states[i]) {
            col.style.backgroundColor = "#159b42";
        } else {
            col.style.backgroundColor = "lightcoral";

        }
    })

}

let currentMode = "Globe"

export function modeChange(){
    document.addEventListener("keydown", (e)=>{
        if(e ==='Escape'){
            console.log("esc is pressed")
        }
    })
}
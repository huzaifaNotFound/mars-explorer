let currentMode = "Globe"
const btn = document.getElementById("btn")
export function modeChange(){
    document.addEventListener("keydown", (e)=>{
        if(e.key ==='Enter'){
            console.log(btn)
        }
    })
}
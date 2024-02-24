console.log("login.js");

let content = "Are you still thinking......!.?"

let input = document.querySelector("#team_name");
let form = document.querySelector(".form");
let big_cloud = document.querySelector(".text");
let interact = false
function writeContent(){
    let length = content.length;
    let index = 0;
    let text = ""
    setTimeout(() => {
        let interval = setInterval(() => {
            if (!interact) {
                text = text + content.charAt(index)
                big_cloud.innerHTML = text;
                index ++;
                if (index == length) {
                    clearInterval(interval);
                }
            }
        }, 100);
    }, 2000);
}

input.addEventListener("focus",()=>{
    input.parentElement.classList.add("active");
    form.classList.add("active");
    writeContent();
    document.querySelector(".cloud_box").classList.add("active");
});

input.addEventListener("blur",()=>{
    input.parentElement.classList.remove("active");
    form.classList.remove("active");
    document.querySelector(".cloud_box").classList.remove("active");
    big_cloud.innerHTML = "";
});

input.addEventListener("input",()=>{
    if (input.value != "") {
        interact = true;
        big_cloud.innerHTML = input.value;
    }else{
        big_cloud.innerHTML = "";
        interact = false;
        writeContent();
    }
})

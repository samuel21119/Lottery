const fs = require("fs");
const path = require("path");
const Chance = require("chance");
const {Parser} = require("json2csv");
const {remote, ipcRenderer} = require("electron");
const dialog = remote.dialog;
var chance = new Chance();
function hide_element(element, hide) {
    element.style.display = hide ? "none" : "block";
}
var stage = "main";
var lottery_mode = 1;
var groups = 0;
var download = "";
var stage = 0;
function animateCSS(element, animationName, callback) {
    const node = document.getElementById(element);
    node.classList.add("animated", animationName);

    function handleAnimationEnd() {
        node.classList.remove("animated", animationName);
        node.removeEventListener("animationend", handleAnimationEnd);

        if (typeof callback === "function") callback()
    }

    node.addEventListener("animationend", handleAnimationEnd);
}
function lottery_change(mode) {
    lottery_mode = mode;
    if (mode === 1) { // Default
        hide_element(document.getElementById("lottery_mode1"), false);
        hide_element(document.getElementById("lottery_mode2"), true);
    }else {           // Custom
        hide_element(document.getElementById("lottery_mode1"), true);
        hide_element(document.getElementById("lottery_mode2"), false);
    }
}
document.getElementById("scoreboard").addEventListener("click", function() {
    hide_element(document.getElementById("main"), true);
    hide_element(document.getElementById("home"), false);
    hide_element(document.getElementById("page_scoreboard"), false);
    stage = 2;
    if (groups === 0)
        add_group();
});
document.getElementById("lottery").addEventListener("click", function() {
    hide_element(document.getElementById("main"), true);
    hide_element(document.getElementById("home"), false);
    hide_element(document.getElementById("page_lottery"), false);
    stage = 1;
    lottery_change(1);
});
document.getElementById("lottery-reset").addEventListener("click", function() {
    document.getElementById("lottery_result").value = "";
});
document.getElementById("lottery-start").addEventListener("click", function() {
    var s = [];
    var cnt, same;
    if (lottery_mode === 1) {
        var start = parseInt(document.getElementById("lottery_start").value);
        var end = parseInt(document.getElementById("lottery_end").value);
        cnt = parseInt(document.getElementById("lottery_cnt1").value);
        same = document.getElementById("lottery_repeat1").checked;
        if (Number.isInteger(start) && Number.isInteger(end) && Number.isInteger(cnt) && start < end && cnt > 0)   
            for (var i = start; i <= end; i++)
                s.push(i);
        else
            return;
    }else {
        cnt = parseInt(document.getElementById("lottery_cnt2").value);
        same = document.getElementById("lottery_repeat2").checked;
        var lines = document.getElementById("lottery_opt").value.split("\n");
        var add = 0;
        for(var i = 0; i < lines.length; i++) {
            if (lines[i] !== "" && lines[i] !== undefined) {
                s.push(lines[i]);
                add++;
            }
        }
        if (add < 2 || cnt < 1)
            return;
    }
    var result = document.getElementById("lottery_result");
    while (cnt-- && s.length > 0) {
        //var rand = s[Math.floor(Math.random() * s.length)];
        var t = chance.integer({ min: 0, max: s.length-1 });
        var rand = s[(chance.integer({ min: 0, max: s.length-1 }) + t) % s.length];
        if (!same)
            s.splice(s.indexOf(rand), 1);
        result.value = document.getElementById("lottery_result").value + `${rand}\n`;
    }
    result.value = result.value + "-".repeat(15) + "\n";
    result.scrollTop = result.scrollHeight;
});
document.getElementById("d").addEventListener("change", function() {
    if (this.checked) {
        lottery_change(2);
    }else {
        lottery_change(1);
    }
})
var add_group = function() {
    groups++;
    var choose = document.getElementsByClassName("scoreview")[0];
    var cln = choose.cloneNode(true);
    var name = `group${groups}_score`;
    var id = `group${groups}`;
    cln.setAttribute("id", id);
    cln.classList.add("animated", "bounceIn");
    cln.getElementsByClassName("group_name")[0].value = `${GROUP_PREFIX}${groups}`;
    cln.getElementsByClassName("score_cnt")[0].setAttribute("id", name);
    cln.getElementsByClassName("score_cnt")[0].value = 0;
    cln.getElementsByClassName("addscore")[0].addEventListener("click", () => {
        var t = document.getElementById(name);
        t.value = parseInt(t.value) + 1;
    });
    cln.getElementsByClassName("minusscore")[0].addEventListener("click", () => {
        var t = document.getElementById(name);
        t.value = parseInt(t.value) - 1;
    });
    cln.getElementsByClassName("remove_outer")[0].addEventListener("click", () => {
        document.getElementById(id).classList.remove("bounceIn");
        animateCSS(id, "fadeOut", () => {
            document.getElementById(id).remove();
        })
    });
    cln.style.display = "block";
    document.getElementById("l").append(cln);
}
document.getElementById("add_group").addEventListener("click", add_group);
document.getElementById("home1").addEventListener("click", () => {
    hide_element(document.getElementById("main"), false);
    hide_element(document.getElementById("page_scoreboard"), true);
    hide_element(document.getElementById("page_lottery"), true);
    hide_element(document.getElementById("home"), true);
    stage = 0;
})


WIN = remote.getCurrentWindow();
ipcRenderer.on("Download-folder", (event, mesage) => {
    download = mesage;
});
ipcRenderer.on("Home", (event, mesage) => {
    if (stage !== 0)
        document.getElementById("home1").click();
});
ipcRenderer.on("Export", async (event, mesage) => {
    if (stage !== 2)
        return;
    let options = {
        //Placeholder 1
        title: "Save file - Scoreboard",
        //Placeholder 2
        defaultPath : path.join(download, "scoreboard.csv"),
         
        //Placeholder 4
        buttonLabel : "Save File",
         
         //Placeholder 3
        filters :[
            {name: "CSV", extensions: ["csv"]},
            {name: "All Files", extensions: ["*"]}
        ]
    }
    var filename = await dialog.showSaveDialog(WIN, options);
    try {
        filename = filename.filePath;
        var groups = document.getElementsByClassName("scoreview");
        var input = [];
        for (var i = 1; i < groups.length; i++) {
            input.push({
                "Group": groups[i].getElementsByClassName("group_name")[0].value,
                "Score": groups[i].getElementsByClassName("score_cnt")[0].value
            })
        }
        const parser = new Parser();
        const csv = parser.parse(input);
        fs.writeFile(filename, csv, {encoding: "utf8"}, (err) => {
            if (err) throw err;
        });
    }catch {

    }
});

import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { setupList } from "./mainList"
import "./style.css";

document.querySelector("#app").innerHTML = `<h3 style='text-align: center'>No character selected</h3>`;

OBR.onReady(() => {
  setupContextMenu();
  setupList(document.querySelector("#app"))
  
  // Hide #config if not a GM
  OBR.player.getRole().then((role) => {
    if (role !== "GM") {
      document.querySelector("#config").style.display = "none";
    }
  });

  // on room load, set the select to the room metadata
  let select = document.querySelector("#vertical")
  OBR.room.getMetadata().then((data) => {
    let vertical = data.vertical_measurement || "DEFAULT"
    select.value = vertical    
  })  
  
  // set room metadata when a select is chosen
  select.onchange = (e) => {
    OBR.room.setMetadata({ vertical_measurement: e.target.value })
  }
});
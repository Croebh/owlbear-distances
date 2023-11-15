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
    let config_element = document.querySelector("#config");
    if (role == "GM" && config_element) {
      config_element.style.display = "block";
    }
  });

  // on room load, set the select to the room metadata
  let select_element = document.querySelector("#vertical")
  OBR.room.getMetadata().then((data) => {
    let vertical = data.vertical_measurement || "DEFAULT"
    if (select_element) {
      select_element.value = vertical    
    }
  })  
  
  // set room metadata when a select is chosen
  if (select_element) {
    select_element.onchange = (e) => {
      OBR.room.setMetadata({ vertical_measurement: e.target.value })
    }
  }
  
});
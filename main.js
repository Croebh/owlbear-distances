import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { setupList } from "./mainList"
import "./style.css";

document.querySelector("#app").innerHTML = `<h3 style='text-align: center'>No character selected</h3>`;

OBR.onReady(() => {
  setupContextMenu();
  setupList(document.querySelector("#app"))
});
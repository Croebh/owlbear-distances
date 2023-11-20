import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { setupList } from "./mainList"
import { getExtensionId } from "./utils";
import "./style.css";

document.querySelector("#app").innerHTML = `<h3 style='text-align: center'>No character selected</h3>`;

OBR.onReady(() => {
  setupContextMenu();
  setupList(document.querySelector("#app"))
  
  // Hide #config if not a GM
  OBR.player.getRole().then((role) => {
    let config_element = document.querySelector("#config-button");
    if (role == "GM" && config_element) {
      config_element.style.display = "block";
    }
    config_element.addEventListener("click", () => {
      OBR.modal.open({
        id: getExtensionId("modal"),
        url: "/modal.html",
        height: 500,
        width: 500,
      })
    });
  });  
});

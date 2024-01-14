import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { setupList } from "./mainList"
import { getExtensionId, setThemeMode } from "./utils";
import "./style.css";


document.querySelector("#app").innerHTML = `<h3 style='text-align: center'>No character selected</h3>`;

OBR.onReady(async () => {
  const theme = await OBR.theme.getTheme();
  setThemeMode(theme, document);
  OBR.theme.onChange((theme) =>
  {
      setThemeMode(theme, document);
  });

  setupContextMenu();
  setupList(document.querySelector("#app"))
  
  // Hide #config if not a GM
  OBR.player.getRole().then((role) => {
    enable_config(role);
  });
  OBR.player.onChange((player) => {
    enable_config(player.role);
  });
  OBR.scene.onReadyChange((ready) => {
    if (ready) {
      OBR.player.getRole().then((role) => {
        enable_config(role);
      });
    }
  });
});

function enable_config(role) {
  let config_element = document.querySelector("#config-button");
  if (role == "GM" && config_element) {
    config_element.style.display = "block";
    config_element.addEventListener("click", modalOpener);
  } else if (config_element) {
    config_element.style.display = "none";
    config_element.removeEventListener("click", modalOpener)
  }    
}

function modalOpener() {
  OBR.modal.open({
    id: getExtensionId("modal"),
    url: "/modal.html",
    height: 500,
    width: 500,
    fullScreen: navigator.userAgentData?.mobile ?? false
  })
}
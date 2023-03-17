import OBR, { buildLine, isImage, isText } from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import "./style.css";

OBR.onReady(() => {
  setupContextMenu();
});
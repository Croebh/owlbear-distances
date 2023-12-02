import OBR from "@owlbear-rodeo/sdk";
import { getExtensionId } from "./utils";

const menu_id = getExtensionId("menu")

export function setupContextMenu() {
  const filter = {
    every: [{ key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" }],
  };
  OBR.contextMenu.create({
    id: `${menu_id}/context-menu.height`,
    icons: [
      {
        icon: "/wing.svg",
        label: "Set Height",
        filter: filter,
      },
    ],
    embed: {
      url: "/set-height.html",
      height: 26,
    }
  });
  OBR.contextMenu.create({
    id: `${menu_id}/context-menu.distance`,
    icons: [
      {
        icon: "/distances.svg",
        label: "Distances",
        filter: filter,
      },
    ],
    embed: {
      url: "/show-distances.html",
      height: 120,
    },
  });
}
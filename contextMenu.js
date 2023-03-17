import OBR, { buildLine, isImage, isText } from "@owlbear-rodeo/sdk";

const ID = "com.show-distances.menu";

export function setupContextMenu() {
  OBR.contextMenu.create({
    id: `${ID}/context-menu`,
    icons: [
      {
        icon: "/distances.svg",
        label: "Show Distances",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
        },
      },
    ],
    async onClick(context, elementId) {

      OBR.popover.open({
        id: `${ID}/show-distances`,
        height: 120,
        width: 200,
        url: "/show-distances.html",
        anchorElementId: elementId,
        anchorOrigin: {
          horizontal: "CENTER",
          vertical: "BOTTOM",
        },
        transformOrigin: {
          horizontal: "CENTER",
          vertical: "TOP",
        },
      });
    },
  });
}
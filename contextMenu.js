import OBR, { buildImage } from "@owlbear-rodeo/sdk";
import { getExtensionId } from "./utils";

const menu_id = getExtensionId("menu")
const meta_id = getExtensionId("metadata")

export function setupContextMenu() {
  OBR.contextMenu.create({
    id: `${menu_id}/context-menu.height`,
    icons: [
      {
        icon: "/wing.svg",
        label: "Set Height",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
        },
      },
    ],
    embed: {
      url: "/set-height.html",
      height: 26,
    },
    // async onClick(context) {
    //   const dpi = await OBR.scene.grid.getDpi()
    //   const scale = await OBR.scene.grid.getScale()
    //   const item_height = parseInt(window.prompt(`Enter the vertical height of this combatant, in ${scale.parsed.unit}.\nEntering a value of 0 will reset their height.`));
    //   let objects = []
    //   OBR.scene.items.updateItems(context.items, (items) => {
    //     for (let item of items) {
    //       if (item_height && !isNaN(item_height)) {
    //         const dpiScale = dpi / item.grid.dpi;
    //         const height = item.image.height * dpiScale * item.scale.y;
    //         const offsetY = (item.grid.offset.y / item.image.height) * height;
    //         // Apply image offset and offset position to be centered just above the token label
    //         const position = {
    //           x: item.position.x,
    //           y: item.position.y + offsetY - 60,
    //         };

    //         const image = buildImage(
    //           {
    //             height: 40,
    //             width: 40,
    //             url: `https://owlbear-distances.onrender.com/wing.png`,
    //             mime: "image/png",
    //           },
    //           { 
    //             dpi: 40, 
    //             offset: { x: 20, y: 20 } 
    //           }
    //         )
    //         .position(position)
    //         .layer("ATTACHMENT")
    //         .scale({x: 0.3, y: .3})
    //         .plainText(`${item_height} ${scale.parsed.unit}.`)
    //         .locked(true)
    //         .attachedTo(item.id)
    //         .disableAttachmentBehavior(["ROTATION"])
    //         .id(`${meta_id}/${item.id}`)
    //         .visible(item.visible)
    //         .build()
    //         objects.push(image)
    //       } else if (item_height == 0) {
    //         const ids = context.items.map((item) => `${meta_id}/${item.id}`);
    //         OBR.scene.items.deleteItems(ids);
            
    //       }
    //       item.metadata[`${meta_id}`] = {
    //         item_height: item_height,
    //       };
    //     }
    //   });
    //   OBR.scene.items.addItems(objects);
    // }
  });
  OBR.contextMenu.create({
    id: `${menu_id}/context-menu.distance`,
    icons: [
      {
        icon: "/distances.svg",
        label: "Distances",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
        },
      },
    ],
    embed: {
      url: "/show-distances.html",
      height: 120,
    },
  });
}
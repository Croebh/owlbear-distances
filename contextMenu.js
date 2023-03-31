import OBR, { buildImage } from "@owlbear-rodeo/sdk";

const ID = "com.show-distances.menu";

export function setupContextMenu() {
  OBR.contextMenu.create({
    id: `${ID}/context-menu.distance`,
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
        height: 130,
        width: 300,
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
  OBR.contextMenu.create({
    id: `${ID}/context-menu.height`,
    icons: [
      {
        icon: "/wing.svg",
        label: "Set Height",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
        },
      },
    ],
    async onClick(context) {
      var scripts = document.getElementsByTagName('script');
      var location = scripts[scripts.length - 1].src.replace(/(https?:\/\/.+?)\/.+/gm, '$1')
      const dpi = await OBR.scene.grid.getDpi()
      const scale = await OBR.scene.grid.getScale()
      const item_height = parseInt(window.prompt(`Enter the vertical height of this combatant, in ${scale.parsed.unit}.\nEntering a value of 0 will reset their height.`));
      let objects = []
      OBR.scene.items.updateItems(context.items, (items) => {
        for (let item of items) {
          if (item_height && !isNaN(item_height)) {
            const dpiScale = dpi / item.grid.dpi;
            const height = item.image.height * dpiScale * item.scale.y;
            const offsetY = (item.grid.offset.y / item.image.height) * height;
            // Apply image offset and offset position to be centered just above the token label
            const position = {
              x: item.position.x,
              y: item.position.y + offsetY - 50,
            };

            const image = buildImage({
                height: 40,
                width: 40,
                url: `${location}/wing.png`,
                mime: "image/png",
              },
              { 
                dpi: 40, 
                offset: { x: 20, y: 20 } 
              })
            .position(position)
            .layer("ATTACHMENT")
            .scale({x: 0.3, y: .3})
            .plainText(`${item_height} ${scale.parsed.unit}.`)
            .locked(true)
            .attachedTo(item.id)
            .id(`${ID}/context-menu.height/${item.id}`)
            .visible(item.visible)
            .build()
            objects.push(image)
            item.metadata[`${ID}/metadata`] = {
              item_height,
            };
          } else if (item_height == 0) {
            const ids = context.items.map((item) => `${ID}/context-menu.height/${item.id}`);
            OBR.scene.items.deleteItems(ids);
            item.metadata[`${ID}/metadata`] = {
              item_height,
            };
          }
        }
      });
      OBR.scene.items.addItems(objects);
      
    },
  });
}
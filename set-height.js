import OBR, {buildImage} from "@owlbear-rodeo/sdk";
import "./style.css";
import { getExtensionId, debounce } from "./utils";

const meta_id = getExtensionId("metadata")

OBR.onReady(async () => {
    const scale = await OBR.scene.grid.getScale()
    const selection = await OBR.player.getSelection()
    let current_height = 0
    if (selection) {
        const items = await OBR.scene.items.getItems(selection);
        for (const item of items) {
            if (item.metadata?.[meta_id]?.item_height) {
                let item_height = item.metadata[meta_id].item_height
                if (item_height) {
                    current_height = item.metadata[meta_id].item_height
                }
            }
        }

    }
    const input = document.getElementById("height");
    const unit = document.getElementById("unit");
    const reset = document.getElementById("reset");
    input.value = current_height;
    input.attributes["step"].value = scale.parsed.multiplier;
    unit.innerHTML = `${scale.parsed.unit}.`;
    
    let debounced_set_height = debounce(set_height, 250);

    input.addEventListener("keyup", debounced_set_height);
    input.addEventListener("change", debounced_set_height);
    reset.addEventListener("click", debounced_set_height);

    async function set_height(event) {
        let item_height = parseInt(event.target.value);
        
        const dpi = await OBR.scene.grid.getDpi()
        const scale = await OBR.scene.grid.getScale()
        
        OBR.scene.items.updateItems(selection, (items) => {
            
            for (let item of items) {
                if (item_height && !isNaN(item_height)) {
                    const dpiScale = dpi / item.grid.dpi;
                    const height = item.image.height * dpiScale * item.scale.y;
                    const offsetY = (item.grid.offset.y / item.image.height) * height;

                    // Apply image offset and offset position to be centered just above the token label
                    const position = {
                        x: item.position.x,
                        y: item.position.y + offsetY - 60,
                    };

                    const image = buildImage(
                        {
                            height: 40,
                            width: 40,
                            url: `https://owlbear-distances.onrender.com/wing.png`,
                            mime: "image/png",
                        },
                        { 
                            dpi: 40, 
                            offset: { x: 20, y: 20 } 
                        }
                    )
                    .name("Height")
                    .position(position)
                    .layer("ATTACHMENT")
                    .scale({x: 0.3, y: .3})
                    .plainText(`${item_height} ${scale.parsed.unit}.`)
                    .locked(true)
                    .attachedTo(item.id)
                    .disableAttachmentBehavior(["ROTATION"])
                    .id(`${meta_id}/${item.id}`)
                    .visible(item.visible)
                    .build()
                    OBR.scene.items.addItems([image]);
                } else {
                    const ids = selection.map((item) => `${meta_id}/${item}`);
                    console.log(ids)
                    OBR.scene.items.deleteItems(ids);
                    item_height = 0
                }
                item.metadata[`${meta_id}`] = {
                    item_height: item_height,
                };
            }
        });
        
    };

});

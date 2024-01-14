import OBR, {isImage} from "@owlbear-rodeo/sdk";
import { nameDisplay, getDistances } from "./utils";

export async function setupList(element) {
    const is_dm = await OBR.player.getRole() === "GM"
    
    let last_selection = []
    const renderList = async (change) => {
        const sceneMetadata = await OBR.scene.getMetadata();
        const nodes = [];
        const selection = await OBR.player.getSelection() || last_selection;
        if (selection) {
            last_selection = selection
            const items = await OBR.scene.items.getItems(selection);
            for (const item of items) {
                if (!["CHARACTER", "MOUNT"].includes(item.layer) || !isImage(item) || (!is_dm && !item.visible)) {
                    continue
                }
                const name = nameDisplay(item, sceneMetadata)
                const node = document.createElement("h3");
                
                node.className = "target-name"
                node.innerHTML = `${name}`;
                nodes.push(node)
    
                const table = document.createElement("table");
                table.innerHTML = `<colgroup><col width="100%" /><col width="0%" /></colgroup>`
                let distances = await getDistances(item)
                distances.forEach((distance) => {
                    table.appendChild(distance)
                })
                nodes.push(table)
            }
            element.replaceChildren(...nodes);
        } else {
            document.querySelector("#app").innerHTML = `<h3 style='text-align: center'>No character selected</h3>`;
        }
        if (!document.querySelector("#app").innerHTML) {
            document.querySelector("#app").innerHTML = `<h3 style='text-align: center'>No character selected</h3>`;
        }
        OBR.action.setHeight(Math.min(document.querySelector("body").offsetHeight + 20, 600));
    }    
    OBR.player.onChange(renderList);
    OBR.scene.items.onChange(renderList);
}


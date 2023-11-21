import OBR, {buildRuler, isImage} from "@owlbear-rodeo/sdk";
import { getDistances } from "./show-distances"
import { nameDisplay, getExtensionId } from "./utils";

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
                if (item.layer != "CHARACTER" || !isImage(item) || (!is_dm && !item.visible)) {
                    continue
                }
                const name = nameDisplay(item, sceneMetadata)
                const node = document.createElement("h3");
                
                node.className = "target-name"
                node.innerHTML = `${name}`;
                nodes.push(node)
    
                const table = document.createElement("table");
                let distances = await getDistances(item)
                table.innerHTML = distances
                nodes.push(table)
            }
            element.replaceChildren(...nodes);
            // let rows = element.querySelector("tr")
            // for (let row of rows) {
            //     row.addEventListener("mouseOver", async () => {
            //         let existing_rule = await OBR.scene.items.getItems((item) => item.id === getExtensionId("ruler"))
            //         let distance = row.lastChild.innerHTML
                    
            //         let start_x = row.getAttribute("start-x")
            //         let start_y = row.getAttribute("start-y")
            //         let end_x = row.getAttribute("end-x")
            //         let end_y = row.getAttribute("end-y")
            //         let ruler = buildRuler()
            //         .measurement(distance)
            //         .variant("DASHED")
            //         .startPosition({x: parseInt(start_x), y: parseInt(start_y)})
            //         .endPosition({x: parseInt(end_x), y: parseInt(end_y)})
            //         .id(getExtensionId("ruler"))
            //         .build();
                    
            //         if (!existing_rule.length) {
            //             OBR.scene.items.addItems([ruler]);
            //         }
            //     });
            //     row.addEventListener("mouseOut", async () => {
            //         let existing_rule = await OBR.scene.items.getItems((item) => item.id === getExtensionId("ruler"))
            //         if (existing_rule.length) {
            //             OBR.scene.items.removeItems(existing_rule);
            //         }
            //     });
            // }
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


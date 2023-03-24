import OBR, {isImage} from "@owlbear-rodeo/sdk";
import { getDistances } from "./show-distances"

const ID = "com.tutorial.initiative-tracker";


export async function setupList(element) {
    const is_dm = await OBR.player.getRole() === "GM"
    const characters = await OBR.scene.items.getItems(
        (item) => item.layer === "CHARACTER" && isImage(item) && (is_dm || item.visible)
    );
    
    const renderList = async (player) => {
        const nodes = [];
        if (player.selection) {
            const items = await OBR.scene.items.getItems(player.selection);
            for (const item of items) {
                if (item.layer != "CHARACTER") {
                    console.log(item.layer);
                    continue
                }
                let name = item.text.plainText.replace(/(\r\n|\n|\r)/gm, "");
                if (name) {
                    name = `<strong>${name}</strong>`
                } else {
                    name = `<em>Unlabeled</em>`
                }
                const node = document.createElement("h3");
                node.innerHTML = `${name}`;
                nodes.push(node)

                const table = document.createElement("table");
                let distances = await getDistances(item)
                table.innerHTML = distances
                nodes.push(table)
            }
            element.replaceChildren(...nodes);
        }
    }    
    OBR.player.onChange(renderList);
}

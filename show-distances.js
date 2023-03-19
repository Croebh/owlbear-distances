import OBR, {isImage} from "@owlbear-rodeo/sdk";
import "./style.css";

const ID = "com.show-distance";

async function getDistances() {

    const dpi = await OBR.scene.grid.getDpi()
    const scale = await OBR.scene.grid.getScale()

    const is_dm = await OBR.player.getRole() === "GM"

    const characters = await OBR.scene.items.getItems(
        (item) => item.layer === "CHARACTER" && isImage(item) && (is_dm || item.visible)
    );

    const selection = await OBR.player.getSelection()
    if (selection) {
        const items = await OBR.scene.items.getItems(selection);
        for (const item of items) {

            const item_offset = {
                x: (item.scale.x > 1.5 ? (item.scale.x-1) / 2 : 0),
                y: (item.scale.y > 1.5 ? (item.scale.y-1) / 2 : 0)
            };
                    
            let text = `<table>`            
            let distances = []

            characters.forEach(character => {
                if (character.id != item.id) {
                    let name = character.text.plainText.replace(/(\r\n|\n|\r)/gm, "");
                    if (name) {
                        name = `<strong>${name}</strong>`
                    } else {
                        name = `<em>Unlabeled</em>`
                    }


                    // Calculate the closest 1x1 square for each token                    
                    const character_offset = {
                        x: (character.scale.x > 1.5 ? (character.scale.x-1) / 2 : 0),
                        y: (character.scale.y > 1.5 ? (character.scale.y-1) / 2 : 0)
                    };
                    
                    const abs_distance = {
                        x: Math.abs((item.position.x-character.position.x)/dpi) - (item_offset.x + character_offset.x),
                        y: Math.abs((item.position.y-character.position.y)/dpi) - (item_offset.y + character_offset.y)
                    }

                    let n_diag = Math.min(abs_distance.x, abs_distance.y)
                    let n_straight = Math.max(abs_distance.x, abs_distance.y) - n_diag
                    let dist = Math.round(5 * n_straight + (15 * Math.floor(n_diag / 2)) + (5 * (n_diag % 2)))
                    dist = Math.ceil(dist / 5) * 5
                    dist = Math.round(dist * 10 ** scale.parsed.digits) / 10 ** scale.parsed.digits
                    
                    distances.push({
                        target: name, 
                        distance: dist
                    })
                    
                }
            });
            distances.sort((a, b) => {
                return a.distance - b.distance
            })
            distances.forEach(dist => {
                text += `<tr><td>${dist.target}</td><td>${dist.distance} ${scale.parsed.unit}. away</td></tr>`
            })
            text += `</table>`

            document.querySelector("#app").innerHTML = text;
        }
    }
}

OBR.onReady(async () => {
    getDistances();
});
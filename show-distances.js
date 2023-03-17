import OBR, {isImage} from "@owlbear-rodeo/sdk";
import "./style.css";

const ID = "com.show-distance";

async function getDistances() {

    const dpi = await OBR.scene.grid.getDpi()
    const scale = await OBR.scene.grid.getScale()

    const characters = await OBR.scene.items.getItems(
        (item) => item.layer === "CHARACTER" && isImage(item)
    );

    const selection = await OBR.player.getSelection()
    if (selection) {
        const items = await OBR.scene.items.getItems(selection);
        for (const item of items) {
            let name_1 = item.text.plainText.replace(/(\r\n|\n|\r)/gm, "");

            let text = `<table>`
            
            let distances = []

            characters.forEach(character => {
                if (character.id != item.id) {
                    let name_2 = character.text.plainText.replace(/(\r\n|\n|\r)/gm, "");
                    
                    // Calculate the closest 1x1 square for each token
                    const closestSquare1 = {
                        x: Math.round((item.position.x - (character.scale.x-1 / 2)) / scale.parsed.multiplier) * scale.parsed.multiplier + (character.scale.x-1 / 2),
                        y: Math.round((item.position.y - (character.scale.y-1 / 2)) / scale.parsed.multiplier) * scale.parsed.multiplier + (character.scale.y-1 / 2)
                    };
                    const closestSquare2 = {
                        x: Math.round((character.position.x - (item.scale.x-1 / 2)) / scale.parsed.multiplier) * scale.parsed.multiplier + (item.scale.x-1 / 2),
                        y: Math.round((character.position.y - (item.scale.y-1 / 2)) / scale.parsed.multiplier) * scale.parsed.multiplier + (item.scale.y-1 / 2)
                    };
                    
                    // Calculate the distance between the center of the closest 1x1 squares
                    let dist = Math.sqrt((closestSquare1.x - closestSquare2.x) ** 2 + (closestSquare1.y - closestSquare2.y) ** 2);
                    dist = dist * scale.parsed.multiplier
                    dist = dist / dpi
                    dist = Math.round(dist / 5) * 5
                    
                    let odd_size = item.scale.x > 1.5 || item.scale.y > 1.5 || character.scale.x > 1.5 || character.scale.y > 1.5
                    if (odd_size) {
                        dist = dist - scale.parsed.multiplier
                    }
                    distances.push([name_2, dist, odd_size])
                    
                }
            });
            distances.sort((a, b) => {
                return a[1]-b[1]
            })
            distances.forEach(dist => {
                text = text + `<tr><td><strong>${dist[0]}</strong></td><td>${dist[2] ? '~' : ''}${dist[1]} ${scale.parsed.unit}. away</td></tr>`
            })
            text = text + `</table>`

            document.querySelector("#app").innerHTML = `
                ${text}
            `;
        }
    }
}

OBR.onReady(async () => {
    getDistances();
});
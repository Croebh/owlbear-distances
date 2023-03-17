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

            const item_offset = {
                x: (item.scale.x > 1.5 ? (item.scale.x-1) / 2 : 0),
                y: (item.scale.y > 1.5 ? (item.scale.y-1) / 2 : 0)
            };

            
            
            let text = `<table>`
            
            let distances = []
            // console.log("---")
            // console.log(name_1, "\t", closestSquare1,"\t", item.position.x/dpi, "-", ((item.scale.x-1) / 2), "\t", item.position.y/dpi, "-", ((item.scale.y-1) / 2))
            // console.log("---")

            characters.forEach(character => {
                if (character.id != item.id) {
                    let name_2 = character.text.plainText.replace(/(\r\n|\n|\r)/gm, "");


                    // Calculate the closest 1x1 square for each token
                    
                    const character_offset = {
                        x: (character.scale.x > 1.5 ? (character.scale.x-1) / 2 : 0),
                        y: (character.scale.y > 1.5 ? (character.scale.y-1) / 2 : 0)
                    };
                    // console.log(name_2 + " " + character.scale.x +  " " +character_offset.x + " " + character.scale.y +  " " + character_offset.y)
                    
                    // console.log(name_2, "\t", closestSquare2, "\t", character.position.x/dpi, "-", ((character.scale.x-1) / 2), "\t", character.position.y/dpi, "-", ((character.scale.y-1) / 2))
                    
                    const abs_distance = {
                        x: Math.abs((item.position.x-character.position.x)/dpi) - (item_offset.x + character_offset.x),
                        y: Math.abs((item.position.y-character.position.y)/dpi) - (item_offset.y + character_offset.y)
                    }

                    let n_diag = Math.min(abs_distance.x, abs_distance.y)
                    let n_straight = Math.max(abs_distance.x, abs_distance.y) - n_diag
                    let dist = Math.round(5 * n_straight + (15 * Math.floor(n_diag / 2)) + (5 * (n_diag % 2)))
                    dist = Math.ceil(dist / 5) * 5
                    dist = Math.round(dist * 10 ** scale.parsed.digits) / 10 ** scale.parsed.digits
                    
                    // console.log(name_2 + "\t" + dist)
                    distances.push([name_2, dist])
                    
                }
            });
            distances.sort((a, b) => {
                return a[1]-b[1]
            })
            distances.forEach(dist => {
                text = text + `<tr><td><strong>${dist[0]}</strong></td><td>${dist[1]} ${scale.parsed.unit}. away</td></tr>`
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
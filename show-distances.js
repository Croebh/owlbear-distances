import OBR, {isImage} from "@owlbear-rodeo/sdk";
import "./style.css";

function calcDistance(coord1, coord2, measurement, scale, height_difference) {
    const multiplier = scale.parsed.multiplier
    const digits = scale.parsed.digits

    let distance = Infinity
    const deltaX = Math.abs(coord1.x - coord2.x);
    const deltaY = Math.abs(coord1.y - coord2.y);
    const deltaZ = Math.abs(height_difference) / multiplier

    switch (measurement) {
        case 'CHEBYSHEV':
            distance = Math.max(deltaX, deltaY, deltaY)
            distance *= multiplier
            break
        case "ALTERNATING":
            let n_diag = Math.min(deltaX, deltaY);
            let n_straight = Math.max(deltaX, deltaY) - n_diag;
            distance = Math.round(
                multiplier * n_straight +
                (3 * multiplier) * Math.floor(n_diag / 2) +
                (multiplier * (n_diag % 2)) +
                (multiplier * deltaZ)
            );
            break
        case "EUCLIDEAN":
            distance = Math.sqrt(
                Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2)
            );
            distance = Math.sqrt(
                Math.pow(distance, 2) + Math.pow(deltaZ, 2)
            )
            distance *= multiplier
            break
        case "MANHATTAN":
            distance = deltaX + deltaY + deltaY
            distance *= multiplier
            break
    }    
    distance = Math.round(distance * 10 ** digits) / 10 ** digits

    return distance
}

export async function getDistances(target) {

    const dpi = await OBR.scene.grid.getDpi()
    const scale = await OBR.scene.grid.getScale()
    const measurement = await OBR.scene.grid.getMeasurement()

    const is_dm = await OBR.player.getRole() === "GM"

    const characters = await OBR.scene.items.getItems(
        (item) => item.layer === "CHARACTER" && isImage(item) && (is_dm || item.visible)
    );


    let item_height = 0            
    if (target.metadata[`com.show-distances.menu/metadata`] != undefined) {
        item_height = target.metadata[`com.show-distances.menu/metadata`].item_height
    }
    
    let item_scale = Math.max(1, Math.floor(target.scale.x))
    let item_bottom_right = {
        x: Math.floor(target.position.x/dpi + ((item_scale-1)/2)),
        y: Math.floor(target.position.y/dpi + ((item_scale-1)/2))
    }

    let table = `
    <colgroup>
        <col width="100%" />
        <col width="0%" />
    </colgroup>`
    let distances = []

    characters.forEach(character => {
        if (character.id != target.id) {
            let name = character.text.plainText.replace(/(\r\n|\n|\r)/gm, "");
            if (name) {
                name = `<strong>${name}</strong>`
            } else {
                name = `<strong>${character.name}</strong>`
            }

            let character_height = 0            
            if (character.metadata[`com.show-distances.menu/metadata`] != undefined) {
                character_height = character.metadata[`com.show-distances.menu/metadata`].item_height
            }
            const height_difference = character_height - item_height

            if (!character.visible) {
                name = `<span class='invisible'>${name}</span>`
            }

            let character_scale = Math.max(1, Math.floor(character.scale.x))
            let character_bottom_right = {
                x: Math.floor(character.position.x/dpi + ((character_scale-1)/2)),
                y: Math.floor(character.position.y/dpi + ((character_scale-1)/2))
            }
            let closestDistance = Infinity
            for (let i = 0; i < item_scale; i++) {
                for (let j = 0; j < item_scale; j++) {
                const square1X = item_bottom_right.x - i;
                const square1Y = item_bottom_right.y - j;
                    for (let k = 0; k < character_scale; k++) {
                        for (let l = 0; l < character_scale; l++) {
                            const square2X = character_bottom_right.x - k;
                            const square2Y = character_bottom_right.y - l;
            
                            let distance = calcDistance({x: square1X, y: square1Y}, {x: square2X, y: square2Y}, measurement, scale, height_difference)
                            
                            if (distance < closestDistance) {
                                closestDistance = distance;
                            }
                        }
                    }
                }
            }

            distances.push({
                target: name,
                distance: closestDistance,
                height: height_difference
            })
        }
    });
    distances.sort((a, b) => {
        return a.distance - b.distance
    }).forEach(dist => {
        table += `<tr><td>${dist.target}</td><td>${dist.distance} ${scale.parsed.unit}. away ${dist.height ? (dist.height > 0 ? '↑' : '↓') : ''}</td></tr>`
    })
    return table
}
OBR.onReady(async () => {
    const selection = await OBR.player.getSelection()
    if (selection) {
        const items = await OBR.scene.items.getItems(selection);
        for (const item of items) {
            const table = document.createElement("table");
            let distances = await getDistances(item)
            table.innerHTML = distances
            document.querySelector("#app").replaceChildren(table)
        }
    }
});
import OBR, { isImage } from "@owlbear-rodeo/sdk";

export function getExtensionId(module) {
    return `com.show-distances/${module}`
}

export function nameDisplay(item, sceneMetadata) {
    let name = item.text.plainText.replace(/(\r\n|\n|\r)/gm, "");

    // Add support for Stat Bubbles nametags
    if (sceneMetadata?.[getExtensionId("useFileName")]) {
        name = `${item.name}${name ? ` (${name})` : ""}`
    } else if (sceneMetadata?.["com.owlbear-rodeo-bubbles-extension/metadata"]?.['name-tags']) {
        name = item.name
    }
    
    if (name) {
        name = `<strong>${name}</strong>`
    } else {
        name = `<strong><em>Unnamed Token</em></strong>`
    }
    return name
}

export function debounce(func, delay) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
        func.apply(this, args);
        }, delay);
    };
}

export function setThemeMode(theme, document)
{
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: light)");
    const darkTheme = darkThemeMq.matches ? "dark" : "light";
    const lightTheme = darkThemeMq.matches ? "light" : "dark";

    for (var s = 0; s < document.styleSheets.length; s++)
    {
        for (var i = 0; i < document.styleSheets[s].cssRules.length; i++)
        {
            let rule = document.styleSheets[s].cssRules[i] ;

            if (rule && rule.media && rule.media.mediaText.includes("prefers-color-scheme"))
            {
                if (theme.mode == "LIGHT")
                {
                    rule.media.appendMedium(`(prefers-color-scheme: ${darkTheme})`);

                    if (rule.media.mediaText.includes(lightTheme))
                    {
                        rule.media.deleteMedium(`(prefers-color-scheme: ${lightTheme})`);
                    }
                }
                else if (theme.mode == "DARK")
                {
                    rule.media.appendMedium(`(prefers-color-scheme: ${lightTheme})`);

                    if (rule.media.mediaText.includes(darkTheme))
                    {
                        rule.media.deleteMedium(`(prefers-color-scheme: ${darkTheme})`);
                    }
                }
            }
        }
    }
}

export async function getDistances(target) {

    const dpi = await OBR.scene.grid.getDpi()
    const scale = await OBR.scene.grid.getScale()
    const measurement = await OBR.scene.grid.getMeasurement()
    const gridType = await OBR.scene.grid.getType()
    
    const vertical_measurement = await OBR.room.getMetadata().then((data) => data.vertical_measurement || "DEFAULT")

    const is_dm = await OBR.player.getRole() === "GM"

    const sceneMetadata = await OBR.scene.getMetadata();

    const characters = await OBR.scene.items.getItems(
        (item) => item.layer === "CHARACTER" && isImage(item) && (is_dm || item.visible)
    );


    let item_height = 0            
    if (target.metadata[getExtensionId("metadata")] != undefined) {
        item_height = target.metadata[getExtensionId("metadata")].item_height
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

    for (const character of characters) {
        if (character.id != target.id) {
            let name = nameDisplay(character, sceneMetadata)
            
            let character_height = 0            
            if (character.metadata[getExtensionId("metadata")] != undefined) {
                character_height = character.metadata[getExtensionId("metadata")].item_height
            }
            const height_difference = character_height - item_height

            if (!character.visible) {
                name = `<span class='invisible'>${name}</span>`
            }
            
            if (gridType.includes("HEX")) {
                // Hex grid - Use center hexes
                let hex_distance = await OBR.scene.grid.getDistance(character.position, target.position)
                if (height_difference) {
                    hex_distance = Math.sqrt(
                        Math.pow(hex_distance, 2) + Math.pow(Math.abs(height_difference) / scale.parsed.multiplier, 2)
                    )
                }
                hex_distance *= scale.parsed.multiplier
                hex_distance = Math.round(hex_distance * 10 ** scale.parsed.digits) / 10 ** scale.parsed.digits
                distances.push({
                    target: name,
                    distance: hex_distance,
                    height: height_difference,
                })
            } else {
                // Square grid - Find closest square
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

                                let distance = calcDistance({x: square1X, y: square1Y}, {x: square2X, y: square2Y}, measurement, scale, height_difference, vertical_measurement)
                                
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
                    height: height_difference,
                })
            }

            
        }
    };
    distances.sort((a, b) => {
        return a.distance - b.distance
    }).forEach(dist => {
        table += `<tr><td>${dist.target}</td><td>${dist.distance} ${scale.parsed.unit}. away ${dist.height ? (dist.height > 0 ? '↑' : '↓') : ''}</td></tr>`
    })
    return table
}

export function calcDistance(coord1, coord2, measurement, scale, height_difference, vertical_measurement) {
    const multiplier = scale.parsed.multiplier
    const digits = scale.parsed.digits

    let distance = Infinity
    const deltaX = Math.abs(coord1.x - coord2.x);
    const deltaY = Math.abs(coord1.y - coord2.y);
    const deltaZ = Math.abs(height_difference) / multiplier

    if (vertical_measurement === "DEFAULT") {
        vertical_measurement = measurement
    }

    switch (measurement) {
        case 'CHEBYSHEV':
            distance = Math.max(deltaX, deltaY)
            break
        case "ALTERNATING":
            let n_diag = Math.min(deltaX, deltaY);
            let n_straight = Math.max(deltaX, deltaY) - n_diag;
            distance = Math.round(
                n_straight +
                3 * Math.floor(n_diag / 2) +
                (n_diag % 2)
            );
            break
        case "EUCLIDEAN":
            distance = Math.sqrt(
                Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2)
            );
            break
        case "MANHATTAN":
            distance = deltaX + deltaY
            break
    }

    switch (vertical_measurement) {
        case 'CHEBYSHEV':
            distance = Math.max(distance, deltaZ)
            break
        case "ALTERNATING":            
            let z_diag = Math.min(distance, deltaZ);
            let z_straight = Math.max(distance, deltaZ) - z_diag;
            distance = Math.round(
                z_straight +
                3 * Math.floor(z_diag / 2) +
                (z_diag % 2)
            );
            break
        case "EUCLIDEAN":
            distance = Math.sqrt(
                Math.pow(distance, 2) + Math.pow(deltaZ, 2)
            )
            break
        case "MANHATTAN":
            distance = distance + deltaZ
            break
    }

    distance *= multiplier
    distance = Math.round(distance * 10 ** digits) / 10 ** digits

    return distance
}
import OBR from "@owlbear-rodeo/sdk";

export async function getMetadata() {
    OBR.onReady(() => {
        OBR.scene.onReadyChange(async () => {
            const sceneMetadata = await OBR.scene.getMetadata();
            const retrievedMetadata = JSON.parse(JSON.stringify(sceneMetadata));
            return retrievedMetadata
        });
    });
}

export function nameDisplay(item, sceneMetadata) {
    let name = item.text.plainText.replace(/(\r\n|\n|\r)/gm, "");

    // Add support for Stat Bubbles nametags
    let statBubblesID = "com.owlbear-rodeo-bubbles-extension/metadata"
    if (sceneMetadata?.[statBubblesID]?.['name-tags']) {
        name = item.name
    }    
    
    if (name) {
        name = `<strong>${name}</strong>`
    } else {
        name = `<strong><em>Unnamed Token</em></strong>`
    }
    return name
}
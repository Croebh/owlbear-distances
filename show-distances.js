import OBR, {isImage} from "@owlbear-rodeo/sdk";
import "./style.css";
import { nameDisplay, getExtensionId, setThemeMode, getDistances } from "./utils";

OBR.onReady(async () => {
    const theme = await OBR.theme.getTheme();
    setThemeMode(theme, document);
    OBR.theme.onChange((theme) =>
    {
        setThemeMode(theme, document);
    });
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
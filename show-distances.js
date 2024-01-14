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
            table.innerHTML = `<colgroup><col width="100%" /><col width="0%" /></colgroup>`
            let distances = await getDistances(item)
            distances.forEach((distance) => {
                table.appendChild(distance)
            })
            document.querySelector("#app").replaceChildren(table)
        }
    }
});
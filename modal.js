import OBR from "@owlbear-rodeo/sdk";
import "./style.css";
import { getExtensionId } from "./utils";

OBR.onReady(() => {
    // on room load, set the values to the scenes values
    let select_element = document.querySelector("select#vertical")
    let name_label_input = document.querySelector("input#useFileName")
    OBR.scene.getMetadata().then((data) => {
        let vertical = data?.[getExtensionId("vertical_measurement")] || "DEFAULT"
        if (select_element) {
            select_element.value = vertical    
        }

        let useFileName = data?.[getExtensionId("useFileName")] || false
        if (name_label_input) {
            name_label_input.checked = useFileName
        }
    })  

    // set veritical measurement when a select is chosen
    if (select_element) {
        select_element.onchange = (e) => {
            OBR.scene.setMetadata({ [getExtensionId("vertical-measurement")]: e.target.value })
        }
    }

    // set useFileName when a checkbox is clicked
    if (name_label_input) {
        name_label_input.onchange = (e) => {
            OBR.scene.setMetadata({ [getExtensionId("useFileName")]: e.target.checked })
        }
    }
})
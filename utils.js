import OBR from "@owlbear-rodeo/sdk";

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
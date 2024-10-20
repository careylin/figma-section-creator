// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

figma.showUI(__html__, { width: 500, height: 500 });

figma.ui.onmessage = (message) => {
	console.log("got this from the UI", message);
	runMyPlugin(message.keyword, message.sectionNames);
};

async function tryLoadingFont(fontName: FontName): Promise<FontName> {
	try {
		await figma.loadFontAsync({ family: "Manrope", style: "Regular" });
		return fontName;
	} catch (error) {
		console.log(`Font '${fontName.family}' could not be loaded. Please install or change the component font.`);
		return { family: "Inter", style: "Regular" };
	}
}

async function runMyPlugin(keyword: number, sectionNames: string[]) {
	await tryLoadingFont({ family: "Manrope", style: "Regular" });
	const numberOfSections = sectionNames.length;

	// This plugin creates rectangles on the screen.
	const nodes: SceneNode[] = [];
	for (let i = 0; i < numberOfSections; i++) {
		const sec = figma.createSection();
		sec.resizeWithoutConstraints(20000, 2400);
		sec.y = i * 3000;
		sec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.5 }];
		const secOffset = 80;

		// Use the name from the array, or a default if index is out of bounds
		sec.name = sectionNames[i] || `Section ${i + 1}`;

		// Get the Section Organizer component
		const componentKey = "720ca13cba409e2efb5cee1171b2c6468e6daf04"; // The component key
		let c = await figma.importComponentByKeyAsync(componentKey);

		// Create the instance of Section Organizer
		let coverTile = c.createInstance();
		coverTile.resizeWithoutConstraints(1920, 2240); // Set size of section organizer component
		coverTile.x = secOffset; // Set x position
		coverTile.y = secOffset; // Set y position

		// Add section organizer cover
		sec.insertChild(0, coverTile);

		// Create and append multiple subsections
		const numberOfSubSections = keyword; // Adjust this number as needed
		const subGap = 64;
		for (let j = 0; j < numberOfSubSections; j++) {
			const subSec = figma.createSection();
			subSec.resizeWithoutConstraints(3000, 2240);
			subSec.x = secOffset + coverTile.width + j * (subSec.width + subGap);
			subSec.y = secOffset;
			subSec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 1 }];

			// //Create title section for each subsection
			const titleText = figma.createText();
			titleText.fontName = { family: "Manrope", style: "Regular" };
			titleText.x = 300;
			titleText.y = 200;
			titleText.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 1 }];
			titleText.fontSize = 80;
			titleText.characters = `Title`;
			//titleText.characters = sectionNames[i] || `Title`;
			subSec.appendChild(titleText);
			sec.appendChild(subSec);
		}

		//resize section to fit all subsections
		const secWidth = coverTile.width + secOffset * 2 + numberOfSubSections * 3000 + (numberOfSubSections - 1) * subGap;
		sec.resizeWithoutConstraints(secWidth, 2400);

		// Add the section to the page
		figma.currentPage.appendChild(sec);
		nodes.push(sec);
	}

	figma.currentPage.selection = nodes;
	figma.viewport.scrollAndZoomIntoView(nodes);

	// Make sure to close the plugin when you're done. Otherwise the plugin will
	// keep running, which shows the cancel button at the bottom of the screen.
	figma.closePlugin();
}

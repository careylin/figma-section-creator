// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

//Show window
figma.showUI(__html__);

//Resize it
figma.ui.resize(300, 500);

//Listen for messages from UI
figma.ui.onmessage = (message) => {
	console.log(message);
	createSections(message.keyword, message.sectionNames);
};

const FONT = { family: "Manrope", style: "Regular" };
const SEC_HEIGHT = 2400; // Height of the main section
const SEC_VMARGIN = SEC_HEIGHT + 500; // change number to increase vertical margin
const SEC_PADDING = 80; // internal padding of the main section
const TILE_HEIGHT = SEC_HEIGHT - SEC_PADDING * 2; // Height of the tile
const SUB_GAP = 64; // H-gap between subsections

//Load fonts - must be done before creating any text nodes
async function tryLoadingFont(fontName: FontName): Promise<FontName> {
	try {
		await figma.loadFontAsync(FONT);
		return fontName;
	} catch (error) {
		console.log(`Font '${fontName.family}' could not be loaded. Please install or change the component font.`);
		return { family: "Inter", style: "Regular" };
	}
}

async function createSections(keyword: number, sectionNames: string[]) {
	await tryLoadingFont(FONT);
	const numberOfSections = sectionNames.length;

	// This plugin creates rectangles on the screen.
	const nodes: SceneNode[] = [];
	for (let i = 0; i < numberOfSections; i++) {
		const sec = figma.createSection();
		sec.resizeWithoutConstraints(20000, SEC_HEIGHT);
		sec.y = i * SEC_VMARGIN; // vertical gap between main sections
		sec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.2 }];

		// Use the name from the array, or a default if index is out of bounds
		sec.name = sectionNames[i] || `Section ${i + 1}`;

		// Get the Section Organizer component
		const componentKey = "720ca13cba409e2efb5cee1171b2c6468e6daf04"; // The component key
		let c = await figma.importComponentByKeyAsync(componentKey);

		// Create the instance of Section Organizer
		let coverTile = c.createInstance();
		coverTile.resizeWithoutConstraints(1920, TILE_HEIGHT); // Set size of section organizer component
		coverTile.x = SEC_PADDING; // Set x position
		coverTile.y = SEC_PADDING; // Set y position

		// Add section organizer cover
		sec.insertChild(0, coverTile);

		// Create and append multiple subsections
		const numberOfSubSections = keyword; // Adjust this number as needed
		for (let j = 0; j < numberOfSubSections; j++) {
			const subSec = figma.createSection();
			subSec.resizeWithoutConstraints(3000, TILE_HEIGHT);
			subSec.x = SEC_PADDING + coverTile.width + j * (subSec.width + SUB_GAP);
			subSec.y = SEC_PADDING;
			subSec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
			subSec.name = `—`;

			//Create autolayout frame for title and subtitle
			const titleFrame = figma.createFrame();
			titleFrame.layoutMode = "VERTICAL";
			titleFrame.itemSpacing = 24; // 24px vertical gap

			titleFrame.paddingLeft = 0;
			titleFrame.paddingRight = 0;
			titleFrame.paddingTop = 0;
			titleFrame.paddingBottom = 0;
			titleFrame.strokes = [{
				type: "SOLID",
				color: { r: 0, g: 0, b: 0 }, // Black color
				opacity: 0.1 // 10% opacity for a subtle effect
			  }];
			titleFrame.strokeBottomWeight = 1; // 1px stroke weight only at the bottom
			titleFrame.strokeTopWeight = 0;
			titleFrame.strokeLeftWeight = 0;
			titleFrame.strokeRightWeight = 0;
			titleFrame.primaryAxisSizingMode = "AUTO";
			titleFrame.counterAxisSizingMode = "FIXED";
			titleFrame.name = "Title Frame";

			// Create title section for each subsection
			const titleText = figma.createText();
			titleText.fontName = FONT;
			titleText.x = 300;
			titleText.y = 200;
			titleText.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 1 }];
			titleText.fontSize = 48;
			titleText.characters = `Title`;
			//titleText.characters = sectionNames[i] || `Title`;

			// Create subtitle text node
			const subtitleText = figma.createText();
			subtitleText.fontName = FONT;
			subtitleText.characters = "Overview";
			subtitleText.fontSize = 24;
			subtitleText.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
			subtitleText.x = titleText.x;
			subtitleText.y = titleText.y + titleFrame.height + 80
			subtitleText.name = "Subtitle";

			// Create a frame for content
			const contentFrame = figma.createFrame();
			contentFrame.resize(1440, 960);
			contentFrame.x = titleText.x;
			contentFrame.name = "Screen";
			contentFrame.y = subtitleText.y + subtitleText.height + 200;
			contentFrame.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.92, b: 0.90 } }];

			// Create an auto layout frame for the notes
			const notesFrame = figma.createFrame();
			notesFrame.name = "Notes Frame";
			notesFrame.layoutMode = "VERTICAL";
			notesFrame.itemSpacing = 24; // 24px vertical gap
			notesFrame.paddingLeft = 0;
			notesFrame.paddingRight = 0;
			notesFrame.paddingTop = 0;
			notesFrame.paddingBottom = 0;
			notesFrame.layoutAlign = "STRETCH";
			notesFrame.primaryAxisSizingMode = "AUTO";
			notesFrame.counterAxisSizingMode = "AUTO";

			// Create a new text node for notes
			const notesText = figma.createText();
			notesText.fontName = FONT;
			notesText.characters = "Notes";
			notesText.fontSize = 24;
			notesText.fills = [{ type: "SOLID", color: { r: 0.482, g: 0.38, b: 1 } }]; // Purple color

			const bullets = figma.createText();
			bullets.fontName = FONT;
			bullets.fontSize = 24;
			bullets.fills = [{ type: "SOLID", color: { r: 0.482, g: 0.38, b: 1 } }]; // Purple color
			bullets.characters = "XXX\nXXX\nXXX";

			// Apply bulleted list formatting
			bullets.setRangeListOptions(0, bullets.characters.length, {
				type: "UNORDERED",
			});

			const titleFrameWidth = subSec.width - (300*2);
			// Add title to title frame
			titleFrame.appendChild(titleText);
			titleFrame.x = 300;
			titleFrame.y = 200;
			titleFrame.resize(titleFrameWidth, 80);

			// Add the notes text to the auto layout frame
			notesFrame.appendChild(notesText);
			notesFrame.appendChild(bullets);

			// Position the notes frame 100px below the content frame
			notesFrame.x = contentFrame.x;
			notesFrame.y = contentFrame.y + contentFrame.height + 100;
			
			subSec.appendChild(titleFrame);
			subSec.appendChild(contentFrame);
			subSec.appendChild(subtitleText);
			subSec.appendChild(notesFrame);
			
			sec.appendChild(subSec);
		}

		//resize section to fit all subsections
		const secWidth = coverTile.width + SEC_PADDING * 2 + numberOfSubSections * 3000 + (numberOfSubSections - 1) * SUB_GAP;
		sec.resizeWithoutConstraints(secWidth, SEC_HEIGHT);

		// Add the section to the page
		figma.currentPage.appendChild(sec);
		nodes.push(sec);
	}

	figma.currentPage.selection = nodes;
	figma.viewport.scrollAndZoomIntoView(nodes);

	// Make sure to close the plugin when you're done.
	figma.closePlugin();
}

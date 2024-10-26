// Plugin code for Figma document access
figma.showUI(__html__);
figma.ui.resize(300, 500);

figma.ui.onmessage = (message) => {
	createSections(message.numberOfSubSections, message.sectionNames, message.includeMobile, message.includeDesktop);
};

const FONT = { family: "Manrope", style: "Regular" };
const MEDIUM_FONT = { family: "Manrope", style: "Medium" };
const FALLBACK_FONT = { family: "Inter", style: "Regular" };

async function loadFont(): Promise<FontName> {
	try {
		await figma.loadFontAsync(FONT);
		await figma.loadFontAsync(MEDIUM_FONT);
		return FONT;
	} catch {
		return FALLBACK_FONT;
	}
}

const SEC_HEIGHT = 2400; // Height of the main section
const SEC_VMARGIN = SEC_HEIGHT + 500; // change number to increase vertical margin
const SEC_PADDING = 80; // internal padding of the main section
const TILE_HEIGHT = SEC_HEIGHT - SEC_PADDING * 2; // Height of the tile
const SUB_GAP = 64; // H-gap between subsections

async function createSections(numberOfSubSections: number, sectionNames: string[], includeMobile: boolean, includeDesktop: boolean) {
	const font = await loadFont();
	const nodes: SceneNode[] = [];
	const numberOfSections = sectionNames.length;
	let subSecWidth = 0;

	for (let i = 0; i < numberOfSections; i++) {
		// Create main section
		const sec = figma.createSection();
		sec.name = sectionNames[i] || `Section ${i + 1}`;
		sec.y = i * SEC_VMARGIN;
		sec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.2 }];

		// Add section organizer
		const coverTile = await figma.importComponentByKeyAsync("720ca13cba409e2efb5cee1171b2c6468e6daf04").then((c) => {
			const instance = c.createInstance();
			instance.resizeWithoutConstraints(1920, TILE_HEIGHT);
			instance.x = instance.y = SEC_PADDING;
			const titleNode = instance.findOne((node) => node.type === "TEXT" && node.name === "Title") as TextNode;
			titleNode.characters = sectionNames[i] || `Section ${i + 1}`;
			return instance;
		});
		sec.insertChild(0, coverTile);

		for (let j = 0; j < numberOfSubSections; j++) {
			const subSec = figma.createSection();
			subSec.name = "—";
			subSec.resizeWithoutConstraints(3220, TILE_HEIGHT);
			subSec.x = SEC_PADDING + coverTile.width + j * (subSec.width + SUB_GAP);
			subSec.y = SEC_PADDING;
			subSec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 1 }];

			// Create title frame
			const titleFrame = figma.createFrame();
			titleFrame.layoutMode = "VERTICAL";
			titleFrame.itemSpacing = 24;
			titleFrame.strokeBottomWeight = 1;
			titleFrame.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.1 }];
			titleFrame.primaryAxisSizingMode = "AUTO";
			titleFrame.counterAxisSizingMode = "FIXED";
			titleFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
			titleFrame.x = 300;
			titleFrame.y = 200;

			// Add title text
			const titleText = figma.createText();
			titleText.fontName = font;
			titleText.fontSize = 48;
			titleText.characters = "Title";
			titleText.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
			titleFrame.appendChild(titleText);

			// Add subtitle
			const subtitleText = figma.createText();
			subtitleText.fontName = font;
			subtitleText.fontSize = 24;
			subtitleText.characters = "Overview";
			subtitleText.name = "Subtitle";
			subtitleText.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
			subtitleText.x = titleFrame.x;
			subtitleText.y = titleFrame.y + titleFrame.height + 80;

			// Add content frame
			const deskScreen = figma.createFrame();
			deskScreen.resizeWithoutConstraints(1440, 960);
			deskScreen.x = titleFrame.x;
			deskScreen.y = subtitleText.y + subtitleText.height + 200;
			deskScreen.name = "Screen";
			deskScreen.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.92, b: 0.9 } }];

			// Create notes frame with title and bullet points
			const notesFrame = createNotesFrame(font, deskScreen.x, deskScreen.y + deskScreen.height + 100);

			function createNotesFrame(font: FontName, x: number, y: number): FrameNode {
				// Add notes frame
				const notesFrame = figma.createFrame();
				notesFrame.layoutMode = "VERTICAL";
				notesFrame.itemSpacing = 24;
				notesFrame.layoutAlign = "STRETCH";
				notesFrame.resizeWithoutConstraints(390, 80);
				notesFrame.primaryAxisSizingMode = "AUTO";
				notesFrame.counterAxisSizingMode = "FIXED";
				notesFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
				notesFrame.strokes = [{ type: "SOLID", color: { r: 0.482, g: 0.38, b: 1 } }];
				notesFrame.strokeTopWeight = 1;
				notesFrame.paddingTop = 24;
				notesFrame.x = x;
				notesFrame.y = y;

				// Add notes text
				const notesText = figma.createText();
				notesText.fontName = font;
				notesText.fontSize = 24;
				notesText.characters = "Notes";
			
				notesText.fills = [{ type: "SOLID", color: { r: 0.482, g: 0.38, b: 1 } }];

				const bullets = figma.createText();
				bullets.fontName = font;
				bullets.fontSize = 24;
				bullets.layoutAlign = "STRETCH";
				bullets.characters = "XXX\nXXX\nXXX";
				bullets.fills = [{ type: "SOLID", color: { r: 0.482, g: 0.38, b: 1 } }];
				bullets.setRangeListOptions(0, bullets.characters.length, {
					type: "UNORDERED",
				});

				notesFrame.appendChild(notesText);
				notesFrame.appendChild(bullets);

				return notesFrame;
			}
			const NUM_MOBILE_SCREENS = 3;
			for (let k = 0; k < NUM_MOBILE_SCREENS; k++) {
				const mobileScreen = figma.createFrame();
				mobileScreen.resizeWithoutConstraints(390, 844);
				mobileScreen.x = titleFrame.x + deskScreen.width + 100 + k * (390 + 100);
				mobileScreen.y = deskScreen.y;
				mobileScreen.name = `Mobile ${k + 1}`;
				mobileScreen.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.92, b: 0.9 } }];
				subSec.appendChild(mobileScreen);

				// Create notes frame for each mobile screen
				const mobileNotesFrame = createNotesFrame(
					font,
					mobileScreen.x,
					mobileScreen.y + mobileScreen.height + 100
				);
				subSec.appendChild(mobileNotesFrame);
			}

			const contentWidth = deskScreen.width + NUM_MOBILE_SCREENS * (390 + 100);
			const subSecMargin = titleFrame.x * 2;

			// Calculate section width using the same formula as before
			subSecWidth = contentWidth + subSecMargin;
			subSec.resizeWithoutConstraints(subSecWidth, TILE_HEIGHT);
			titleFrame.resize(contentWidth, 80);

			// Add all elements to subsection
			subSec.appendChild(titleFrame);
			subSec.appendChild(deskScreen);
			subSec.appendChild(subtitleText);
			subSec.appendChild(notesFrame);
			sec.appendChild(subSec);
		}

		//resize section to fit all subsections
		const secWidth = coverTile.width + SEC_PADDING * 2 + numberOfSubSections * subSecWidth + (numberOfSubSections - 1) * SUB_GAP;
		sec.resizeWithoutConstraints(secWidth, SEC_HEIGHT);

		figma.currentPage.appendChild(sec);
		nodes.push(sec);
	}

	figma.viewport.scrollAndZoomIntoView(nodes);
	figma.closePlugin();
}

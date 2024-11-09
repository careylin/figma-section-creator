// Plugin code for Figma document access
figma.showUI(__html__);
figma.ui.resize(300, 500);

figma.ui.onmessage = (message) => {
	NUM_MOBILE_SCREENS = message.numberOfMobileScreens;
	NUM_DESK_SCREENS = message.numberOfDesktopScreens;
	createSections(
		message.numberOfSubSections, 
		message.sectionNames, 
		message.includeMobile, 
		message.includeDesktop
	);
};

const FONT = { family: "Manrope", style: "Regular" };
const MEDIUM_FONT = { family: "Manrope", style: "Medium" };
const FALLBACK_FONT = { family: "Inter", style: "Regular" };

let NUM_MOBILE_SCREENS = 3;
let NUM_DESK_SCREENS = 2;

const SCREEN_GAP = 100;

const SEC_HEIGHT = 2400; // Height of the main section
const SEC_VMARGIN = SEC_HEIGHT + 500; // change number to increase vertical margin
const SEC_PADDING = 80; // internal padding of the main section
const TILE_HEIGHT = SEC_HEIGHT - SEC_PADDING * 2; // Height of the tile
const SUB_GAP = 64; // H-gap between subsections

async function loadFont(): Promise<FontName> {
	try {
		await figma.loadFontAsync(FONT);
		await figma.loadFontAsync(MEDIUM_FONT);
		return FONT;
	} catch {
		return FALLBACK_FONT;
	}
}

async function createSections(numberOfSubSections: number, sectionNames: string[], includeMobile: boolean, includeDesktop: boolean) {
	const font = await loadFont();
	const nodes: SceneNode[] = [];
	const numberOfSections = sectionNames.length;
	let subSecWidth = 0;
	let deskScreen: FrameNode | null = null;

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
			// define x position later down
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
			if (includeDesktop) {
				for (let k = 0; k < NUM_DESK_SCREENS; k++) {
					deskScreen = figma.createFrame();
					deskScreen.resizeWithoutConstraints(1440, 960);
					deskScreen.x = titleFrame.x + (k * (deskScreen.width + SCREEN_GAP));
					deskScreen.y = subtitleText.y + subtitleText.height + 200;
					deskScreen.name = "Screen";
					deskScreen.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.92, b: 0.9 } }];

					// Create notes frame with title and bullet points
					const deskNotesFrame = createNotesFrame(font, deskScreen.x, deskScreen.y + deskScreen.height + SCREEN_GAP);
					subSec.appendChild(deskScreen);
					subSec.appendChild(deskNotesFrame);
				}
			}

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

			// Calculate content and subsection width
			const subSecMargin = titleFrame.x * 2;
			const desktopWidth = includeDesktop ? (1440 + SCREEN_GAP) * NUM_DESK_SCREENS - SCREEN_GAP : 0;
			const mobileWidth = includeMobile ? (390 + SCREEN_GAP) * 3 - SCREEN_GAP : 0;
			const spaceBetweenDesktopAndMobile = includeDesktop && includeMobile ? SCREEN_GAP : 0;
			const contentWidth = desktopWidth + mobileWidth + spaceBetweenDesktopAndMobile;
			subSecWidth = contentWidth + subSecMargin;

			// Only create mobile screens if includeMobile is true
			if (includeMobile) {
				for (let k = 0; k < NUM_MOBILE_SCREENS; k++) {
					const mobileScreen = figma.createFrame();
					mobileScreen.resizeWithoutConstraints(390, 844);
					mobileScreen.x = titleFrame.x + 
						(includeDesktop && deskScreen ? (deskScreen.width + SCREEN_GAP) * NUM_DESK_SCREENS : 0) + 
						k * (390 + SCREEN_GAP);
					mobileScreen.y = includeDesktop && deskScreen ? deskScreen.y : titleFrame.y + titleFrame.height + 200;
					mobileScreen.name = `Mobile ${k + 1}`;
					mobileScreen.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.92, b: 0.9 } }];
					subSec.appendChild(mobileScreen);

					// Create notes frame for each mobile screen
					const mobileNotesFrame = createNotesFrame(font, mobileScreen.x, mobileScreen.y + mobileScreen.height + SCREEN_GAP);
					subSec.appendChild(mobileNotesFrame);
				}
			}

			// Calculate section width using the same formula as before
			subSecWidth = contentWidth + subSecMargin;
			subSec.resizeWithoutConstraints(subSecWidth, TILE_HEIGHT);
			titleFrame.resize(contentWidth, 80);
			subSec.x = SEC_PADDING + coverTile.width + j * (subSec.width + SUB_GAP);

			// Add all elements to subsection
			subSec.appendChild(titleFrame);
			if (deskScreen) {
				subSec.appendChild(deskScreen);
				// subSec.appendChild(deskNotesFrame);
			}
			subSec.appendChild(subtitleText);
			sec.appendChild(subSec);
		}
		//resize section to fit all subsections
		const secWidth = coverTile.width + SEC_PADDING * 2 + numberOfSubSections * subSecWidth + (numberOfSubSections - 1) * SUB_GAP;
		sec.resizeWithoutConstraints(secWidth, SEC_HEIGHT);

		// Get viewport center coordinates
		const viewportCenter = figma.viewport.center;

		// Position section relative to viewport center
		sec.x = viewportCenter.x - secWidth / 2;

		figma.currentPage.appendChild(sec);
		nodes.push(sec);
	}

	figma.viewport.scrollAndZoomIntoView(nodes);
	figma.closePlugin();
}

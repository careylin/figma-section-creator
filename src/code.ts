// Plugin code for Figma document access
figma.showUI(__html__);
figma.ui.resize(300, 500);

figma.ui.onmessage = (message) => {
  createSections(message.numberOfSubSections, message.sectionNames);
};

const FONT = { family: "Manrope", style: "Regular" };
const FALLBACK_FONT = { family: "Inter", style: "Regular" };

async function loadFont(): Promise<FontName> {
  try {
    await figma.loadFontAsync(FONT);
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

async function createSections(numberOfSubSections: number, sectionNames: string[]) {
  const font = await loadFont();
  const nodes: SceneNode[] = [];
  const numberOfSections = sectionNames.length;

  for (let i = 0; i < numberOfSections; i++) {
    // Create main section
    const sec = figma.createSection();
    sec.name = sectionNames[i] || `Section ${i + 1}`;
    sec.y = i * SEC_VMARGIN;
    sec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.2 }];

    // Add section organizer
    const coverTile = await figma.importComponentByKeyAsync(
      "720ca13cba409e2efb5cee1171b2c6468e6daf04"
    ).then(c => {
      const instance = c.createInstance();
      instance.resizeWithoutConstraints(1920, TILE_HEIGHT);
      instance.x = instance.y = SEC_PADDING;
      return instance;
    });
    sec.insertChild(0, coverTile);


    for (let j = 0; j < numberOfSubSections; j++) {
      const subSec = figma.createSection();
      subSec.name = "—";
      subSec.resizeWithoutConstraints(3000, TILE_HEIGHT);
      subSec.x = SEC_PADDING + coverTile.width + j * (subSec.width + SUB_GAP);
      subSec.y = SEC_PADDING;
      subSec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 1 }];

      // Create title frame
      const titleFrame = figma.createFrame();
      titleFrame.layoutMode = "VERTICAL";
      titleFrame.itemSpacing = 24;
      titleFrame.strokeBottomWeight = 1;
      titleFrame.strokes = [{
        type: "SOLID",
        color: { r: 0, g: 0, b: 0 },
        opacity: 0.1
      }];
      titleFrame.primaryAxisSizingMode = "AUTO";
      titleFrame.counterAxisSizingMode = "FIXED";
      titleFrame.resize(subSec.width - 600, 80);
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
      const contentFrame = figma.createFrame();
      contentFrame.resize(1440, 960);
      contentFrame.x = titleFrame.x;
      contentFrame.y = subtitleText.y + subtitleText.height + 200;
	  contentFrame.name = "Screen";
      contentFrame.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.92, b: 0.90 } }];

      // Add notes frame
      const notesFrame = figma.createFrame();
      notesFrame.layoutMode = "VERTICAL";
      notesFrame.itemSpacing = 24;
      notesFrame.layoutAlign = "STRETCH";
      notesFrame.primaryAxisSizingMode = "AUTO";
      notesFrame.counterAxisSizingMode = "AUTO";
      notesFrame.x = contentFrame.x;
      notesFrame.y = contentFrame.y + contentFrame.height + 100;

      // Add notes text
      const notesText = figma.createText();
      notesText.fontName = font;
      notesText.fontSize = 24;
      notesText.characters = "Notes";
      notesText.fills = [{ type: "SOLID", color: { r: 0.482, g: 0.38, b: 1 } }];

      const bullets = figma.createText();
      bullets.fontName = font;
      bullets.fontSize = 24;
      bullets.characters = "XXX\nXXX\nXXX";
      bullets.fills = [{ type: "SOLID", color: { r: 0.482, g: 0.38, b: 1 } }];
      bullets.setRangeListOptions(0, bullets.characters.length, {
        type: "UNORDERED",
      });

      notesFrame.appendChild(notesText);
      notesFrame.appendChild(bullets);

      // Add all elements to subsection
      subSec.appendChild(titleFrame);
      subSec.appendChild(contentFrame); 
      subSec.appendChild(subtitleText);
      subSec.appendChild(notesFrame);
      sec.appendChild(subSec);
    }

		//resize section to fit all subsections
		const secWidth = coverTile.width + SEC_PADDING * 2 + numberOfSubSections * 3000 + (numberOfSubSections - 1) * SUB_GAP;
		sec.resizeWithoutConstraints(secWidth, SEC_HEIGHT);

    figma.currentPage.appendChild(sec);
    nodes.push(sec);
  }

  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
  figma.closePlugin();
}

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

const ccys = ['EUR', 'USD', 'JPY', 'GBP', 'CHF'];
const getRandomCcy = () => ccys[Math.floor(Math.random() * ccys.length)];
let x = 0;

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 300, height: 250 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-rectangles') {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;

    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  else if (msg.type === 'log') {
    for (const node of figma.currentPage.selection) {
      console.log(node.name, node.id, (node as ComponentNode).key);
    }
  }
  else if (msg.type === 'generate') {
    let y = 0;
    let width = 80;

    //  LT/Grid Header/Text Left Aligned ce58b827188a7c3b73a1a02ec23e64742144f3f3
    //  LT/Grid Header/Text Right Aligned 0ab112de7c5dc99e6cd039b96c78e27235b93097
    const nodes: SceneNode[] = [];

    const headerComponent = await figma.importComponentByKeyAsync(msg.align === 'right' ? '0ab112de7c5dc99e6cd039b96c78e27235b93097' : 'ce58b827188a7c3b73a1a02ec23e64742144f3f3');
    console.log('Imported', headerComponent.name);
    const headerInstance = headerComponent.createInstance();
    headerInstance.x = x;
    headerInstance.y = y;
    headerInstance.resize(width, headerInstance.height);
    y += headerInstance.height; // Set next element y

    const headerTextNode = headerInstance.findChild(x => x.name === 'Value') as TextNode;
    if (msg.headerName) {
      // Without loading font, this may fail as warning in console
      await figma.loadFontAsync(headerTextNode.fontName as FontName)
      headerTextNode.characters = msg.headerName;
    }
    nodes.push(headerInstance);



    // LT/Grid Cell/Text/Long d8c2b69bd6b833e208f55c3024b9e6e1864fe58b
    // LT/Grid Cell/Number/Positive f4f95268029c0250517679eaa3b2cbb55201aa41
    // LT/Grid Cell/Number/Negative 901d1d8490d5512e2cbfe41bc288a6002c382f48
    // LT/Grid Cell/Text/Date 6195:64790 ee3311d8533549a35899c9f95bfe69a17878671a

    let cellKey = 'ee3311d8533549a35899c9f95bfe69a17878671a';
    let numberValue = 0;

    const isQty = msg.columnType === 'qty'
    const isCcy = msg.columnType === 'ccy'

    for (let i = 0; i < msg.count; i++) {
      if (isQty) {
        numberValue = Math.random() * 2 - 1;
        if (numberValue > 0) {
          cellKey = 'f4f95268029c0250517679eaa3b2cbb55201aa41'
        } else {
          cellKey = '901d1d8490d5512e2cbfe41bc288a6002c382f48'
        }
      }
      const cellComponent = await figma.importComponentByKeyAsync(cellKey);

      const cellInstance = cellComponent.createInstance();
      cellInstance.x = x;
      cellInstance.y = y;
      cellInstance.resize(width, cellInstance.height);
      y += cellInstance.height;

      const cellTextNode = cellInstance.findChild(x => x.name === 'Cell Text') as TextNode;

      await figma.loadFontAsync(cellTextNode.fontName as FontName)

      let cellTextValue = 'text'

      if (isCcy) {
        cellTextValue = getRandomCcy()
      } else if (isQty) {
        cellTextValue = numberValue.toFixed(4);
      }

      cellTextNode.characters = cellTextValue;

      nodes.push(cellInstance);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);

    x += width; // So we can generate more on the right
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};

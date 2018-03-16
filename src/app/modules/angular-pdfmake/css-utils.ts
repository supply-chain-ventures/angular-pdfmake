/**
 * Contains utilities for converting CSS styles to pdfMake styles, or viceversa.
 */

/**
 * Maps size units (e.g., pixels to points, cm to points, etc.).
 */
export const UnitConversions = {
  pxToPt: 0.75,
  ptToPx: 1 / 0.75,
  cmToPt: 28.3465,
  ptToCm: 1 / 28.3465
}

/**
 * Maps CSS styles to pdfMake styles (key: value).
 */
export const CSSStyleToPDFStyleMap = {
  'border': {
    'key': 'border',
    // pdfMake border syntax: border: [false, true, false, false], corresponds to 
    // [left, top, right, bottom]
    'value': (value: string) => {
      // CSS border syntax: border: 0px none rgba(0, 0, 0, 0.87)
      let valueTokens = value.split(' ');
      if (valueTokens.length > 0) {
        let borderWidth = removeNonNumeric(valueTokens[0]);  // Remove non-numeric (e.g. 'px')
        if (borderWidth) {
          return [true, true, true, true];
        }
      }
      return [false, false, false, false];
    }
  },
  'border-bottom': {
    'key': 'border',
    'value': (value: string) => {
      let valueTokens = value.split(' ');
      if (valueTokens.length > 0) {
        let borderWidth = removeNonNumeric(valueTokens[0]);  // Remove non-numeric (e.g. 'px')
        if (borderWidth) {
          return [false, false, false, true];
        }
      }
      return [false, false, false, false];
    }
  },
  'border-left': {
    'key': 'border',
    'value': (value: string) => {
      let valueTokens = value.split(' ');
      if (valueTokens.length > 0) {
        let borderWidth = removeNonNumeric(valueTokens[0]);  // Remove non-numeric (e.g. 'px')
        if (borderWidth) {
          return [true, false, false, false];
        }
      }
      return [false, false, false, false];
    }
  },
  'border-right': {
    'key': 'border',
    'value': (value: string) => {
      let valueTokens = value.split(' ');
      if (valueTokens.length > 0) {
        let borderWidth = removeNonNumeric(valueTokens[0]);  // Remove non-numeric (e.g. 'px')
        if (borderWidth) {
          return [false, false, true, false];
        }
      }
      return [false, false, false, false];
    }
  },
  'border-top': {
    'key': 'border',
    'value': (value: string) => {
      let valueTokens = value.split(' ');
      if (valueTokens.length > 0) {
        let borderWidth = removeNonNumeric(valueTokens[0]);  // Remove non-numeric (e.g. 'px')
        if (borderWidth) {
          return [false, true, false, false];
        }
      }
      return [false, false, false, false];
    }
  },
  'font-size': {
    'key': 'fontSize',
    'value': (value: string) => {
      let fontSize = removeNonNumeric(value);
      // Convert px -> pt if necessary
      if (value.includes('px')) {
        fontSize *= UnitConversions.pxToPt;
      }
      return fontSize;
    }
  },
  'font-style': {
    'key': 'italics',
    'value': (value: string) => {
      return value.toLowerCase() === 'italic' || value.toLowerCase() === 'oblique' ?
        true : false
    }
  },
  'font-weight': {
    'key': 'bold',
    'value': (value: string) => {
      return value.toLowerCase() === 'bold' || Number.parseInt(value) >= 700 ? true : false
    }
  },
  'margin': {
    'key': 'margin',
    // pdfMake margin syntax: margin: [10, 0, 20, 10], corresponds to 
    // [left, top, right, bottom]
    'value': (value: string) => {
      let valueTokens = value.split(' ');
      if (valueTokens.length === 1) {
        // CSS margin syntax: margin: 25px, corresponds to all sides
        let margin = removeNonNumeric(valueTokens[0]);
        // Convert px -> pt if necessary
        if (valueTokens[0].includes('px')) {
          margin *= UnitConversions.pxToPt;
        }
        return [margin, margin, margin, margin];
      } else if (valueTokens.length === 2) { 
        // CSS margin syntax: margin: 25px 50px, corresponds to
        // top-bottom left-right
        let marginTopBottom = removeNonNumeric(valueTokens[0]);
        let marginLeftRight = removeNonNumeric(valueTokens[1]);
        // Convert px -> pt if necessary
        if (valueTokens[0].includes('px')) {
          marginTopBottom *= UnitConversions.pxToPt;
          marginLeftRight *= UnitConversions.pxToPt;
        }
        return [marginLeftRight, marginTopBottom, marginLeftRight, marginTopBottom];
      } else if (valueTokens.length === 3) {
        // CSS margin syntax: margin: 25px 30px 15px, corresponds to
        // top left-right bottom
        let marginTop = removeNonNumeric(valueTokens[0]);
        let marginLeftRight = removeNonNumeric(valueTokens[1]);
        let marginBottom = removeNonNumeric(valueTokens[2]);
        // Convert px -> pt if necessary
        if (valueTokens[0].includes('px')) {
          marginTop *= UnitConversions.pxToPt;
          marginLeftRight *= UnitConversions.pxToPt;
          marginBottom *= UnitConversions.pxToPt;
        }
        return [marginLeftRight, marginTop, marginLeftRight, marginBottom];
      } else if (valueTokens.length === 4) {
        // CSS margin syntax: margin: 25px 10px 0px 20px, corresponds to
        // top right bottom left
        let marginTop = removeNonNumeric(valueTokens[0]);
        let marginRight = removeNonNumeric(valueTokens[1]);
        let marginBottom = removeNonNumeric(valueTokens[2]);
        let marginLeft = removeNonNumeric(valueTokens[3]);
        // Convert px -> pt if necessary
        if (valueTokens[0].includes('px')) {
          marginTop *= UnitConversions.pxToPt;
          marginRight *= UnitConversions.pxToPt;
          marginBottom *= UnitConversions.pxToPt;
          marginLeft *= UnitConversions.pxToPt;
        }
        return [marginLeft, marginTop, marginRight, marginBottom];
      } else {
        return [0, 0, 0, 0];
      }
    }
  },
  'text-align': {
    'key': 'alignment',
    'value': (value: string) => {
      return value;
    }
  }
};

/**
 * Removes non-numeric characters from a string and returns value as a number.
 * For example, if the value is '20.45px', the function returns 20.45.
 * @param value - The string value (e.g. '20px') to convert.
 */
function removeNonNumeric(value: string): number {
  return Number.parseInt(value.replace(/[^\d.,]/g, ''));
}

/**
  * Assign styles to pdfMake elements based on the HTML element's styles.
  * If the styles were added correctly (i.e., if the element has been added to the DOM),
  * this function returns true, and false otherwise.
  * @param pdfElement - The pdfElement object to modify
  * @param htmlElement - The HTMl element from which to pick up the styles
  */
export function assignPdfElementStyles(pdfElement: any, htmlElement: HTMLElement): boolean {
  var computedStyle = window.getComputedStyle(htmlElement, null);
  var stylesAssigned = false;
  for(let style in CSSStyleToPDFStyleMap) {
    if (computedStyle[style]) {
      stylesAssigned = true;
      let cssValue = computedStyle.getPropertyValue(style);
      let key = CSSStyleToPDFStyleMap[style].key;
      let value = CSSStyleToPDFStyleMap[style].value(cssValue);

      // If style is already in pdf Element, join
      if (pdfElement[key]) {
        let oldValue = pdfElement[key];
        value = joinPdfElementStyles(oldValue, value);
      }

      // If value is false/zero or an array of false/zero, ignore
      if (value) {
        if (Array.isArray(value)) {
          let valueArray = value as Array<boolean>;
          if (!valueArray.every(i => !i)) {
            pdfElement[key] = value;
          }
        } else {
          pdfElement[key] = value;
        }
      }
    }
  }

  return stylesAssigned;
}

/**
 * Joing two pdfMake element styles, in case a style key previously existed in the
 * element. The joining strategy uses or in case of booleans and boolean arrays.
 * If the value is not a boolean or boolean array, then the new value is returned.
 * @param oldValue
 * @param newValue
 */
function joinPdfElementStyles(oldValue, newValue): any {
  // Check both are the same type (should never happen, though)
  if (typeof oldValue === typeof newValue) {
    // If boolean or array of boolean, join with or
    if (typeof oldValue === 'boolean') {
      newValue = oldValue || newValue;
    } else if (Array.isArray(oldValue)) {
      let oldValueArray = oldValue as Array<any>;
      let newValueArray = newValue as Array<any>;
      if (typeof oldValueArray[0] === 'boolean') {
        for (let i = 0; i < oldValueArray.length; i++) {
          newValueArray[i] = oldValueArray[i] || newValueArray[i];
        }
      }
    }
  }
  
  return newValue;
}

/**
 * Update an HTML table's styles based on the given table properties.
 * @param htmlTable - The HTML table to update
 * @param tableWidth - The width style for the table, which can be:
 * 'full' - Table width is 100%,
 * 'auto' - Columns are automatically sized to fit the text,
 * a number - A fixed column width in pixels (e.g., 100).
 * @param tableLayout - The table layout (e.g., 'default', 'noBorders', 'headerLineOnly', 'lightHorizontalLines')
 * @param headerRowCount - The number of header rows in the table
 */
export function updateHTMLTableCSS(htmlTable: HTMLTableElement, tableWidth: string | number,
    tableLayout: string, headerRowCount: number = 1): void {

  // Collapse borders
  htmlTable.style.borderCollapse = 'collapse';

  // Override table CSS borders
  tableLayout = tableLayout && tableLayout.toLowerCase();
  var rows: HTMLTableRowElement[] = [];
  for(let i = 0; i < htmlTable.rows.length; i++) {
    rows.push(htmlTable.rows[i] as HTMLTableRowElement);
  }
  var rowIndex = 0;
  for(let row of rows) {
    let cells: HTMLTableCellElement[] = [];
    for (let i = 0; i < row.cells.length; i++) {
      cells.push(row.cells[i] as HTMLTableCellElement);
    }
    for (let cell of cells) {
      // 'default', 'noBorders', 'headerLineOnly', 'lightHorizontalLines'
      switch (tableLayout) {
        case 'default':  // Borders all over
          cell.style.border = '1px solid black';
          break;
        case 'noborders':  // Do nothing (leave original CSS styles)
          break;
        case 'headerlineonly':  // Override borders
          cell.style.border = '0px none black';
          if (rowIndex === headerRowCount - 1) {
            cell.style.borderBottom = '1px solid black';
          }
          break;
        case 'lighthorizontallines':  // Override borders
          cell.style.border = '0px none black';
          if (rowIndex === headerRowCount - 1) {
            cell.style.borderBottom = '1px solid black';
          } else {
            cell.style.borderTop = '1px solid lightgrey';
          }
          break;
        default:  // undefined is default (borders all over)
          cell.style.border = '1px solid black';
          break;
      }
    }
    rowIndex++;
  }

  // Override table CSS width
  if (typeof tableWidth === 'string' && tableWidth.toLowerCase() === 'full') {
    htmlTable.width = "100%";
  } else if (typeof tableWidth === 'number') {
    // Assign widths to columns
    for (let row of rows) {
      let cells: HTMLTableCellElement[] = [];
      for (let i = 0; i < row.cells.length; i++) {
        cells.push(row.cells[i] as HTMLTableCellElement);
      }
      for (let cell of cells) {
        cell.width = `${tableWidth}px`;
      }
    }
  }
}

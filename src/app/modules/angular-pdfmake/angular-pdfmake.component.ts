import {
  Component, Input, Output, EventEmitter, Inject, LOCALE_ID, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import {
  CSSStyleToPDFStyleMap, assignPdfElementStyles,
  updateHTMLTableCSS, UnitConversions
} from './css-utils';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
assign(pdfMake, 'vfs', pdfFonts.pdfMake.vfs);
//pdfMake.vfs = pdfFonts.pdfMake.vfs;  // Illegal reassignment to import 'pdfMake'

/**
 * Utility function to assign a new property and value to an object.
 * This prevents the "Illegal reassignment to import..." that occurs when
 * packaging the library with packagr.
 * @param obj
 * @param prop
 * @param value
 */
function assign(obj: any, prop: any, value: any) {
  if (typeof prop === "string") {
    prop = prop.split(".");
  }

  if (prop.length > 1) {
    var e = prop.shift();
    this.assign(obj[e] =
      Object.prototype.toString.call(obj[e]) === "[object Object]"
        ? obj[e]
        : {},
      prop,
      value);
  } else {
    obj[prop[0]] = value;
  }
}

@Component({
  selector: 'ng-pdfmake',
  templateUrl: './angular-pdfmake.component.html',
  styleUrls: ['./angular-pdfmake.component.css']
})
export class AngularPDFMakeComponent implements AfterViewInit {
  // Translated messages
  locale: any;

  // UI/UX
  loadingData = false;

  // PDF doc
  @ViewChild('pdfContent') pdfContent;
  pdfDocDefinition: any;
  processedDoc = false;
  @Input('pageSize') pageSize = 'A4';  // Supported types: 'A3', 'A4', 'LETTER', 'LEGAL'

  // Page margins in cm, which actually translate to CSS padding, in the following order:
  // top, right, bottom, left
  @Input('pageMargins') pageMargins: number[] = [2.54, 2.54, 2.54, 2.54];  // Default Word document margins

  // Tables
  processedTables = 0;  // Number of tables processed

  // Table styles can be either one value (applies to all tables) or an array
  // of values, corresponding to each table from top to bottom.
  
  // Values: 'full', 'auto', col width (in pixels)
  @Input('tableWidths') tableWidths: any | any[] = 'auto';

  // Values: 'default', 'noBorders', 'headerLineOnly', 'lightHorizontalLines'
  @Input('tableLayouts') tableLayouts: string | string[] = 'default';  // Default has full borders

  // Images
  loadingImageFlags: boolean[] = [];

  // Event emitters
  @Output() error = new EventEmitter<string>();

  constructor(@Inject(LOCALE_ID) public localeId) {
    this.locale = this.localeId.split('-')[0];
  }

  ngAfterViewInit() {
    this.loadData();
  }

  /**
   * Load the PDF data from the HTML.
   */
  private loadData(): void {
    setTimeout(() => this.loadingData = true, 0);
    var imgCount = this.loadImages();

    // Wait until all images are loaded (if any) before building PDF object
    (function waitForImages(): void {
      var wait = waitForImages.bind(this);  // Bind function to this
      if (this.loadingImageFlags && this.loadingImageFlags.some(lif => lif)) {
        setTimeout(wait, 50);
        return;
      }

      // Images loaded, continue...
      this.buildDocDefinition();
      setTimeout(() => this.loadingData = false, 0);
    }).call(this);  // Bind function call to this class instance
  }

  /**
   * Load any <img> elements from the HTML first before building PDF
   * object.
   */
  private loadImages(): number {
    // Look for <img> elements
    var children: HTMLElement[] = this.pdfContent.nativeElement.children;
    var imgCount = 0;
    for (let childElement of children) {
      if (childElement.nodeName.toLowerCase() === 'img') {
        let count = imgCount;  // Lexical scope!
        this.loadingImageFlags.push(true);
        childElement.onload = () => this.loadingImageFlags[count] = false;
        imgCount++;
      }
      // Check images in tables
      if (childElement.nodeName.toLowerCase() === 'table') {
        let rows = Array.from((childElement as HTMLTableElement).rows) as HTMLTableRowElement[];
        for (let row of rows) {
          let cells = Array.from(row.cells) as HTMLTableCellElement[];
          for (let cell of cells) {
            if (cell.childElementCount > 0) {
              let children = Array.from(cell.children) as HTMLElement[];
              for (let child of children) {
                if (child.tagName.toLowerCase() === 'img') {
                  let count = imgCount;  // Lexical scope!
                  this.loadingImageFlags.push(true);
                  child.onload = () => this.loadingImageFlags[count] = false;
                  imgCount++;
                }
              }
            }
          }
        }
      }
    }
    return imgCount;
  }

  /**
   * Get a page-size class name based on the document's page size.
   */
  public get pageSizeClass(): string {
    switch (this.pageSize.toLowerCase()) {
      case 'a3':
        return 'page-a3';
      case 'a4':
        return 'page-a4';
      case 'letter':
        return 'page-letter';
      case 'legal':
        return 'page-legal';
      default:
        return 'a4';
    }
  }

  /**
   * Get a padding value based on the page's margins.
   * The padding is a string with 4 space-separated values.
   * e.g. '2cm 2cm 2cm 2cm'
   */
  public get pagePadding(): string {
    if (!this.pageMargins || !Array.isArray(this.pageMargins)) {
      return '0';
    }

    var padding = this.pageMargins.map(pm => `${pm}cm`).join(' ');
    return padding;
  }

  /**
   * Build the PDF Doc Definition used in pdfMake from the HTML content.
   */
  private buildDocDefinition(): void {
    this.processedTables = 0;
    
    var children: HTMLElement[] = this.pdfContent.nativeElement.children;
    var content: any[] = [];
    for (let childElement of children) {
      content.push(this.buildPDFElement(childElement));
    }

    // Content
    this.pdfDocDefinition = { content: content, pageSize: this.pageSize };

    // Page margins
    if (this.pageMargins && Array.isArray(this.pageMargins)) {
      this.pdfDocDefinition['pageMargins'] =
        this.pageMargins.map(pm => pm * UnitConversions.cmToPt);  // Convert cm -> pt
    }

    //console.log(JSON.stringify(this.pdfDocDefinition));
  }

  /**
   * Build a pdfMake element (using their syntax) from a native HTML element.
   * @param htmlElement:
   */
  private buildPDFElement(htmlElement: HTMLElement): any {
    var pdfElement;
    // Determine HTMLElement tag
    // TODO: Support more tags
    switch (htmlElement.nodeName.toLowerCase()) {
      case 'p':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        pdfElement = { text: htmlElement.innerHTML.trim() || ' ' };
        break;
      case 'br':
        pdfElement = { text: ' ' };
        break;
      case 'table':
        pdfElement = this.buildPDFTable(htmlElement as HTMLTableElement);
        break;
      case 'img':
        pdfElement = this.buildPDFImage(htmlElement as HTMLImageElement);
        break;
      default:
        pdfElement = { text: ' ' };
        break;
    }
    
    // PDF element styles
    var stylesAssigned = assignPdfElementStyles(pdfElement, htmlElement);
    // Mark as processed if styles were assigned and not processed
    if (!this.processedDoc && stylesAssigned) {
      this.processedDoc = true;
    }

    return pdfElement;
  }
  
  /**
   * Build a pdfMake table element from an HTML table.
   * @param htmlTable
   */
  private buildPDFTable(htmlTable: HTMLTableElement): any {
    var pdfTable = { };
    pdfTable['table'] = { body: [], widths: [] };
    var rows = htmlTable.rows ? Array.from(htmlTable.rows) as HTMLTableRowElement[] : [];
    var body = pdfTable['table'].body;  // array of rows

    // Table contents
    var headerRowCount = 0;
    for (let row of rows) {
      let cells = Array.from(row.cells) as HTMLTableCellElement[];
      let cellObjects = [];

      if (cells.length > 0 && cells[0].tagName.toLowerCase() === 'th') {
        headerRowCount++;
      }
      
      for (let cell of cells) {
        // Check for nested elements
        var cellObj: any;
        if (cell.childElementCount > 0) {
          let childrenObj = [];
          let children = Array.from(cell.children) as HTMLElement[];
          for (let child of children) {
            childrenObj.push(this.buildPDFElement(child));
          }
          cellObj = { stack: childrenObj };
        } else {
          cellObj = { text: cell.innerHTML.trim() };
        }

        // PDF element styles
        assignPdfElementStyles(cellObj, cell as HTMLElement);

        cellObjects.push(cellObj);
      }
      body.push(cellObjects);
    }

    // Header rows. Note: If there are no header rows (i.e., no <th> cells), then table
    // layouts 'headerLineOnly' and 'lightHorizontalLines' will not work.
    if (headerRowCount) {
      pdfTable['table']['headerRows'] = headerRowCount;
    }

    // Column widths
    var colSize = rows && rows.length > 0 ? rows[0].cells.length : 0;
    var tableWidth: string | number =
      Array.isArray(this.tableWidths) ?
        this.tableWidths[this.processedTables] : this.tableWidths;
    var widthValue: string | number;
    if (typeof tableWidth === 'string' && tableWidth.toLowerCase() === 'full') {
      widthValue = '*';
    } else if (typeof tableWidth === 'number') {
      widthValue = tableWidth * UnitConversions.pxToPt;  // Convert px to pt
    } else {
      widthValue = 'auto';  // Everything else is set to 'auto'
    }

    for (let i = 0; i < colSize; i++) {
      pdfTable['table']['widths'].push(widthValue);
    }

    // Table Layout: 'default', 'noBorders', 'headerLineOnly', 'lightHorizontalLines'
    var tableLayout =
      Array.isArray(this.tableLayouts) ?
        this.tableLayouts[this.processedTables] : this.tableLayouts;
    if (tableLayout && tableLayout.toLowerCase() !== 'default') {
      if (tableLayout.toLowerCase() === 'noborders') {
        pdfTable['layout'] = { 'defaultBorder': false };
      } else {
        pdfTable['layout'] = tableLayout;
      }
    }

    // Modify actual HTML table styles
    updateHTMLTableCSS(htmlTable, tableWidth, tableLayout, headerRowCount);

    this.processedTables++;  // Mark table as processed

    return pdfTable;
  }

  /**
   * Build a pdfMake image element from an HTML image.
   * @param htmlImage
   */
  private buildPDFImage(htmlImage: HTMLImageElement): any {
    var pdfImage = {};

    var lastDotIndex = htmlImage.src.lastIndexOf('.');
    var type = lastDotIndex >= 0 ?
      htmlImage.src.substr(lastDotIndex + 1) : 'png';  // Defaults to png

    // Create <canvas> element to get data URL
    var canvas = document.createElement('canvas');
    canvas.width = htmlImage.width;
    canvas.height = htmlImage.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(htmlImage, 0, 0, htmlImage.width, htmlImage.height);
    var url = canvas.toDataURL(type);

    pdfImage['image'] = url;
    pdfImage['width'] = htmlImage.width * UnitConversions.pxToPt;

    return pdfImage;
  }

  /**
   * Print the PDF.
   */
  public print(): void {
    if (!this.processedDoc) {
      this.buildDocDefinition();
    }

    try {
      pdfMake.createPdf(this.pdfDocDefinition).print();
    } catch (error) {
      this.error.emit(error);
    }
  }

  /**
   * Download the PDF.
   * @param fileName - The file name (optional). Default name is 'file'.
   */
  public download(fileName?: string): void {
    if (!this.processedDoc) {
      this.buildDocDefinition();
    }

    try {
      pdfMake.createPdf(this.pdfDocDefinition).download(fileName);
    } catch (error) {
      this.error.emit(error);
    }
  }

  /**
   * Open the PDF.
   */
  public open(): void {
    if (!this.processedDoc) {
      this.buildDocDefinition();
    }

    try {
      pdfMake.createPdf(this.pdfDocDefinition).open();
    } catch (error) {
      this.error.emit(error);
    }
  }
}

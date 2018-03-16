# Angular PDF Make

An Angular 2+ component for printing and saving simple PDFs based on [bpampuch](https://github.com/bpampuch)'s 
[`pdfmake`](https://github.com/bpampuch/pdfmake) library.

The component converts pure, projected HTML and CSS into printable PDF files, so despite `pdfmake`'s awesomeness,
you don't have to learn any JSON format or structure.

`angular-pdfmake` attempts to make the HTML and the resulting PDF as similar as possible, when kept simple.
It lets you see how the document will look like on your Angular app before printing/saving it as PDF.

## Dependencies

The current version supports up to Angular v5.2.8 and uses pdfmake v0.1.36.

## Supported features

For the moment, `angular-pdfmake` doesn't support all of `pdfmake`'s features, but we are working on full support
and are hoping the wonderful open-source community can give us a hand or two.

The following features are currently supported:

* HTML elements (unnested):
  * `<p>`
  * `<h1>` to `<h6>`
  * `<br />`
  * `<table>`
  * `<img>`
* CSS styles:
  * `font-size`
  * `font-weight` (`bold`)
  * `font-style` (`italics`)
  * `text-align`
  * `margin`
* Tables:
  * Customized cell borders
  * Table widths
  * Predefined border layouts
  * *Nested* HTML elements in tables
* Document properties:
  * Page sizes: A3, A4, Letter, Legal
  * Page margins
* Images
* Error emitter

## Getting started

### Download and setup

Download and install into your Angular project using npm:

```bash
npm install @supply-chain-ventures.com/angular-pdfmake --save
```

Load the `AngularPDFMakeModule` into your app's module or whichever module you wish to use it in:

```typescript
import { AngularPDFMakeModule } from '@supply-chain-ventures.com/angular-pdfmake';

@NgModule({
  ...
  imports: [
    ...
    AngularPDFMakeModule
  ]
})
```

### Usage

Put an `<ng-pdfmake>` selector in your component's template.
For now, this will only display a box with a "Hello, World!" on your browser:

```html
<ng-pdfmake>
  <p>Hello, World!</p>
</ng-pdfmake>
```

As you can see, you must project HTML elements into the `<ng-pdfmake>` tag.

"Where's my PDF, though?!", you might be asking.
For that, you must call the component's `print()` or `save()` methods.
We modify the template a tad by adding a couple of buttons and giving our component a hashtag reference:

```html
<button (click)="myPDF.print()">Print</button>
<button (click)="myPDF.save('My PDF')">Save</button>
<ng-pdfmake #myPDF>
  <p>Hello, World!</p>
</ng-pdfmake>
```

Press one of the buttons and voila!

**Note:** You must disable any ad blocker on your browser in order to print or save PDFs.

## Documentation

### HTML Projection

`angular-pdfmake` takes advantage of Angular's projection capabilities. 
This means that you can pass HTML into a component (as shown in the example above).

Currently, only unnested HTML elements are supported, with the exception of tables.
This means, for example, that you cannot nest a `<p>` inside a `<div>`:

```html
<ng-pdfmake #myPDF>
  <h1>My PDF</h1>
  <p>Hello, World!</p>
  <img src="myImage.jpg" />
  <div>
    <p>Oops!</p>  <!-- Not supported! -->
  </div>
</ng-pdfmake>
```

### Styling

Whatever styling an HTML element has will be rendered on the PDF as well.

The following style properties are supported (to the extent of the `pdfmake` library):
  * `font-size`
  * `font-weight` (`bold`)
  * `font-style` (`italics`)
  * `text-align`
  * `margin`

Any other style properties will be rendered by the browser but ignored in the PDF.

```html
<style>
  .centered {
    margin-top: 20px;
    text-align: center;
  }
</style>

<ng-pdfmake #myPDF>
  <h1 style="font-size: 18px;">Styles</h1>
  <p class="centered">Hello, World!</p>
  <p style="color: blue;">Ignore my style</p> <!-- Ignored in PDF -->
</ng-pdfmake>
```

### Tables

Simple (unspanned) HTML tables are supported.

```html
<ng-pdfmake #myPDF>
  <h1>Tables</h1>
  <table>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
    <tr>
      <td>Cell content</td>
      <td>Cell content</td>
    </tr>
  </table>
</ng-pdfmake>
```

By default, tables have borders on all cells and take up only the required width of their contents.
Both the **table width** and **border layout** can be changed.

#### Table width

The table width can be set with the `tableWidths` input property passed to the component.

```html
<ng-pdfmake #myPDF tableWidths="full"> <!-- All tables take up full width -->
  <h1>Table Widths</h1>
  <table>
    ...
```

The following values are supported for `tableWidths`:
* `auto`: (default) Table takes up as much width as needed by its cell contents
* `full`: Table takes up full page width
* Column width (in px): Each column in the table takes up a fixed width.
Put `[tableWidths]` in brackets in this case, since it is not a `string`.
Example: `[tableWidths]=300` would make each column have a width of 300 pixels.

An array of values can also be passed to `tableWidths` if you have more than one table and want to
customize each one differently.
If a non-array value is passed, then all tables will be configured the same.

```html
<ng-pdfmake #myPDF [tableWidths]="['full', 'auto', 300]">
  <h1>Table Widths</h1>
  <table> <!-- Full width -->
    ...
  <table> <!-- Auto width -->
    ...
  <table> <!-- Fixed column width of 300px -->
    ...
```

#### Border layout

By default, tables have full borders on all cells.
Table can also have a predefined border layout, set with the `tableLayouts` input property.

```html
<ng-pdfmake #myPDF tableLayouts="noBorders"> <!-- All tables have no borders -->
  <h1>My PDF</h1>
  <table>
    ...
```

The following values are supported for `tableLayouts`:
* `default`: (default) Full borders on all cells
* `noBorders`: No borders on any cell (customizable)
* `headerLineOnly`: Only the header row(s) will have a bottom border
* `lightHorizontalLines`: Header row(s) will have a bottom border and all other rows will have light bottom borders

As with `tableWidths`, an array of values can be passed to `tableLayouts` if you have more than one table and
want to customize each one differently.

##### Customized borders

For customized borders, the `noBorders` option must be used and styling must be provided.
Any other value for `tableLayouts` will override any cell borders configured in your CSS.
Any border style with `width > 0` provided in CSS will be displayed as `1px solid black` on the PDF.

```html
<style>
  .bottom-border{
    border-bottom: 1px solid black;
  }
</style>

<ng-pdfmake #myPDF tableLayouts="noBorders">
  <h1>Customized Table</h1>
  <table>
    <tr>
      <th class="bottom-border">Header 1</th>
      <th class="bottom-border">Header 2</th>
    </tr>
    <tr>
      <!-- This will automatically change to 1px solid black -->
      <td style="border-left: 2px solid grey;">Cell content</td>
      <td>Cell content</td>
    </tr>
  </table>
</ng-pdfmake>
```

#### Nested elements in tables

Elements like `<p>`, `<h1>`, `<table>`, and `<img>` can be placed inside table cells.
As before, only one-level nesting is allowed.

```html
<ng-pdfmake #myPDF tableLayouts="noBorders">
  <h1>Nested Table</h1>
  <table>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
    <tr>
      <td>
        <h1>Nested cell h1</h1>
        <p style="text-align: center;">Nested cell content</p>
      </td>
      <td>
        <img src="image.jpg" />
      </td>
    </tr>
  </table>
</ng-pdfmake>
```

### Document properties

The following document properties can be set for an entire `<ng-pdfmake>` component:
* `pageSize` 
* `pageMargins`

```html
<ng-pdfmake #myPDF pageSize="A4" [pageMargins]="[1, 1, 1, 1]">
  ...
````

#### Page size

The `pageSize` input attribute defines the size of the HTML container (grey box) and of the rendered PDF document.

Supported page sizes are:
* `A3`
* `A4` (default)
* `LETTER`
* `LEGAL`

#### Page margins

The `pageMargins` input attribute is an array of four numbers defining the page margins in centimeters.
Default margins are 2.54 cm on each side.

The array's values are for the top, right, bottom, and left margins, respectively.
Example: `[pageMargins]="[1, 1, 1, 1]"`.

### Render errors

If any errors occur during the PDF rendering process (e.g. due to malformed HTML),
an `@Output() EventEmitter` named `error` will emit a `string` value with an error message.

Component class:
```typescript
@Component({
...
export class AppComponent {
  public handleErrors(errorMessage: string): void {
    console.log(`Oops! ${errorMessage}`);
  }
...
```

Template:
```html
<ng-pdfmake #myPDF (error)="handleErrors($event)">
  ...
```

### Methods

The `AngularPDFMakeComponent` component has two public methods:
* `print()`
* `download(fileName: string)`

These methods can be called either from the HTML template or from the component's class
using `InputChild()` and a hashtag reference to the selector.

## Credits

Developed by [Supply Chain Ventures S.A](http://www.supplychainventures.com).

### Authors
* [Gerardo Figueroa](https://github.com/gfigueroa)

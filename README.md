# web2json

A Chrome extension to extract information from the web.

## Patterns and Selectors

Patterns are JSON objects that describe which information to extract from an HTML page, as well as the data structure used to return it.  Selectors are used within patterns to designate specific pieces of the HTML page.

### Selectors

A selector is a string designating a piece of an HTML page.  There are two types of selectors:
* **Plain selectors**. These selectors are vanilla CSS selectors that designate HTML elements. Exemple: `div.np a`
* **Extented selectors**. These selectors consist of a plain selector and an extension, separated by a backslash. The extension can be:
  * An element attribute, between brackets. Example: `div.np a/[href]`.
  * textContent or innerHTML. Example: `div.np a/textContent`.

### Patterns

Patterns are JSON objects that are interpreted recursively: given an HTML document, the pattern is mapped into a JSON object containing values extracted from the HTML document.
The mapping performed at each node of the pattern depends on its type: string, object or array.

#### String

A string pattern is interpreted as a selector. It is mapped to the value of the selector:
* An extended selector is mapped to a string value.
* A plain selector is mapped to an object of type `{textContent: string, innerHTML: string, attributes: Object.<string, string>}`.

If several elements in the document matches the selector, the mapping is done on the first matching element (like with the method `querySelector`).

#### Object

An object pattern (aka record pattern) is interpreted recursively: it is mapped to an object having the same fields, with mapped values.

#### Array

In patterns, arrays can be of length 1 or 2. The first value must be a string pattern.  The second value can be an arbitrary pattern.

* A pattern array of length 1 is mapped to an array containing all instances in the document of the selector contained as first value in the array.
* If the pattern has two values, the first value must be a plain selector.  All elements matching the selector are retrieved, and mapped against the pattern provided as second value in the pattern array.
#set math.equation(numbering: "1.")

// This is a single-line comment.
/*
  This is a
  multi-line comment.
*/

// Headings are created with one or more equals signs.
= My First Typst Document

This is a simple paragraph of text. Typst is a modern typesetting system that is easy to learn. [2]

== Section 1: Text Formatting

You can easily format text to be *bold*, _italic_, or use `monospace` for code. You can also combine them: *_bold and italic_*.

To create a line break, you can use a backslash. \
This is a new line.

== Section 2: Lists

Typst supports both unordered and numbered lists.

// Unordered lists start with a hyphen.
- An item in a bulleted list. [3]
- Another item.
  - Sub-items are created with indentation.
- A final item.

// Numbered lists start with a plus sign or a number followed by a dot. [13]
+ First item in a numbered list.
+ Second item.
  1. Sub-item with explicit numbering.
+ Third item.

== Section 3: Mathematical Equations

Equations can be written inline like this: $a^2 + b^2 = c^2$. [7]

For larger equations, you can place them in a separate block, which will be centered and numbered automatically.

$
  sum_(i=1)^n i = (n(n+1)) / 2
$ <eq:sum>

We can refer to the equation above using its label: see @eq:sum.

You can also create multi-line equations with alignment. [7]

$
  f(x) &= (x+1)^2 \
       &= x^2 + 2x + 1
$
== Section 4: Images and Tables

To include an image, use the `image` function. Make sure the image file is in the same directory or provide a relative path.

#figure(
  image("screenshot.jpg", width: 50%),
  caption: [This is a caption for the image.]
) <fig:example>

We can reference the figure like this: @fig:example.

Tables are created using the `table` function.

#table(
  columns: (1fr, auto, auto),
  [*Name*, *Role*, *Years Active*],
  [Ada Lovelace, Mathematician, 1842-1843],
  [Grace Hopper, Computer Scientist, 1943-1986],
)

== Section 5: Code Blocks
You can include code blocks with syntax highlighting.
```python
def hello_world():
    print("Hello, World!")
```

Also for custom fonts:
```plaintext
typst compile file.typ --font-path ./fonts
```
== Section 6: Links and Footnotes
You can create hyperlinks using the `[text](url)` syntax. For example, visit #link("https://typst.app")[Typst's website].
Footnotes can be added using the `[^1]` syntax. Here is a footnote example.[^1]

#footnote("1"): This is the content of the footnote.
== Conclusion
This document provides a brief overview of Typst's capabilities.
For more detailed information, refer to the
#underline[
  #text(fill: blue)[
    #link("https://typst.app/docs")[official documentation]
  ]
].

= Bibliography
[1] Typst Documentation. https://typst.app/docs. Accessed June 2024.

[2] Typst Introduction. https://typst.app/docs/guide/introduction. Accessed June 2024.

[3] Typst Text Formatting. https://typst.app/docs/guide/text-formatting. Accessed June 2024.

[7] Typst Mathematics. https://typst.app/docs/guide/mathematics. Accessed June 2024.

[13] Typst Lists. https://typst.app/docs/guide/lists. Accessed June 2024.
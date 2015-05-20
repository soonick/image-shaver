# Image-Shaver

[![Build Status](https://travis-ci.org/soonick/image-shaver.svg?branch=master)](https://travis-ci.org/soonick/image-shaver)

JS library that you can use to crop images in the browser

## How to use

```js
var container = document.getElementById('shaver-container');
var shaver = new ImageShaver(container, options);
```

### Options

Options is an object the following keys:

**image**

type: String
The url of the image that will be cropped

**ratio**

type: Array
The ratio you want the original image to have. The first value is the width and
the second is the height:

```js
options = {
  ratio: [2, 1]
}
```

For the example above, the resulting ratio is 2:1, which means the resulting
image will be twice as wide as it is high. For example 100X50.

## Development

### Tests

To run the tests use:

```bash
gulp health
```

## Demo

You can find a demo here: [http://jsfiddle.net/g2s6c9x7/](http://jsfiddle.net/g2s6c9x7/)

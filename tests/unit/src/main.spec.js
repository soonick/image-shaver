describe('imageShaver', function() {
  beforeEach(function() {
    var container = document.createElement('DIV');
    this.instance = new ImageShaver(container);
    document.body.appendChild(this.instance.container);
    this.instance.container.innerHTML = '<p>Im text</p>';
  });

  afterEach(function() {
    document.body.removeChild(this.instance.container);
  });

  describe('createDom', function() {
    it('destroys the contents of the container and creates shaver and preview', function() {
      this.instance.createDom();

      var children = this.instance.container.children;
      proclaim.equal(2, children.length);
      proclaim.equal('CANVAS', children[0].tagName);
      proclaim.equal('shaver-original', children[0].className);
      proclaim.equal('DIV', children[1].tagName);
      proclaim.equal('shaver-preview', children[1].className);
    });

    it('saves reference to original and preview', function() {
      this.instance.createDom();

      var c = this.instance.container;
      var expectedOriginal = c.getElementsByClassName('shaver-original')[0];
      var expectedOriginalCtx = expectedOriginal.getContext('2d');
      var expectedPreview = c.getElementsByClassName('shaver-preview')[0];

      proclaim.equal(expectedOriginal, this.instance.original);
      proclaim.equal(expectedOriginalCtx, this.instance.originalCtx);
      proclaim.equal(expectedPreview, this.instance.preview);
    });

    it('sets canvas width and height attributes', function() {
      var canvasSize = document.createElement('STYLE');
      canvasSize.innerHTML = 'canvas { width: 201px; height: 200px}';
      document.body.appendChild(canvasSize);

      this.instance.createDom();

      proclaim.equal(200, this.instance.original.getAttribute('height'));
      proclaim.equal(201, this.instance.original.getAttribute('width'));
    });
  });

  describe('showOriginalImage', function() {
    it('does not try to load image if no url was given', function() {
      delete this.instance.options.image;
      this.instance.showOriginalImage();

      var hiddenImage =
          this.instance.container.getElementsByClassName('shaver-hidden-image');
      proclaim.equal(0, hiddenImage.length);
    });

    it('adds hidden image to container', function() {
      this.instance.options.image = '/base/tests/unit/fixtures/img/img.png';
      this.instance.showOriginalImage();

      var hiddenImage =
          this.instance.container.getElementsByClassName('shaver-hidden-image');
      proclaim.equal(1, hiddenImage.length);
    });

    it('hidden image has correct URL', function() {
      this.instance.options.image = '/base/tests/unit/fixtures/img/img.png';
      this.instance.showOriginalImage();

      proclaim.equal(
        this.instance.options.image,
        this.instance.hiddenImage.getAttribute('src')
      );
    });
  });
});

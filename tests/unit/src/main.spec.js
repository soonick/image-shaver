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
    beforeEach(function() {
      sinon.stub(this.instance, 'drawHiddenImage');
    });

    afterEach(function() {
      this.instance.drawHiddenImage.restore();
    });

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

    it('calls drawHiddenImage when image is loaded', function() {
      this.instance.options.image = '/base/tests/unit/fixtures/img/img.png';
      this.instance.showOriginalImage();

      this.instance.hiddenImage.onload();
      proclaim.equal(true, this.instance.drawHiddenImage.called);
    });
  });

  describe('drawHiddenImage', function() {
    beforeEach(function() {
      var hiddenImage = document.createElement('IMG');
      hiddenImage.setAttribute('src', '/base/tests/unit/fixtures/img/img.png');
      document.body.appendChild(hiddenImage);
      this.instance.hiddenImage = hiddenImage;
      this.instance.original = document.createElement('CANVAS');
      document.body.appendChild(this.instance.original);

      sinon.stub(this.instance.originalCtx, 'drawImage');
      sinon.stub(this.instance, 'showCropRectangle');
    });

    afterEach(function() {
      document.body.removeChild(this.instance.hiddenImage);
      delete this.instance.hiddenImage;
      document.body.removeChild(this.instance.original);
      this.instance.originalCtx.restore();
      this.instance.showCropRectangle.restore();
    });

    it('does not increase size of original image', function(done) {
      var self = this;
      this.instance.original.style.width = '30px';
      this.instance.original.style.height = '20px';

      this.instance.hiddenImage.onload = function() {
        self.instance.drawHiddenImage();

        var expected = [self.instance.hiddenImage, 10, 5, 10, 10];
        proclaim.deepEqual(
          expected,
          self.instance.originalCtx.drawImage.args[0]
        );
        done();
      };
    });

    it('resizes image to fit container', function(done) {
      var self = this;
      this.instance.original.style.width = '7px';
      this.instance.original.style.height = '7px';

      this.instance.hiddenImage.onload = function() {
        self.instance.drawHiddenImage();

        var expected = [self.instance.hiddenImage, 0, 0, 7, 7];
        proclaim.deepEqual(
          expected,
          self.instance.originalCtx.drawImage.args[0]
        );
        done();
      };
    });

    it('resizes and positions correctly when width is smaller', function(done) {
      var self = this;
      this.instance.original.style.width = '5px';
      this.instance.original.style.height = '10px';

      this.instance.hiddenImage.onload = function() {
        self.instance.drawHiddenImage();

        var expected = [self.instance.hiddenImage, 0, 2, 5, 5];
        proclaim.deepEqual(
          expected,
          self.instance.originalCtx.drawImage.args[0]
        );
        done();
      };
    });

    it('resizes and positions correctly when height is smaller', function(done) {
      var self = this;
      this.instance.original.style.width = '15px';
      this.instance.original.style.height = '4px';

      this.instance.hiddenImage.onload = function() {
        self.instance.drawHiddenImage();

        var expected = [self.instance.hiddenImage, 5, 0, 4, 4];
        proclaim.deepEqual(
          expected,
          self.instance.originalCtx.drawImage.args[0]
        );
        done();
      };
    });
  });

  describe('calculateLargestRectangle', function() {
    beforeEach(function() {
      document.body.appendChild(this.instance.original);
    });

    afterEach(function() {
      document.body.removeChild(this.instance.original);
    });

    it('returns largest possible rectangle when original is wider and ratio is 1:1', function() {
      this.instance.original.style.width = '400px';
      this.instance.original.style.height = '100px';

      this.instance.options.ratio = [1, 1];

      var actual = this.instance.calculateLargestRectangle();
      var expected = [150, 0, 100, 100];
      proclaim.deepEqual(expected, actual);
    });

    it('returns largest possible rectangle when original is taller and ratio is 1:1', function() {
      this.instance.original.style.width = '300px';
      this.instance.original.style.height = '400px';

      this.instance.options.ratio = [1, 1];

      var actual = this.instance.calculateLargestRectangle();
      var expected = [0, 50, 300, 300];
      proclaim.deepEqual(expected, actual);
    });

    it('returns rectangle the same size of the image when ratio is the same', function() {
      this.instance.original.style.width = '300px';
      this.instance.original.style.height = '400px';
      this.instance.options.ratio = [3, 4];

      var actual = this.instance.calculateLargestRectangle();
      var expected = [0, 0, 300, 400];
      proclaim.deepEqual(expected, actual);
    });

    it('retuns correct rectangle when ratio is set', function() {
      this.instance.original.style.width = '700px';
      this.instance.original.style.height = '400px';
      this.instance.options.ratio = [5, 3];

      var actual = this.instance.calculateLargestRectangle();
      var expected = [17, 0, 666, 400];
      proclaim.deepEqual(expected, actual);
    });

    it('retuns correct rectangle when ratio is set to 2:1 and there is a border', function() {
      this.instance.original.style.width = '600px';
      this.instance.original.style.height = '300px';
      this.instance.original.style.border = '1px solid #f00';
      this.instance.options.ratio = [2, 1];

      var actual = this.instance.calculateLargestRectangle();
      var expected = [0, 0, 600, 300];
      proclaim.deepEqual(expected, actual);
    });

    it('returns correct rectangle when original taller than ratio', function() {
      this.instance.original.style.width = '400px';
      this.instance.original.style.height = '300px';
      this.instance.options.ratio = [2, 1];

      var actual = this.instance.calculateLargestRectangle();
      var expected = [0, 50, 400, 200];
      proclaim.deepEqual(expected, actual);
    });
  });

  describe('showResizeNodes', function() {
    beforeEach(function() {
      this.sb = sinon.sandbox.create();
      this.sb.stub(this.instance.originalCtx, 'rect');
      this.sb.stub(this.instance.originalCtx, 'fillRect');
      this.sb.stub(this.instance.originalCtx, 'strokeRect');
    });

    afterEach(function() {
      this.sb.restore();
    });

    it('paints nodes on corners', function() {
      this.instance.NODE_SIZE = 10;
      var rect = [30, 40, 100, 110];
      this.instance.showResizeNodes(rect);

      var topLeft = [25, 35, 10, 10];
      var topRight = [125, 35, 10, 10];
      var bottomRight = [125, 145, 10, 10];
      var bottomLeft = [25, 145, 10, 10];
      proclaim.deepEqual(topLeft, this.instance.originalCtx.rect.args[0]);
      proclaim.deepEqual(topLeft, this.instance.originalCtx.fillRect.args[0]);
      proclaim.deepEqual(topRight, this.instance.originalCtx.rect.args[1]);
      proclaim.deepEqual(topRight, this.instance.originalCtx.fillRect.args[1]);
      proclaim.deepEqual(bottomRight, this.instance.originalCtx.rect.args[2]);
      proclaim.deepEqual(bottomRight,
          this.instance.originalCtx.fillRect.args[2]);
      proclaim.deepEqual(bottomLeft, this.instance.originalCtx.rect.args[3]);
      proclaim.deepEqual(bottomLeft, this.instance.originalCtx.fillRect.args[3]);
    });
  });
});

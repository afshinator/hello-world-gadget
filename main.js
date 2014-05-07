(function(){
  // Declare a gadget class.
  var Gadget = function(options) {
    // the main DOM element for attaching
    this.el = options.el;
    // the selected word
    this.wordEl = this.el.querySelector('span.adjective');

    // the gadget's internal state, including the default values of all attributes and learner state.
    this.config = {
      isEditable: false,
      authorState: {
        chosenColor: 'green',
        chosenWord: 'green'
      },
      learnerState: {
        isBold: false       // whether the learner has made the chosen word bold.
      }
    };

    this.initialize();
  };

  // Simple helper functions: forwarding JSON messages and logging to console.
  Gadget.prototype.receiveMessage = function (messageObj) {
    var messageJson = messageObj.data;
    // a received message has the structure { .... data: { event: 'eventName', data: { ... } } ... }
    // received messages are of MessageEvent class.

    console.log('Received message', messageObj);

    // We will call the gadget's method named by the event, if this method exists.
    if (this[messageJson.event]) {
      this[messageJson.event](messageJson.data);
    }
  };

  Gadget.prototype.sendMessage = function (messageJson) {
    console.log('Sending message', messageJson);
    // an outgoing message has the structure {event: 'eventName', data: ... }
    window.parent.postMessage(messageJson, '*');
  };

  // Need to configure the property sheet after attaching.
  Gadget.prototype.setupPropertySheet = function() {
    // set up a property sheet for word and color selection.
    this.sendMessage({
      event: 'setPropertySheetAttributes',
      data: {
        chosenColor: { type: 'Color' },
        chosenWord: { type: 'Text' }
      }
    });
  };

  // Initialize: before the gadget is attached to the lesson's DOM.
  Gadget.prototype.initialize = function() {
      // subscribe to player events.
      this.sendMessage({event: 'startListening'});
      window.addEventListener('message', this.receiveMessage.bind(this));

      this.setupPropertySheet();

      // add click listener to toggle bold font.
      this.wordEl.onclick = this.toggleBoldWord.bind(this);

      // add click listener to upload new asset.
      this.el.querySelector('.button-upload-image').onclick = this.requestUpload.bind(this);

      // set gadget height.
      this.sendMessage({
        event: 'setHeight',
        data: {
          pixels: 400
        }
      });

      // initially the gadget is already not empty (it has "green" set). If it were otherwise, we would have done this:
      // this.setEmpty();

  };

  Gadget.prototype.requestUpload = function() {
    this.sendMessage({
      event: 'requestAsset',
      data: {
        attribute: 'chosenImage',
        type: 'image'
      }
    });
  };

  // Methods that respond to some player events. Other events will be ignored by this gadget.

  Gadget.prototype.setEditable = function(jsonData) {
    this.config.isEditable = jsonData.editable;

    // some elements have class 'authoring-only' and need to be hidden when we are in non-editable mode.
    var visibilityForAuthor = this.config.isEditable ? 'visible' : 'hidden';

    // set visibility on all such elements.
    var elementsAuthoringOnly = document.getElementsByClassName('authoring-only');
    for (var i = 0; i < elementsAuthoringOnly.length; ++i) {
      var item = elementsAuthoringOnly[i];
      item.setAttribute('style', 'visibility: ' + visibilityForAuthor + ';');
    }
  };

  Gadget.prototype.setEmpty = function () {
    this.sendMessage({
      event: 'setEmpty'
    });
  };

  // this will request an image URL.
  Gadget.prototype.updateImage = function() {
    if (this.config.authorState.asset) {
      // for simplicity, we will always use the first representation in the asset.
      var imageId = this.config.authorState.asset.representations[0].id;
      this.sendMessage({
        event: 'getPath',
        data: {
          messageId: 1,
          assetId: imageId
        }
      });
    }
  };

  Gadget.prototype.setPath = function(jsonData) {
    var imageUrl = jsonData.url;
    // now we set the image src attribute to this url.
    this.el.querySelector('.sample-image').setAttribute('src', imageUrl);
  };

  Gadget.prototype.attributesChanged = function(jsonData) {

    // we expect only the attributes 'chosenColor', 'chosenWord', 'chosenImage'.
    if (jsonData.chosenColor) {
      this.config.authorState.chosenColor = jsonData.chosenColor;
      this.wordEl.setAttribute('style', 'color: ' + this.config.authorState.chosenColor);
    }
    if (jsonData.chosenWord) {
      this.config.authorState.chosenWord = jsonData.chosenWord;
      this.wordEl.innerHTML = this.config.authorState.chosenWord;
    }
    if (jsonData.chosenImage) {
      this.config.authorState.asset = jsonData.chosenImage;
      this.updateImage();
    }

  };

  Gadget.prototype.learnerStateChanged = function(jsonData) {
    // we expect only the attribute 'isBold'.
    if (jsonData.isBold) {
      this.config.learnerState.isBold = jsonData.isBold;
      this.updateBoldWord();
    }
  };

  Gadget.prototype.updateBoldWord = function() {
    if (this.config.learnerState.isBold) {
      addClassToElement(this.el, 'setBold');
    } else {
      removeClassFromElement(this.el, 'setBold');
    }
  };

  Gadget.prototype.toggleBoldWord = function() {
    this.config.learnerState.isBold = ! this.config.learnerState.isBold;
    this.sendMessage({
      event: 'setLearnerState',
      data: {
        isBold: this.config.learnerState.isBold
      }
    });
    this.updateBoldWord();
  };

  // Finished with defining the gadget class.

  // Instantiate the gadget, pass the DOM element, start listening to events.
  new Gadget({ el: document.querySelector('body') });
  // This gadget instance will remain active because it has added itself as a listener to the window.

})();

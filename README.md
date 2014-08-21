Hello World gadget
==================

## Basic functions
- Authors can change text, text color and upload an image
- Learners can view the text, image and take a quiz

## Tech details
The hello world gadget has three sections
- Toggle between author view and learner view
- Upload an image
- Quiz

This gadget serves as an example for a few types of interaction between
the gadget and the course player via the
[versal-player-api](https://github.com/Versal/player-api), which is
available as a bower component under that name.

Types of interactions:
  - Asset uploading
  - setAttributes / onAttributesChanged
  - setLearnerState / onLearnerStateChanged

Please see the [gadget developer
intro](https://github.com/Versal/gadget-dev-intro/) for more information
about gadget development.

## Build Steps

```
bower install
```

## Preview gadget

```
versal preview
```

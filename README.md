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

This gadget serves as an example for using the
[versal-gadget-api](https://github.com/Versal/versal-gadget-api),
which provides some convenience libraries and basic styles.

Types of interactions:
  - Asset uploading
  - setAttributes / onAttributesChanged
  - setLearnerState / onLearnerStateChanged

Please see the [gadget developer
intro](https://versal.com/c/gadgets) for more information
about gadget development.

## Build Steps

```
bower install
```

## Preview gadget

```
versal preview
```

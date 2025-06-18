# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note**: This is a fork of the original TipTap Image Extension with critical bug fixes and new features.

## [1.0.0] - 2025-06-18

### Added
- **🗑️ Delete Image Button**: Added a red delete button in the top-right corner of images
  - Allows users to completely remove images from the editor with one click
  - Uses proper TipTap transaction system for safe deletion
  - Visual feedback with red styling to indicate destructive action

### Fixed
- **🐛 Critical Bug**: Fixed major issue where image controls (resize, alignment, caption) stopped working after removing a caption
  - Previously, after removing a caption from a figure, the image would lose all interactive controls
  - Now controls remain fully functional for both `<img>` and `<figure>` elements
  - Ensures seamless user experience when toggling between captioned and non-captioned images

### Changed
- **Control Architecture**: Refactored control system to work uniformly across image types
  - Unified event handling for `<div>` (images) and `<figure>` (captioned images)
  - Consistent control positioning and behavior
- **Transaction Safety**: Improved all content modifications to use TipTap's transaction system
  - Eliminates direct DOM manipulation that could break editor state
  - Ensures proper undo/redo functionality

### Technical Details
- Refactored control system to work uniformly across `<img>` and `<figure>` elements
- Improved TipTap transaction handling for better editor state management
- Enhanced event handling and click propagation control

---

## Previous Versions

This fork is based on the original TipTap Image Extension. The base functionality includes:

### Base Features (Inherited)
- Image resizing with drag handles
- Image alignment controls (left, center, right)
- Caption support with figcaption elements
- Mobile-responsive design
- CSS module integration 
# Oakland Schools New Counselor Survival Guide

An evergreen, responsive field guide for K-12 school counselors who are new to Oakland County, a local district, or the profession.

## Updating guide content

Most recurring content lives in [`data/guide-content.js`](data/guide-content.js). Edit that one file on GitHub to:

- add, remove, or reorder checklist items;
- revise School Counseling Consultant services;
- update resource titles, descriptions, and links; or
- change contact information.

Keep the existing quotation marks, braces, and commas. When a pull request is opened, the repository automatically checks the content structure and public links before publication.

School-year-specific resources can include the year in their title even though the guide itself remains evergreen.

## Previewing changes

The guide is dependency-free HTML, CSS, and JavaScript. Open `index.html` directly in a browser to preview it; no local server or software installation is required.

Checklist progress is stored only in the visitor's browser. The guide does not collect or transmit checklist data.

## Publishing with GitHub Pages

The site is designed to publish from the repository root on the `main` branch:

1. Open the repository's **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`, then save.

Review and merge changes through a pull request before they reach `main`.

## Accessibility commitments

The guide targets WCAG 2.1 Level AA, including:

- semantic headings and section landmarks;
- keyboard-operable navigation, checklist controls, and links;
- visible focus indicators;
- sufficient text and control contrast;
- a text-and-number alternative to the visual progress meter;
- touch-friendly controls and responsive reflow;
- reduced-motion support; and
- descriptive link labels and image alternative text.

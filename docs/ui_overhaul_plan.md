# UI Overhaul Plan: Atrium Tabs Popup

## 1. Project Goals

The primary goal of this UI overhaul is to redesign the Atrium Tabs popup window to match the provided reference image. This involves a complete visual and structural transformation, moving from the current card-based layout to a more compact, minimalist, and intuitive interface.

We will leverage Radix UI for its unstyled, accessible, and headless components, allowing us to build a custom UI that is both functional and aesthetically pleasing.

## 2. Design Principles

*   **Minimalism:** The design should be clean and uncluttered, focusing on the core functionality of tab and group management.
*   **Accessibility:** All components should be fully accessible, leveraging Radix UI's built-in accessibility features.
*   **Intuitiveness:** The UI should be easy to understand and use, with clear visual cues and a logical layout.
*   **Consistency:** The design should be consistent with the reference image, including the color scheme, typography, and iconography.

## 3. Component Breakdown

The following is a breakdown of the UI components that need to be created or modified, with a focus on how to implement them using Radix UI.

### 3.1. Main Structure

The main structure of the popup will be a single, scrollable container. We will use a simple `div` for this, with custom styling to match the reference image.

### 3.2. Search Bar

*   **Radix UI Component:** We will use a simple `<input>` element for the search bar, as Radix UI does not have a dedicated search component.
*   **Styling:** The input will be styled to match the reference image, with a thin border and a placeholder text of "Recherche...".

### 3.3. Group List

The group list will be the core of the popup, displaying all the user's tab groups.

*   **Radix UI Component:** We will use the [Accordion](https://www.radix-ui.com/docs/primitives/components/accordion) component to manage the expanding and collapsing of groups.
*   **Structure:** Each group will be an `Accordion.Item`, with the group name as the `Accordion.Header` and the list of tabs as the `Accordion.Content`.
*   **Styling:** The accordion will be styled to match the reference image, with a simple border between groups and a blue highlight for the open group.

### 3.4. Group Controls

Each group will have a set of controls for managing the group.

*   **Radix UI Component:** We will use the [Toolbar](https://www.radix-ui.com/docs/primitives/components/toolbar) component to house the group controls.
*   **Controls:**
    *   **Close Group:** An "X" icon button to close the open group.
    *   **Delete Group:** A trash can icon button to delete the group.
    *   **Edit Group:** A pencil icon button to edit the group name.
    *   **Collapse/Expand:** The `Accordion.Trigger` will serve as the collapse/expand control.
*   **Styling:** The toolbar will be styled to be unobtrusive, with simple icon buttons.

### 3.5. Tab List

The list of tabs within each group will be displayed when the group is expanded.

*   **Structure:** We will use a simple `<ul>` for the tab list, with each tab as an `<li>`.
*   **Controls:** Each tab will have controls for:
    *   **Reordering:** A hamburger menu icon to drag and drop tabs to reorder them.
    *   **Closing:** An "x" icon to close the tab.
*   **Styling:** The tab list will be styled to be clean and readable, with favicons and tab titles.

### 3.6. "Create New Group" Button

*   **Radix UI Component:** We will use the [Button](https://www.radix-ui.com/docs/primitives/components/button) component for the "Create New Group" button.
*   **Functionality:** Clicking the button will open a dialog to create a new group.
*   **Styling:** The button will be styled to match the reference image, with a simple border and the text "Créer un nouveau groupe".

### 3.7. Footer Toolbar

*   **Radix UI Component:** We will use the [Toolbar](https://www.radix-ui.com/docs/primitives/components/toolbar) component for the footer toolbar.
*   **Controls:** The toolbar will contain controls for:
    *   **Group Manager:** A button to open the group manager.
    *   **Re-ordering:** Up and down arrows to reorder groups.
    *   **Settings:** A gear icon to open the settings page.
*   **Styling:** The toolbar will be styled to be consistent with the rest of the UI, with simple icon buttons.

## 4. Styling Strategy

We will use a combination of CSS and a CSS-in-JS library like [Stitches](https://stitches.dev/) or [Styled Components](https://styled-components.com/) to style the components.

*   **Global Styles:** We will define a set of global styles for colors, typography, and spacing to ensure consistency.
*   **Component Styles:** Each component will have its own set of styles, defined in a separate file.
*   **Utility Classes:** We will use utility classes for common styles like margins, padding, and flexbox alignment.

By following this plan, we can create a modern, accessible, and intuitive UI for the Atrium Tabs popup that matches the provided reference image.

## 5. Implementation Checklist

- [ ] **Phase 1: Basic Structure and Styling**
    - [ ] Set up the main scrollable container.
    - [ ] Implement the top search bar with basic styling.
    - [ ] Create the main group list using Radix UI's `Accordion`.
    - [ ] Apply initial styles to the accordion to match the reference image (borders, colors).

- [ ] **Phase 2: Group and Tab Controls**
    - [ ] Implement the group-level controls (delete, edit) using Radix UI's `Toolbar`.
    - [ ] Add icons for each control.
    - [ ] Implement the tab-level controls (reorder, close) within each accordion panel.
    - [ ] Style the controls to be unobtrusive and consistent.

- [ ] **Phase 3: Core Functionality**
    - [ ] Wire up the search bar to filter the group list.
    - [ ] Implement the "Create New Group" button and its corresponding dialog.
    - [ ] Connect the delete, edit, and reordering controls to the underlying storage functions.

- [ ] **Phase 4: Footer and Final Touches**
    - [ ] Implement the footer toolbar using Radix UI's `Toolbar`.
    - [ ] Add the group manager, re-ordering, and settings controls.
    - [ ] Conduct a final styling pass to ensure pixel-perfect consistency with the reference image.
    - [ ] Perform accessibility testing to ensure all components are keyboard-navigable and screen-reader friendly.

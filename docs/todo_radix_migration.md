# Radix UI Migration Plan

This document provides a detailed, step-by-step plan to refactor the codebase to use [Radix UI Primitives](https://www.radix-ui.com/primitives/docs/overview/getting-started) wherever possible. Each step includes actionable todos, code samples, and references.

---

## 1. **Preparation**

### 1.1. **Install Radix UI Packages**

Install the required Radix UI packages:

```sh
npm install @radix-ui/react-button @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-collapsible @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-popover
```

- [Radix UI Getting Started Guide](https://www.radix-ui.com/primitives/docs/overview/getting-started)

---

## 2. **Refactor Interactive Elements**

### 2.1. **Replace All `<button>` Elements with Radix `Button`**

#### Example:
**Before:**
```tsx
<button onClick={handleClick}>Click Me</button>
```
**After:**
```tsx
import * as Button from '@radix-ui/react-button';
<Button.Root onClick={handleClick}>Click Me</Button.Root>
```
- [Radix Button Docs](https://www.radix-ui.com/primitives/docs/components/button)

---

## 3. **Refactor Popups, Modals, and Selectors**

### 3.1. **Use Radix `Dialog` for Modals (e.g., Edit, Confirm Delete, Color/Icon Selector)**

#### Example:
**Before:**
```tsx
{showDialog && (
  <div className="modal">...</div>
)}
```
**After:**
```tsx
import * as Dialog from '@radix-ui/react-dialog';
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild>
    <Button.Root>Edit</Button.Root>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>...</Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```
- [Radix Dialog Docs](https://www.radix-ui.com/primitives/docs/components/dialog)

---

## 4. **Refactor Dropdowns and Menus**

### 4.1. **Use Radix `DropdownMenu` or `Select` for Dropdowns**

#### Example:
**Before:**
```tsx
<select value={sortOrder} onChange={handleSortChange}>
  <option value="manual">Manual</option>
  <option value="name">Name</option>
</select>
```
**After:**
```tsx
import * as Select from '@radix-ui/react-select';
<Select.Root value={sortOrder} onValueChange={handleSortChange}>
  <Select.Trigger />
  <Select.Content>
    <Select.Item value="manual">Manual</Select.Item>
    <Select.Item value="name">Name</Select.Item>
  </Select.Content>
</Select.Root>
```
- [Radix Select Docs](https://www.radix-ui.com/primitives/docs/components/select)
- [Radix DropdownMenu Docs](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)

---

## 5. **Refactor Expand/Collapse and Accordions**

### 5.1. **Use Radix `Accordion` or `Collapsible` for Group/Tab Expand/Collapse**

#### Example:
**Before:**
```tsx
{expanded && <div>Expanded Content</div>}
```
**After:**
```tsx
import * as Collapsible from '@radix-ui/react-collapsible';
<Collapsible.Root open={expanded} onOpenChange={setExpanded}>
  <Collapsible.Trigger>Expand</Collapsible.Trigger>
  <Collapsible.Content>Expanded Content</Collapsible.Content>
</Collapsible.Root>
```
- [Radix Accordion Docs](https://www.radix-ui.com/primitives/docs/components/accordion)
- [Radix Collapsible Docs](https://www.radix-ui.com/primitives/docs/components/collapsible)

---

## 6. **Refactor Tooltips**

### 6.1. **Use Radix `Tooltip` for Icon and Action Tooltips**

#### Example:
**Before:**
```tsx
<span title="Tooltip text">🔒</span>
```
**After:**
```tsx
import * as Tooltip from '@radix-ui/react-tooltip';
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <span>🔒</span>
    </Tooltip.Trigger>
    <Tooltip.Content>Tooltip text</Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
```
- [Radix Tooltip Docs](https://www.radix-ui.com/primitives/docs/components/tooltip)

---

## 7. **Refactor Toggles and Switches**

### 7.1. **Use Radix `Switch` or `Checkbox` for Settings Toggles**

#### Example:
**Before:**
```tsx
<input type="checkbox" checked={enabled} onChange={toggle} />
```
**After:**
```tsx
import * as Switch from '@radix-ui/react-switch';
<Switch.Root checked={enabled} onCheckedChange={toggle} />
```
- [Radix Switch Docs](https://www.radix-ui.com/primitives/docs/components/switch)
- [Radix Checkbox Docs](https://www.radix-ui.com/primitives/docs/components/checkbox)

---

## 8. **Refactor Radio Groups (e.g., Color/Icon Selection)**

### 8.1. **Use Radix `RadioGroup` for Mutually Exclusive Options**

#### Example:
**Before:**
```tsx
<input type="radio" name="color" value="blue" />
<input type="radio" name="color" value="red" />
```
**After:**
```tsx
import * as RadioGroup from '@radix-ui/react-radio-group';
<RadioGroup.Root value={selectedColor} onValueChange={setSelectedColor}>
  <RadioGroup.Item value="blue">Blue</RadioGroup.Item>
  <RadioGroup.Item value="red">Red</RadioGroup.Item>
</RadioGroup.Root>
```
- [Radix RadioGroup Docs](https://www.radix-ui.com/primitives/docs/components/radio-group)

---

## 9. **Refactor Popovers (e.g., Inline Selectors)**

### 9.1. **Use Radix `Popover` for Inline Selectors**

#### Example:
**Before:**
```tsx
{showPopover && <div className="popover">...</div>}
```
**After:**
```tsx
import * as Popover from '@radix-ui/react-popover';
<Popover.Root>
  <Popover.Trigger asChild>
    <Button.Root>Open</Button.Root>
  </Popover.Trigger>
  <Popover.Content>...</Popover.Content>
</Popover.Root>
```
- [Radix Popover Docs](https://www.radix-ui.com/primitives/docs/components/popover)

---

## 10. **Testing and Accessibility**

- After each refactor, test the UI for accessibility and keyboard navigation.
- Use [Radix UI accessibility guide](https://www.radix-ui.com/primitives/docs/guides/accessibility).

---

## 11. **Migration Checklist**

- [x] Install Radix UI packages
- [ ] Refactor all `<button>`
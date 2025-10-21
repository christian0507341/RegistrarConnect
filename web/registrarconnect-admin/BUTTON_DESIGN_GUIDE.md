# 🎨 Button Design System Guide

## Complete Professional Button Library

This guide showcases all available button styles in the RegistrarConnect application.

---

## 📦 **Button Categories**

### 1️⃣ **Primary Buttons** (Main Call-to-Action)

**Usage:** Primary actions, submissions, confirmations

```tsx
<button className="btn-primary">Submit Request</button>
<button className="action-btn primary">Create New</button>
```

**Features:**
- Blue gradient background (`#2563eb` → `#1d4ed8`)
- White text
- Lift animation on hover (-2px)
- Glowing shadow effect
- Shine animation (light sweep effect)

---

### 2️⃣ **Secondary Buttons** (Alternative Actions)

**Usage:** Cancel, back, alternative actions

```tsx
<button className="btn-secondary">Cancel</button>
<button className="action-btn secondary">Go Back</button>
```

**Features:**
- White background with gray border
- Hover: Blue border and blue text
- Subtle shadow transitions
- Lift animation on hover

---

### 3️⃣ **Status Buttons** (Context-Specific)

**Success Button** (Positive actions - approve, confirm, complete)
```tsx
<button className="btn-success">Approve Request</button>
<button className="action-btn success">Complete Task</button>
```
- Green gradient (`#10b981` → `#059669`)

**Danger Button** (Destructive actions - delete, reject, remove)
```tsx
<button className="btn-danger">Delete User</button>
<button className="action-btn danger">Reject Request</button>
```
- Red gradient (`#ef4444` → `#dc2626`)

**Warning Button** (Caution actions - pause, postpone)
```tsx
<button className="btn-warning">Postpone</button>
<button className="action-btn warning">Pause Service</button>
```
- Orange gradient (`#f59e0b` → `#d97706`)

**Info Button** (Informational actions)
```tsx
<button className="btn-info">View Details</button>
<button className="action-btn info">Learn More</button>
```
- Blue gradient (`#3b82f6` → `#2563eb`)

---

### 4️⃣ **Outline Buttons** (Ghost Style)

**Usage:** Less emphasis, alternative to solid buttons

```tsx
<button className="btn-outline-primary">View All</button>
<button className="btn-outline-danger">Remove</button>
```

**Features:**
- Transparent background
- Colored border (2px)
- Fills with color on hover
- Smooth color transitions

---

### 5️⃣ **Ghost Buttons** (Minimal)

**Usage:** Tertiary actions, inline actions

```tsx
<button className="btn-ghost">Skip</button>
```

**Features:**
- No border or background
- Gray text
- Light gray background on hover

---

### 6️⃣ **Icon Buttons** (Square/Circle)

**Usage:** Toolbars, compact actions, icon-only buttons

```tsx
<button className="btn-icon">
  <i className="fas fa-edit"></i>
</button>

<button className="btn-icon circle primary">
  <i className="fas fa-plus"></i>
</button>
```

**Variants:**
- `.btn-icon` - Square (44x44px)
- `.btn-icon.circle` - Circle
- `.btn-icon.primary` - Blue gradient filled

---

## 🎯 **Specialized Buttons**

### Retry Button
**Usage:** Error states, retry actions
```tsx
<button className="retry-button">Retry</button>
<button className="retry-btn">Try Again</button>
```

### Avatar Edit Button
**Usage:** Profile picture editing
```tsx
<button className="avatar-edit-btn">
  <i className="fas fa-camera"></i>
</button>
```
- Positioned absolutely (bottom-right)
- Circular (44x44px)
- Scale + rotate animation on hover

### Quick Action Button
**Usage:** Dashboard quick actions, card actions
```tsx
<button className="quick-action-btn">
  <i className="fas fa-file-alt"></i>
  <span>New Request</span>
</button>

<button className="quick-action-btn danger">
  <i className="fas fa-trash"></i>
  <span>Delete All</span>
</button>
```
- Vertical flex layout (icon + text)
- Card-style design
- `.danger` variant available

### Back Button
**Usage:** Navigation back
```tsx
<button className="back-btn">
  <i className="fas fa-arrow-left"></i>
  <span>Back</span>
</button>
```
- Slide left animation on hover

### View All Button
**Usage:** View more items, expand lists
```tsx
<button className="view-all-btn">
  <span>View All</span>
  <i className="fas fa-arrow-right"></i>
</button>
```
- Slide right animation on hover
- Blue text, transparent background

### Help Button
**Usage:** Help/support actions
```tsx
<button className="help-btn primary">Get Help</button>
<button className="help-btn secondary">Support</button>
```

### Filter Button
**Usage:** Filter toggles, dropdown triggers
```tsx
<button className="filter-btn">
  <i className="fas fa-filter"></i>
  <span>Filter</span>
</button>

<button className="filter-btn active">
  <i className="fas fa-filter"></i>
  <span>Active Filter</span>
</button>
```
- `.active` state with gradient background

### View Button
**Usage:** View actions in tables, compact view triggers
```tsx
<button className="btn-view">View</button>
<button className="btn-view small">View</button>
```

### Action Link
**Usage:** Link-styled buttons, inline actions
```tsx
<button className="action-link">Learn More</button>
```
- Transparent, blue text
- Underline on hover

---

## 📏 **Size Variants**

All button types support size modifiers:

```tsx
<button className="btn-primary btn-xs">Extra Small</button>
<button className="action-btn primary small">Small</button>
<button className="btn-primary">Medium (Default)</button>
<button className="btn-primary btn-lg">Large</button>
<button className="btn-primary btn-xl">Extra Large</button>
```

**Sizes:**
- `.btn-xs` / `.action-btn.xs` → 6px/12px padding, 0.8125rem font
- `.btn-sm` / `.action-btn.small` → 8px/16px padding, 0.875rem font
- Default → 12px/24px padding, 0.9375rem font
- `.btn-lg` → 14px/32px padding, 1.0625rem font
- `.btn-xl` → 16px/40px padding, 1.125rem font

---

## ⚡ **Advanced Features**

### Loading State
```tsx
<button className="btn-primary btn-loading">
  Processing...
</button>
```
- Hides text, shows spinner
- Disabled pointer events
- Animated rotating spinner

### Button Groups
```tsx
<div className="btn-group">
  <button className="btn-secondary">Day</button>
  <button className="btn-secondary">Week</button>
  <button className="btn-secondary">Month</button>
</div>
```
- Connected buttons (no gaps)
- Rounded corners on first/last only

---

## 🎨 **Design Features**

All buttons include:
- ✨ **Smooth transitions** - Cubic-bezier easing (0.4, 0, 0.2, 1)
- 🎭 **Hover effects** - Lift, glow, color changes
- 💫 **Active states** - Press down effect
- 🚫 **Disabled states** - 60% opacity, no pointer
- 📱 **Responsive** - Optimized for mobile (smaller padding)
- ♿ **Accessible** - Focus states, proper cursor

---

## 📊 **Statistics**

- **Total Button Types:** 25+
- **Total Variants:** 50+ (with sizes and states)
- **Total CSS Lines:** 780+
- **File Size:** ~22KB

---

## 🎯 **Usage Best Practices**

1. **Use `.btn-primary` for main actions** (submit, create, save)
2. **Use `.btn-secondary` for cancel/back** actions
3. **Use status buttons** (success/danger/warning) for context-specific actions
4. **Use outline/ghost** for less important actions
5. **Use icon buttons** for toolbars and compact spaces
6. **Add size modifiers** only when necessary
7. **Use specialized buttons** for their specific purposes

---

## 🔧 **Implementation**

All button styles are located in:
```
web/registrarconnect-admin/src/styles/components/buttons.css
```

Imported via:
```css
@import './components/buttons.css';
```

---

## 🎉 **Complete & Production-Ready!**

Your button system is fully modular, professional, and ready for production use!


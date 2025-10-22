# Button Style Guide

## Standard Button Classes

Use these standardized button classes throughout the application:

### Primary Button Classes

| Class Name | Usage | Example |
|------------|-------|---------|
| `btn-primary` | Main actions, submit buttons | Save, Submit, Confirm |
| `btn-secondary` | Secondary actions, cancel | Cancel, Back |
| `btn-danger` | Destructive actions | Delete, Remove, Reject |
| `btn-success` | Success actions | Approve, Accept |
| `btn-warning` | Warning actions | Reset, Clear |
| `action-btn primary` | Modern action buttons (primary) | Icon + Text actions |
| `action-btn secondary` | Modern action buttons (secondary) | Icon + Text actions |
| `action-btn danger` | Modern action buttons (danger) | Icon + Text destructive actions |

### Icon Buttons

| Class Name | Usage |
|------------|-------|
| `icon-btn` | Icon-only buttons |
| `icon-btn danger` | Icon-only destructive buttons |

### Button Sizes

| Class Name | Usage |
|------------|-------|
| `btn-sm` | Small buttons |
| `action-btn small` | Small modern action buttons |

## Examples

```tsx
// Primary action
<button className="btn-primary">
  <Save size={18} />
  Save Changes
</button>

// Secondary action
<button className="btn-secondary">
  <X size={18} />
  Cancel
</button>

// Danger action
<button className="btn-danger">
  <Trash2 size={18} />
  Delete
</button>

// Modern action button
<button className="action-btn primary">
  <Plus size={16} />
  Add New
</button>

// Icon-only button
<button className="icon-btn">
  <RefreshCw size={16} />
</button>
```

## Migration Notes

Both `btn-*` and `action-btn *` styles are supported. New screens should prefer `action-btn` for consistency with modern designs.

### Consistent Button Patterns

1. **Forms**: Use `btn-primary` for submit, `btn-secondary` for cancel
2. **Tables/Lists**: Use `action-btn` for row actions
3. **Modals**: Use `btn-primary` for confirm, `btn-secondary` for cancel
4. **Navigation**: Use `action-btn secondary` for back buttons
5. **Destructive Actions**: Always use `danger` variant with confirmation

## Current Implementation

All screens now follow these standards:
- ✅ Admin screens use `action-btn` pattern
- ✅ Student screens use `action-btn` pattern  
- ✅ Finance screens use `btn-*` and `action-btn` patterns
- ✅ Registrar screens use `btn-*` and `action-btn` patterns
- ✅ Faculty screens use `action-btn` pattern

Both patterns are fully supported and styled consistently.


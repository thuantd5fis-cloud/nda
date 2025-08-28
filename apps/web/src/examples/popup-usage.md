# Popup System Usage Examples

## Import
```typescript
import { useConfirm } from '@/hooks/use-confirm';
```

## Basic Usage

### 1. Confirm Dialog
```typescript
const { confirm, confirmDelete, confirmWarning } = useConfirm();

// Basic confirm
const handleAction = async () => {
  const confirmed = await confirm('Are you sure?');
  if (confirmed) {
    // Do something
  }
};

// Delete confirm (red variant)
const handleDelete = async () => {
  const confirmed = await confirmDelete();
  if (confirmed) {
    // Delete item
  }
};

// Warning confirm (yellow variant)
const handleWarning = async () => {
  const confirmed = await confirmWarning('This action might cause issues');
  if (confirmed) {
    // Proceed with caution
  }
};
```

### 2. Alert Dialog
```typescript
const { alert, alertSuccess, alertError } = useConfirm();

// Basic alert
await alert('Information message');

// Success alert
await alertSuccess('Operation completed successfully!');

// Error alert
await alertError('Something went wrong!');
```

### 3. Toast Notifications
```typescript
const { toast } = useConfirm();

// Success toast
toast.success('Item saved successfully!');

// Error toast
toast.error('Failed to save item');

// Warning toast
toast.warning('Please check your input');

// Info toast
toast.info('New feature available');
```

## Advanced Usage

### Custom Confirm Options
```typescript
const confirmed = await confirm('Delete this item?', {
  title: 'Custom Title',
  confirmText: 'Yes, Delete',
  cancelText: 'Keep It',
  variant: 'danger'
});
```

### Custom Alert Options
```typescript
await alert('Custom message', {
  title: 'Custom Alert',
  variant: 'warning',
  okText: 'Understood'
});
```

### Direct Context Usage
```typescript
import { usePopup } from '@/contexts/popup-context';

const { showToast, showConfirm } = usePopup();

// Custom toast with position
showToast({
  message: 'Custom toast',
  toastType: 'info',
  position: 'bottom-center',
  duration: 3000
});

// Custom confirm with callbacks
showConfirm({
  message: 'Are you sure?',
  onConfirm: async () => {
    console.log('Confirmed!');
  },
  onCancel: () => {
    console.log('Cancelled!');
  }
});
```

## Replacing window.alert and window.confirm

### Before
```typescript
// Old way
if (window.confirm('Delete item?')) {
  // delete
}
alert('Success!');
```

### After
```typescript
// New way
const { confirmDelete, toast } = useConfirm();

if (await confirmDelete()) {
  // delete
}
toast.success('Success!');
```

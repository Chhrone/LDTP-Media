/**
 * Global SweetAlert2 configuration
 * This file sets default options for all SweetAlert2 notifications
 */
import Swal from 'sweetalert2';

// Create a custom SweetAlert instance with default options
const SwalConfig = Swal.mixin({
  position: 'top-end', // Always position at top-right corner
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  toast: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Create a custom method that safely applies our configuration
Swal.customFire = function(options) {
  // If it's a toast notification, use our custom config
  if (options.toast === true) {
    return SwalConfig.fire(options);
  }

  // For confirmation dialogs and other non-toast alerts
  // Position them at the top-right if not specified
  const updatedOptions = { ...options };
  if (!updatedOptions.position) {
    updatedOptions.position = 'top-end';
  }

  return Swal.fire(updatedOptions);
};

export default Swal;

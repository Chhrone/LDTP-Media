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

// Override the default Swal.fire method to use our custom configuration for toasts
const originalFire = Swal.fire;
Swal.fire = function(options) {
  // If it's a toast notification, use our custom config
  if (options.toast === true) {
    return SwalConfig.fire(options);
  }
  
  // For confirmation dialogs and other non-toast alerts, use the original method
  // but still position them at the top-right if not specified
  if (!options.position) {
    options.position = 'top-end';
  }
  
  return originalFire.call(this, options);
};

export default Swal;

/**
 * Media handler utility for camera and file upload operations
 * Provides functions for camera initialization, photo capture, and file upload
 */
class MediaHandler {
  /**
   * Initializes camera functionality
   * @param {Object} options
   * @param {string} options.videoElementId
   * @param {string} options.canvasElementId
   * @param {string} options.previewElementId
   * @param {string} options.startButtonId
   * @param {string} options.captureButtonId
   * @param {string} options.retakeButtonId
   * @param {string} options.imageInputId
   * @returns {Object}
   */
  static initializeCamera(options) {
    const {
      videoElementId,
      canvasElementId,
      previewElementId,
      startButtonId,
      captureButtonId,
      retakeButtonId,
      imageInputId
    } = options;

    const video = document.getElementById(videoElementId);
    const canvas = document.getElementById(canvasElementId);
    const imagePreview = document.getElementById(previewElementId);
    const startCameraButton = document.getElementById(startButtonId);
    const capturePhotoButton = document.getElementById(captureButtonId);
    const retakePhotoButton = document.getElementById(retakeButtonId);

    let stream = null;
    let cameraActive = false;

    startCameraButton.addEventListener('click', async () => {
      if (!cameraActive) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment'
            },
            audio: false
          });

          video.srcObject = stream;

          video.onloadedmetadata = () => {
            const cameraContainer = document.querySelector('.camera-container');
            if (cameraContainer) {
              const aspectRatio = video.videoWidth / video.videoHeight;
              const containerWidth = cameraContainer.clientWidth;
              const calculatedHeight = containerWidth / aspectRatio;

              if (calculatedHeight > 500) {
                cameraContainer.style.height = '500px';
              } else {
                cameraContainer.style.height = calculatedHeight + 'px';
              }
            }
          };

          cameraActive = true;
          startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Close Camera';
          capturePhotoButton.disabled = false;
        } catch (error) {
          console.error('Cannot access camera:', error);
          alert('Cannot access camera. Please make sure you have granted camera permissions.');
        }
      } else {
        MediaHandler.stopCameraStream(stream, video);
        cameraActive = false;
        startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
        capturePhotoButton.disabled = true;
      }
    });

    capturePhotoButton.addEventListener('click', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = "Captured photo";
        img.crossOrigin = "anonymous";

        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);

        const fileName = `photo_${Date.now()}.jpg`;
        const imageFile = new File([blob], fileName, { type: 'image/jpeg' });

        console.log('Camera capture: Original file size:', imageFile.size / 1024, 'KB');

        try {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(imageFile);
          const imageInput = document.getElementById(imageInputId);
          imageInput.files = dataTransfer.files;
        } catch (error) {
          console.error('Error setting file to input:', error);
          window.capturedPhoto = imageFile;
        }

        capturePhotoButton.disabled = true;
        retakePhotoButton.disabled = false;

        MediaHandler.stopCameraStream(stream, video);
        cameraActive = false;
        startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
      }, 'image/jpeg', 0.7);
    });

    retakePhotoButton.addEventListener('click', () => {
      imagePreview.innerHTML = '';
      retakePhotoButton.disabled = true;
      document.getElementById(imageInputId).value = '';
      alert('Please open the camera again to take a new photo');
    });

    return {
      stopCamera: () => MediaHandler.stopCameraStream(stream, video)
    };
  }

  /**
   * Initializes file upload functionality
   * @param {Object} options
   * @param {string} options.fileInputId
   * @param {string} options.previewElementId
   * @param {string} options.imageInputId
   */
  static initializeFileUpload(options) {
    const { fileInputId, previewElementId, imageInputId } = options;

    const fileInput = document.getElementById(fileInputId);
    const uploadPreview = document.getElementById(previewElementId);

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const fileSizeKB = file.size / 1024;
        console.log('Uploaded file size:', fileSizeKB, 'KB');

        if (fileSizeKB > 900) {
          const warningElement = document.createElement('div');
          warningElement.className = 'file-size-warning';
          warningElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            Large image (${Math.round(fileSizeKB)} KB). Will be compressed before upload.
          `;

          setTimeout(() => {
            const previewContainer = document.getElementById(previewElementId);
            if (previewContainer && !previewContainer.querySelector('.file-size-warning')) {
              previewContainer.appendChild(warningElement);
            }
          }, 100);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.alt = "Uploaded image";
          img.crossOrigin = "anonymous";

          uploadPreview.innerHTML = '';
          uploadPreview.appendChild(img);

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          document.getElementById(imageInputId).files = dataTransfer.files;
        };
        reader.readAsDataURL(file);
      } else {
        uploadPreview.innerHTML = '';
        document.getElementById(imageInputId).value = '';
      }
    });
  }

  /**
   * Stops camera stream and cleans up resources
   * @param {MediaStream} stream
   * @param {HTMLVideoElement} videoElement
   */
  static stopCameraStream(stream, videoElement) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (videoElement) {
        videoElement.srcObject = null;
      }
      return true;
    }
    return false;
  }
}

export default MediaHandler;

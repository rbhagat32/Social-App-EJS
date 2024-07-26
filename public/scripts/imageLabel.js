try {
  document
    .getElementById("imageUpload")
    .addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        document.getElementById(
          "imageUploadLabel"
        ).innerText = `${file.name.slice(0, 12)}...`;
      }
    });
} catch (error) {
  throw new Error(error);
}

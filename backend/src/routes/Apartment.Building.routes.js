const multer = require('multer');
const upload = multer(); // or configure storage if you want to save files

router.post(
  '/',
  upload.any(), // or upload.array('images'), if you want only images
  buildingController.createBuilding
);
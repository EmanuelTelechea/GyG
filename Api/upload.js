import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js"; // Importar la config

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "articulos", // Carpeta en Cloudinary
    format: async (req, file) => "png", // Formato de la imagen
    public_id: (req, file) => file.originalname.split(".")[0], // Nombre de la imagen
  },
});

const upload = multer({ storage: storage });

export default upload;

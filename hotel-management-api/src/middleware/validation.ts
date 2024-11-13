// import { Request, Response, NextFunction } from 'express';
// import { Hotel } from '../models/hotelModel';

// export class ValidationMiddleware {
//   static validateHotelData(req: Request, res: Response, next: NextFunction) {
//     const hotel: Partial<Hotel> = req.body;
//     const requiredFields = [
//       'title',
//       'description',
//       'guestCount',
//       'bedroomCount',
//       'bathroomCount',
//       'amenities',
//       'host',
//       'address',
//       'latitude',
//       'longitude'
//     ];

//     const missingFields = requiredFields.filter(field => !hotel[field as keyof Hotel]);

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         error: 'Missing required fields',
//         fields: missingFields
//       });
//     }

//     if (hotel.host && (!hotel.host.name || !hotel.host.email)) {
//       return res.status(400).json({
//         error: 'Host information incomplete',
//         required: ['name', 'email']
//       });
//     }

//     if (!Array.isArray(hotel.amenities)) {
//       return res.status(400).json({
//         error: 'Amenities must be an array'
//       });
//     }

//     next();
//   }

//   static validateImageUpload(req: Request, res: Response, next: NextFunction) {
//     if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
//       return res.status(400).json({
//         error: 'No images provided'
//       });
//     }

//     if (!req.body.hotelId) {
//       return res.status(400).json({
//         error: 'Hotel ID is required'
//       });
//     }

//     next();
//   }
// }




import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { Hotel } from '../models/hotelModel';

export const validateHotelData = (req: Request, res: Response, next: NextFunction) => {
  const hotel: Partial<Hotel> = req.body;
  const requiredFields = [
    'title',
    'description',
    'guestCount',
    'bedroomCount',
    'bathroomCount',
    'amenities',
    'host',
    'address',
    'latitude',
    'longitude'
  ];

  const missingFields = requiredFields.filter(field => !hotel[field as keyof Hotel]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      fields: missingFields
    });
  }

  if (hotel.host && (!hotel.host.name || !hotel.host.email)) {
    return res.status(400).json({
      error: 'Host information incomplete',
      required: ['name', 'email']
    });
  }

  if (!Array.isArray(hotel.amenities)) {
    return res.status(400).json({
      error: 'Amenities must be an array'
    });
  }

  next();
};

// export const validateImageUpload = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
//     return res.status(400).json({
//       error: 'No images provided'
//     });
//   }

//   if (!req.body.hotelId) {
//     return res.status(400).json({
//       error: 'Hotel ID is required'
//     });
//   }

//   next();
// };

const ALLOWED_IMAGE_FORMATS = [
  '.jpg', '.jpeg', '.png', '.gif', '.bmp',
  '.tif', '.tiff', '.webp', '.heif', '.heic'
];

export const validateImageUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res.status(400).json({
      error: 'No images provided'
    });
  }

  if (!req.body.hotelId) {
    return res.status(400).json({
      error: 'Hotel ID is required'
    });
  }

  // Validate file formats
  const files = req.files as Express.Multer.File[];
  const invalidFiles = files.filter(file => {
    const ext = path.extname(file.originalname).toLowerCase();
    return !ALLOWED_IMAGE_FORMATS.includes(ext);
  });

  if (invalidFiles.length > 0) {
    const invalidFileNames = invalidFiles.map(file => file.originalname).join(', ');
    return res.status(400).json({
      error: `Invalid file format(s) detected. Only JPEG, PNG, GIF, BMP, TIFF, WebP, and HEIF formats are allowed. Invalid files: ${invalidFileNames}`,
      allowedFormats: ALLOWED_IMAGE_FORMATS
    });
  }

  next();
};
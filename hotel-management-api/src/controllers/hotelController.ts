import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import { Hotel, Room } from '../models/hotelModel';

const DATA_DIR = path.join(__dirname, '../../data/hotels');

export const ALLOWED_IMAGE_FORMATS = [
  '.jpg', '.jpeg', '.png', '.gif', '.bmp',
  '.tif', '.tiff', '.webp', '.heif', '.heic'
];

async function validateImageFormat(file: Express.Multer.File): Promise<boolean> {
  const ext = path.extname(file.originalname).toLowerCase();
  return ALLOWED_IMAGE_FORMATS.includes(ext);
}

export class HotelController {
  async createHotel(req: Request, res: Response) {
    try {
      const hotelData: Hotel = req.body;
      const slug = slugify(hotelData.title, { lower: true });
      const roomsWithSlugs = hotelData.rooms.map((room: Room) => ({
        ...room,
        roomSlug: slugify(room.roomTitle, { lower: true }), hotelSlug: slug
      }));
      
      hotelData.slug = slug;
      hotelData.rooms = roomsWithSlugs;
      hotelData.id = Date.now().toString();
      
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(
        path.join(DATA_DIR, `${hotelData.id}.json`),
        JSON.stringify(hotelData, null, 2)
      );

      res.status(201).json(hotelData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create hotel' });
    }
  }

  async getHotel(req: Request, res: Response) {
    try {
      const { hotelId } = req.params;
      const filePath = path.join(DATA_DIR, `${hotelId}.json`);
      
      const hotelData = await fs.readFile(filePath, 'utf-8');
      const hotel = JSON.parse(hotelData);
      
      res.json(hotel);
    } catch (error) {
      res.status(404).json({ error: 'Hotel not found' });
    }
  }

  async updateHotel(req: Request, res: Response) {
    try {
      const { hotelId } = req.params;
      const updateData = req.body;

      const filePath = path.join(DATA_DIR, `${hotelId}.json`);
      
      const hotelData = await fs.readFile(filePath, 'utf-8');
      const hotel = JSON.parse(hotelData);
      
      const updatedHotel = { ...hotel, ...updateData };
      
      if (updateData.title) {
        updatedHotel.slug = slugify(updateData.title, { lower: true });
      }

      // Update rooms and their slugs
      if (updateData.rooms) {
        updatedHotel.rooms = updateData.rooms.map((room: Room) => ({
          ...room,
          roomSlug: slugify(room.roomTitle, { lower: true }),
          hotelSlug: updatedHotel.slug
        }));
      } else if (updateData.title) {
        // If only hotel title changed, update hotelSlug in all rooms
        updatedHotel.rooms = updatedHotel.rooms.map((room: Room) => ({
          ...room,
          hotelSlug: updatedHotel.slug
        }));
      }
      
      await fs.writeFile(filePath, JSON.stringify(updatedHotel, null, 2));
      
      res.json(updatedHotel);
    } catch (error) {
      res.status(404).json({ error: 'Hotel not found' });
    }
  }

  // async uploadImages(req: Request, res: Response) {
  //   try {
  //     const files = req.files as Express.Multer.File[];
  //     const { hotelId } = req.body;
      
  //     const filePath = path.join(DATA_DIR, `${hotelId}.json`);
  //     const hotelData = await fs.readFile(filePath, 'utf-8');
  //     const hotel: Hotel = JSON.parse(hotelData);
      
  //     const imageUrls = files.map(file => `/uploads/images/${file.filename}`);
  //     hotel.images = [...hotel.images, ...imageUrls];
      
  //     await fs.writeFile(filePath, JSON.stringify(hotel, null, 2));
      
  //     res.json({ imageUrls });
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to upload images' });
  //   }
  // }


  async uploadImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      const { hotelId } = req.body;

      // Double-check file formats (additional security layer)
      const invalidFiles = files.filter(file => !validateImageFormat(file));
      if (invalidFiles.length > 0) {
        // Clean up invalid files
        await Promise.all(invalidFiles.map(file => 
          fs.unlink(file.path).catch(() => {})
        ));

        return res.status(400).json({
          error: 'Invalid file format(s) detected. Only JPEG, PNG, GIF, BMP, TIFF, WebP, and HEIF formats are allowed.',
          allowedFormats: ALLOWED_IMAGE_FORMATS
        });
      }
      
      const filePath = path.join(DATA_DIR, `${hotelId}.json`);
      const hotelData = await fs.readFile(filePath, 'utf-8');
      const hotel: Hotel = JSON.parse(hotelData);
      
      const imageUrls = files.map(file => `/uploads/images/${file.filename}`);
      hotel.images = [...hotel.images, ...imageUrls];
      
      await fs.writeFile(filePath, JSON.stringify(hotel, null, 2));
      
      res.json({ imageUrls });
    } catch (error) {
      // Clean up uploaded files in case of error
      if (req.files) {
        const files = req.files as Express.Multer.File[];
        await Promise.all(files.map(file => 
          fs.unlink(file.path).catch(() => {})
        ));
      }
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
}
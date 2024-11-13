import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { HotelController } from '../src/controllers/hotelController';

// Mock fs/promises
jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('HotelController', () => {
  let hotelController: HotelController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    hotelController = new HotelController();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    // Reset fs mocks
    jest.clearAllMocks();
  });

  describe('createHotel', () => {
    const sampleHotelData = {
      title: 'Test Hotel',
      description: 'Test Description',
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['wifi', 'parking'],
      host: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      address: '123 Test St',
      latitude: 40.7128,
      longitude: -74.0060,
      images: [],
      rooms: [
        {
          roomTitle: 'Deluxe Room',
          roomImage: 'room.jpg',
          bedroomCount: 1,
          hotelSlug: '',
          roomSlug: ''
        }
      ]
    };

    it('should create a hotel successfully', async () => {
      mockRequest = {
        body: sampleHotelData
      };

      mockedFs.mkdir.mockResolvedValueOnce(undefined);
      mockedFs.writeFile.mockResolvedValueOnce(undefined);

      await hotelController.createHotel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockedFs.mkdir).toHaveBeenCalled();
      expect(mockedFs.writeFile).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Hotel',
          slug: 'test-hotel',
          rooms: expect.arrayContaining([
            expect.objectContaining({
              roomSlug: 'deluxe-room',
              hotelSlug: 'test-hotel'
            })
          ])
        })
      );
    });

    it('should handle errors when creating a hotel', async () => {
      mockRequest = {
        body: sampleHotelData
      };

      mockedFs.mkdir.mockRejectedValueOnce(new Error('Failed to create directory'));

      await hotelController.createHotel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create hotel'
      });
    });
  });

  describe('getHotel', () => {
    const sampleHotel = {
      id: '123',
      title: 'Test Hotel',
      slug: 'test-hotel'
    };

    it('should get a hotel successfully', async () => {
      mockRequest = {
        params: { hotelId: '123' }
      };

      mockedFs.readFile.mockResolvedValueOnce(JSON.stringify(sampleHotel));

      await hotelController.getHotel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockedFs.readFile).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(sampleHotel);
    });

    it('should handle hotel not found', async () => {
      mockRequest = {
        params: { hotelId: 'nonexistent' }
      };

      mockedFs.readFile.mockRejectedValueOnce(new Error('File not found'));

      await hotelController.getHotel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Hotel not found'
      });
    });
  });

  describe('updateHotel', () => {
    const existingHotel = {
      id: '123',
      title: 'Original Hotel',
      slug: 'original-hotel',
      rooms: [
        {
          roomTitle: 'Original Room',
          roomSlug: 'original-room',
          hotelSlug: 'original-hotel',
          roomImage: 'room.jpg',
          bedroomCount: 1
        }
      ]
    };

    it('should update hotel title and slugs successfully', async () => {
      mockRequest = {
        params: { hotelId: '123' },
        body: {
          title: 'Updated Hotel'
        }
      };

      mockedFs.readFile.mockResolvedValueOnce(JSON.stringify(existingHotel));
      mockedFs.writeFile.mockResolvedValueOnce(undefined);

      await hotelController.updateHotel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Hotel',
          slug: 'updated-hotel',
          rooms: expect.arrayContaining([
            expect.objectContaining({
              hotelSlug: 'updated-hotel'
            })
          ])
        })
      );
    });

    it('should update room titles and slugs successfully', async () => {
      mockRequest = {
        params: { hotelId: '123' },
        body: {
          rooms: [
            {
              roomTitle: 'Updated Room',
              roomImage: 'room.jpg',
              bedroomCount: 1
            }
          ]
        }
      };

      mockedFs.readFile.mockResolvedValueOnce(JSON.stringify(existingHotel));
      mockedFs.writeFile.mockResolvedValueOnce(undefined);

      await hotelController.updateHotel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.arrayContaining([
            expect.objectContaining({
              roomTitle: 'Updated Room',
              roomSlug: 'updated-room'
            })
          ])
        })
      );
    });
  });

  describe('uploadImages', () => {
    const sampleHotel = {
      id: '123',
      images: ['/uploads/images/existing.jpg'],
      title: 'Test Hotel'
    };

    it('should upload images successfully', async () => {
      mockRequest = {
        files: [
          { filename: 'new-image.jpg' }
        ] as Express.Multer.File[],
        body: { hotelId: '123' }
      };

      mockedFs.readFile.mockResolvedValueOnce(JSON.stringify(sampleHotel));
      mockedFs.writeFile.mockResolvedValueOnce(undefined);

      await hotelController.uploadImages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        imageUrls: ['/uploads/images/new-image.jpg']
      });
    });

    it('should handle upload errors', async () => {
      mockRequest = {
        files: [
          { filename: 'new-image.jpg' }
        ] as Express.Multer.File[],
        body: { hotelId: '123' }
      };

      mockedFs.readFile.mockRejectedValueOnce(new Error('Upload failed'));

      await hotelController.uploadImages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to upload images'
      });
    });
  });
});
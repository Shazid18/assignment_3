export interface Room {
    hotelSlug: string;
    roomSlug: string;
    roomImage: string;
    roomTitle: string;
    bedroomCount: number;
  }
  
  export interface Hotel {
    id: string;
    slug: string;
    images: string[];
    title: string;
    description: string;
    guestCount: number;
    bedroomCount: number;
    bathroomCount: number;
    amenities: string[];
    host: {
      name: string;
      email: string;
    };
    address: string;
    latitude: number;
    longitude: number;
    rooms: Room[];
  }
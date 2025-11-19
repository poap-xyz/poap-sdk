import { PoapsResponse } from '../queries/PaginatedPoaps.js';

export class POAP {
  id: number;
  collectorAddress: string;
  transferCount: number;
  mintedOn: Date;
  dropId: number;
  imageUrl: string;
  city: string;
  country: string;
  description: string;
  startDate: Date;
  endDate: Date;
  name: string;

  public static fromCompass(response: PoapsResponse): POAP {
    const mintedOn = new Date(0);
    mintedOn.setUTCSeconds(response.minted_on);

    return new POAP({
      id: Number(response.id),
      collectorAddress: response.collector_address,
      transferCount: response.transfer_count,
      mintedOn,
      dropId: Number(response.drop_id),
      imageUrl: response.drop.image_url,
      city: response.drop.city,
      country: response.drop.country,
      description: response.drop.description,
      startDate: new Date(response.drop.start_date),
      endDate: new Date(response.drop.end_date),
      name: response.drop.name,
    });
  }

  // eslint-disable-next-line max-statements
  constructor(properties: PoapProperties) {
    this.id = properties.id;
    this.collectorAddress = properties.collectorAddress;
    this.mintedOn = properties.mintedOn;
    this.dropId = properties.dropId;
    this.transferCount = properties.transferCount;
    this.imageUrl = properties.imageUrl;
    this.city = properties.city;
    this.country = properties.country;
    this.description = properties.description;
    this.startDate = properties.startDate;
    this.endDate = properties.endDate;
    this.name = properties.name;
  }
}

interface PoapProperties {
  id: number;
  collectorAddress: string;
  transferCount: number;
  mintedOn: Date;
  dropId: number;
  imageUrl: string;
  city: string;
  country: string;
  description: string;
  startDate: Date;
  endDate: Date;
  name: string;
}

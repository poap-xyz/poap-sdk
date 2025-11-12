import {
  PoapsResponse,
  PoapsWithStatsResponse,
} from '../queries/PaginatedPoaps';

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

export class POAP {
  readonly id: number;
  readonly collectorAddress: string;
  readonly transferCount: number;
  readonly mintedOn: Date;
  readonly dropId: number;
  readonly imageUrl: string;
  readonly city: string;
  readonly country: string;
  readonly description: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly name: string;

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

export interface POAPMintingStats {
  mintOrder: number;
}

export interface POAPCollectorStats {
  power: number;
}

export interface POAPDropStats {
  poapCount: number;
}

interface PoapWithStatsProperties extends PoapProperties {
  mintingStats?: POAPMintingStats;
  collectorStats?: POAPCollectorStats;
  dropStats?: POAPDropStats;
}

export class POAPWithStats extends POAP {
  readonly mintingStats?: POAPMintingStats;
  readonly collectorStats?: POAPCollectorStats;
  readonly dropStats?: POAPDropStats;

  constructor(properties: PoapWithStatsProperties) {
    super(properties);

    this.mintingStats = properties.mintingStats;
    this.collectorStats = properties.collectorStats;
    this.dropStats = properties.dropStats;
  }

  // eslint-disable-next-line complexity
  public static fromCompass(response: PoapsWithStatsResponse): POAPWithStats {
    const mintedOn = new Date(0);
    mintedOn.setUTCSeconds(response.minted_on);

    return new POAPWithStats({
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
      mintingStats: response.minting_stats?.mint_order
        ? { mintOrder: response.minting_stats.mint_order }
        : undefined,
      collectorStats: response.collector?.poaps_owned
        ? { power: response.collector.poaps_owned }
        : undefined,
      dropStats: response.drop_stats_by_chain_aggregate
        ? {
            poapCount:
              response.drop_stats_by_chain_aggregate.aggregate.sum.poap_count,
          }
        : undefined,
    });
  }
}

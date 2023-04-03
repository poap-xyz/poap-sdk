import { RegistryApiProvider, CreateAttributeInput, CreateAttributesBulkInput, CompassProvider } from '@rlajous/providers';
import { Attribute } from './domain/Attribute';
import { PaginatedResult } from './utils/types';
import { FetchAttributesInput } from './types';
import { AttributesQueryResponse, PAGINATED_ATTRIBUTES_QUERY } from './queries';
import { createFilter } from './queries/utils';

/**
 * A client for creating attributes.
 *
 * @class AttributesClient
 */
export class AttributesClient {
  /**
   * Creates a new AttributesClient.
   *
   * @constructor
   * @param {RegistryApiProvider} RegistryApiProvider - The registry API provider to use for creating attributes.
   */
  constructor(private RegistryApiProvider: RegistryApiProvider, private CompassProvider: CompassProvider) {}

  /**
   * Creates a single attribute.
   *
   * @async
   * @function
   * @name AttributesClient#create
   * @param {CreateAttributeInput} input - The input data for creating the attribute.
   * @returns {Promise<Attribute>} A Promise that resolves with the created attribute.
   */
  async create(input: CreateAttributeInput): Promise<Attribute> {
    const repsonse = await this.RegistryApiProvider.createAttribute(input);
    return new Attribute({
      ...repsonse,
      timestamp: new Date(repsonse.timestamp),
    });
  }

  /**
   * Creates multiple attributes.
   *
   * @async
   * @function
   * @name AttributesClient#createBulk
   * @param {CreateAttributesBulkInput} input - The input data for creating the attributes.
   * @returns {Promise<Attribute[]>} A Promise that resolves with an array of the created attributes.
   */
  async createBulk(input: CreateAttributesBulkInput): Promise<Attribute[]> {
    const repsonse = await this.RegistryApiProvider.createAttributesBulk(input);
    return repsonse.map(
      (attribute) =>
        new Attribute({
          ...attribute,
          timestamp: new Date(attribute.timestamp),
        }),
    );
  }

  /**
   * Fetches a paginated list of attributes filtered by `key` and `value` and sorted by `order`.
   * @async
   * @function
   * @param {FetchAttributesInput} input - An object containing the input parameters.
   * @param {number} input.limit - The maximum number of attributes to retrieve per page.
   * @param {number} input.offset - The offset to start retrieving attributes from.
   * @param {string} input.order - The attribute order to use. Can be "asc" or "desc".
   * @param {string} input.key - The key to filter the attributes by.
   * @param {string} input.value - The value to filter the attributes by.
   * @returns {Promise<PaginatedResult<Attribute>>} - A promise that resolves to a paginated result of attributes.
   */
  async fetch({
    limit,
    offset,
    order,
    key,
    value,
  }: FetchAttributesInput): Promise<PaginatedResult<Attribute>> {
    const { attributes_aggregate } =
      await this.CompassProvider.request<AttributesQueryResponse>(
        PAGINATED_ATTRIBUTES_QUERY,
        {
          limit,
          offset,
          order_by: { id: order },
          where: {
            ...createFilter('key', key),
            ...createFilter('value', value),
          },
        },
      );

    const attributes: Attribute[] = attributes_aggregate.nodes.map(
      (attribute) => {
        return new Attribute({
          id: attribute.id,
          dropId:attribute.dropId,
          key:attribute.key,
          value:attribute.value,
          timestamp: new Date(attribute.timestamp),
          tokenId: attribute.tokenId ?? 0,
        }
        );
      },
    );

    const result = new PaginatedResult<Attribute>(
      attributes,
      attributes_aggregate.nodes.length > 0
        ? limit + 1 + attributes_aggregate.nodes.length
        : null,
    );

    return result;
  }
}

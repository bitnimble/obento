import { ContentRepository, CustomType, QueryOptions } from 'content/content_repository';
import Prismic from 'prismic-javascript';
import ResolvedApi from 'prismic-javascript/types/ResolvedApi';

interface Deserializer<PageSpecificType extends CustomType> {
  deserialize(obj: object): PageSpecificType;
}

export async function createPrismic<PageSpecificType extends CustomType>({
  apiEndpoint,
  deserializer,
}: {
  apiEndpoint: string;
  deserializer: Deserializer<PageSpecificType>;
}): Promise<ContentRepository<PageSpecificType>> {
  const api = await Prismic.getApi(apiEndpoint);
  const prismicApi = new PrismicApi(api, deserializer);
  return prismicApi;
}

class PrismicApi<PageSpecificType extends CustomType> implements ContentRepository<PageSpecificType> {
  constructor(
    private readonly api: ResolvedApi,
    private readonly deserializer: Deserializer<PageSpecificType>,
  ) { }

  async query<F extends (keyof PageSpecificType)[]>(type: string, query: string, options: QueryOptions<F>): Promise<(Partial<PageSpecificType> & Pick<PageSpecificType, F[number]>)[]>;
  async query(type: string, query: string): Promise<PageSpecificType[]>;
  async query<F extends (keyof PageSpecificType)[]>(type: string, query: string, options?: QueryOptions<F>) {
    const resp = await this.api.query(
      query,
      options
        ? { fetch: options.fields.map(field => `${type}.${field}`)}
        : undefined,
    );
    const results = resp.results;
    return results.map(r => this.deserializer.deserialize(r));
  }

  async getById(type: string, id: string) {
    const resp = await this.api.getByUID(type, id);
    return this.deserializer.deserialize(resp);
  }
}

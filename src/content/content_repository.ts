export type CustomType = {
  id: string,
  type: string,
};

export type QueryOptions<Fields extends readonly (string | number | Symbol)[]> = {
  fields: Fields,
};

export interface ContentRepository<PageSpecificType extends CustomType> {
  query(type: string, query: string): Promise<PageSpecificType[]>;
  query<F extends readonly (keyof PageSpecificType)[]>(
    type: string,
    query: string,
    // TODO: make it QueryOptions<F>, but we need hyphenated and not camel case
    options: QueryOptions<string[]>,
  ): Promise<(Partial<PageSpecificType> & Pick<PageSpecificType, keyof CustomType | F[number]>)[]>;
  getById(type: string, id: string): Promise<PageSpecificType | undefined>;
}

export interface vtexProduct {
  advertisement: string | null;
  cacheId: string;
  productId: string;
  description: string;
  productName: string;
  productReference: string;
  linkText: string;
  brand: string;
  brandId: number;
  link: string;
  categories: string[];
  categoryId: string;
  releaseDate: string;
  priceRange: {
    sellingPrice: {
      highPrice: number;
      lowPrice: number;
      __typename: string;
    };
    listPrice: {
      highPrice: number;
      lowPrice: number;
      __typename: string;
    };
    __typename: string;
  };
  specificationGroups: {
    name: string;
    originalName: string;
    specifications: {
      name: string;
      originalName: string;
      values: string[];
      __typename: string;
    }[];
    __typename: string;
  }[];
  skuSpecifications: unknown[];
  productClusters: {
    id: string;
    name: string;
    __typename: string;
  }[];
  clusterHighlights: {
    id: string;
    name: string;
    __typename: string;
  }[];
  properties: {
    name: string;
    values: string[];
    __typename: string;
  }[];
  items: {
    itemId: string;
    name: string;
    nameComplete: string;
    complementName: string;
    ean: string;
    variations: unknown[];
    referenceId: {
      Key: string;
      Value: string;
      __typename: string;
    }[];
    measurementUnit: string;
    unitMultiplier: number;
    images: {
      cacheId: string;
      imageId: string;
      imageLabel: string;
      imageTag: string;
      imageUrl: string;
      imageText: string;
      __typename: string;
    }[];
    sellers: {
      sellerId: string;
      sellerName: string;
      sellerDefault: boolean;
      commertialOffer: {
        discountHighlights: unknown[];
        teasers: unknown[];
        Price: number;
        ListPrice: number;
        Tax: number;
        taxPercentage: number;
        spotPrice: number;
        PriceWithoutDiscount: number;
        RewardValue: number;
        PriceValidUntil: string;
        AvailableQuantity: number;
        Installments: {
          Value: number;
          InterestRate: number;
          TotalValuePlusInterestRate: number;
          NumberOfInstallments: number;
          Name: string;
          PaymentSystemName: string;
          __typename: string;
        }[];
        __typename: string;
      };
      __typename: string;
    }[];
    __typename: string;
  }[];
  selectedProperties: unknown;
  rule: unknown;
  __typename: string;
};

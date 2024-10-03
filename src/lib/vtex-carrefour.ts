import { encodeUrl, encodeQueryParams, encodeBase64 } from "./vtex-helpers";
// import { Buffer } from "buffer";

// function encodeBase64(str: string): string {
//   return Buffer.from(str).toString("base64");
// }

export function getVariablesForCarrefour(q: string, category: string) {
  return {
    hideUnavailableItems: true,
    skusFilter: "ALL_AVAILABLE",
    simulationBehavior: "default",
    installmentCriteria: "MAX_WITHOUT_INTEREST",
    productOriginVtex: false,
    map: "c,c,c",
    query: `electro-y-tecnologia/${category}/${q}`,
    orderBy: "OrderByScoreDESC",
    from: 0,
    to: 15,
    selectedFacets: [
      { key: "c", value: "electro-y-tecnologia" },
      { key: "c", value: category },
      { key: "c", value: q },
    ],
    facetsBehavior: "Static",
    categoryTreeBehavior: "default",
    withFacets: false,
    variant: "null-null",
    advertisementOptions: {
      showSponsored: true,
      sponsoredCount: 3,
      advertisementPlacement: "top_search",
      repeatSponsoredProducts: true,
    },
  };
}

export function getExtensionsForCarrefour(q: string, category: string) {
  const variables = JSON.stringify(getVariablesForCarrefour(q, category));

  return {
    persistedQuery: {
      version: 1,
      sha256Hash:
        "c9ba53c47cbd7904ee373791cf16738106db3a39cde16beb2b53d3adb71d37d0",
      sender: "vtex.store-resources@0.x",
      provider: "vtex.search-graphql@0.x",
    },
    variables: encodeBase64(variables),
  };
}

export function encodeCarrefourQuery(query: string, category: string) {
  const extensions = JSON.stringify(getExtensionsForCarrefour(query, category));

  const queryParams = {
    workspace: "master",
    maxAge: "short",
    appsEtag: "remove",
    domain: "store",
    locale: "es-AR",
    operationName: "productSearchV3",
    variables: encodeUrl("{}"),
    extensions: encodeUrl(extensions),
  };
  return encodeQueryParams(queryParams);
}

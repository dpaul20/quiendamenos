export function encodeBase64(str: string) {
  return Buffer.from(str).toString("base64");
}

export function encodeUrl(str: string) {
  return encodeURIComponent(str);
}

export function encodeQueryParams(params: Record<string, string>) {
  return Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

export function getVariablesWithQuery(q: string) {
  return {
    productOriginVtex: false,
    simulationBehavior: "default",
    hideUnavailableItems: true,
    advertisementOptions: {
      showSponsored: true,
      sponsoredCount: 2,
      repeatSponsoredProducts: false,
      advertisementPlacement: "autocomplete",
    },
    fullText: q,
    count: 10,
    shippingOptions: [],
    variant: null,
  };
}

export function getExtensionsWithQuery(q: string) {
  const variables = JSON.stringify(getVariablesWithQuery(q));
  return {
    persistedQuery: {
      version: 1,
      sha256Hash:
        "3e2c473672fc986dc5377d35560f5d5244fbca3698414bd02772c649d67994b6",
      sender: "vtex.store-resources@0.x",
      provider: "vtex.search-graphql@0.x",
    },
    variables: encodeBase64(variables),
  };
}

export function encodeQuery(query: string) {
  const extensions = JSON.stringify(getExtensionsWithQuery(query));
  const queryParams = {
    workspace: "master",
    maxAge: "medium",
    appsEtag: "remove",
    domain: "store",
    locale: "es-AR",
    operationName: "productSearchV3",
    variables: encodeUrl("{}"),
    extensions: encodeUrl(extensions),
  };
  return encodeQueryParams(queryParams);
}

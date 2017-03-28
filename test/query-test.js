import assert from 'assert';
import Client from '../src/client';
import Config from '../src/config';
import productConnectionQuery from '../src/product-connection-query';
import collectionConnectionQuery from '../src/collection-connection-query';
import variantConnectionQuery from '../src/variant-connection-query';
import optionQuery from '../src/option-query';
import imageQuery from '../src/image-query';
import imageConnectionQuery from '../src/image-connection-query';
import collectionQuery from '../src/collection-query';
import checkoutQuery from '../src/checkout-query';
import customAttributeQuery from '../src/custom-attribute-query';
import lineItemConnectionQuery from '../src/line-item-connection-query';
import shippingRateQuery from '../src/shipping-rate-query';
import mailingAddressQuery from '../src/mailing-address-query';

suite('query-test', () => {
  const querySplitter = /[\s,]+/;

  function tokens(query) {
    return query.split(querySplitter).filter((token) => Boolean(token));
  }

  const config = new Config({
    domain: 'sendmecats.myshopify.com',
    storefrontAccessToken: 'abc123'
  });

  const client = new Client(config);

  test('it creates product queries with defaults', () => {
    const defaultQuery = productConnectionQuery();
    const query = client.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        defaultQuery(shop, 'products');
      });
    });

    const queryString = `query {
      shop {
        products (first: 20) {
          pageInfo {
            hasNextPage,
            hasPreviousPage
          },
          edges {
            cursor,
            node {
              id,
              createdAt,
              updatedAt,
              descriptionHtml,
              descriptionPlainSummary,
              handle,
              productType,
              title,
              vendor,
              tags,
              publishedAt,
              options {
                id,
                name,
                values
              },
              images (first: 250) {
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                },
                edges {
                  cursor,
                  node {
                    id,
                    src,
                    altText
                  }
                }
              },
              variants (first: 250) {
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                },
                edges {
                  cursor,
                  node {
                    id,
                    title,
                    price,
                    weight,
                    image {
                      id,
                      src,
                      altText
                    },
                    selectedOptions {
                      name,
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates product queries with specified fields', () => {
    const customQuery = productConnectionQuery(['id', 'tags', 'vendor', ['images', imageConnectionQuery(['src'])], ['options', optionQuery(['name'])], ['variants', variantConnectionQuery(['id', 'title'])]]);
    const query = client.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        customQuery(shop, 'products');
      });
    });

    const queryString = `query {
      shop {
        products (first: 20) {
          pageInfo {
            hasNextPage,
            hasPreviousPage
          },
          edges {
            cursor,
            node {
              id,
              tags,
              vendor,
              images (first: 250) {
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                },
                edges {
                  cursor,
                  node {
                    src
                  }
                }
              },
              options {
                id,
                name
              },
              variants (first: 250) {
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                },
                edges {
                  cursor,
                  node {
                    id,
                    title
                  }
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates collection queries with defaults', () => {
    const defaultQuery = collectionConnectionQuery();
    const query = client.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        defaultQuery(shop, 'collections');
      });
    });

    const queryString = `query {
      shop {
        collections (first: 20) {
          pageInfo {
            hasNextPage,
            hasPreviousPage
          },
          edges {
            cursor,
            node {
              id,
              handle,
              updatedAt,
              title,
              image {
                id,
                src,
                altText
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates collection queries with specified fields', () => {
    const customQuery = collectionConnectionQuery(['handle', 'updatedAt', 'title', ['image', imageQuery(['id'])]]);
    const query = client.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        customQuery(shop, 'collections');
      });
    });


    const queryString = `query {
      shop {
        collections (first: 20) {
          pageInfo {
            hasNextPage,
            hasPreviousPage
          },
          edges {
            cursor,
            node {
              id,
              handle,
              updatedAt,
              title,
              image {
                id
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it can create a nested product connection query', () => {
    const customQuery = collectionQuery([['products', productConnectionQuery()]]);
    const query = client.graphQLClient.query((root) => {
      customQuery(root, 'node', '1');
    });

    const queryString = `query {
      node (id: "gid://shopify/Collection/1") {
        __typename,
        ... on Collection {
          id,products (first: 20) {
            pageInfo {
              hasNextPage,hasPreviousPage
            },
            edges {
              cursor,
              node {
                id,
                createdAt,
                updatedAt,
                descriptionHtml,
                descriptionPlainSummary,
                handle,
                productType,
                title,
                vendor,
                tags,
                publishedAt,
                options {
                  id,
                  name,
                  values
                },
                images (first: 250) {
                  pageInfo {
                    hasNextPage,
                    hasPreviousPage
                  },
                  edges {
                    cursor,
                    node {
                      id,
                      src,
                      altText
                    }
                  }
                },
                variants (first: 250) {
                  pageInfo {
                    hasNextPage,
                    hasPreviousPage
                  },
                  edges {
                    cursor,
                    node {
                      id,
                      title,
                      price,
                      weight,
                      image {
                        id,
                        src,
                        altText
                      },
                      selectedOptions {
                        name,
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates checkout queries (within a mutation) with default fields', () => {
    const defaultQuery = checkoutQuery();
    const input = {
      lineItems: [
        {variantId: 'gid://shopify/ProductVariant/1', quantity: 5}
      ]
    };
    const query = client.graphQLClient.mutation((root) => {
      root.add('checkoutCreate', {args: {input}}, (checkoutCreate) => {
        defaultQuery(checkoutCreate, 'checkout');
      });
    });

    const queryString = `mutation {
      checkoutCreate (input: {lineItems: [{variantId: "gid://shopify/ProductVariant/1" quantity: 5}]}) {
        checkout {
          id
          ready
          note
          createdAt
          updatedAt
          requiresShipping,
          customAttributes {
            key
            value
          }
          shippingLine {
            handle
            price
            title
          }
          shippingAddress {
            address1
            address2
            city
            company
            country
            firstName
            formatted
            lastName
            latitude
            longitude
            phone
            province
            zip
            name
            countryCode
            provinceCode
            id
          }
          lineItems (first: 250) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                title
                variant {
                  id
                  title
                  price
                  weight
                  image {
                    id
                    src
                    altText
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
                quantity
                customAttributes {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });

  test('it creates checkout queries (within a mutation) with specified fields', () => {
    const customQuery = checkoutQuery(['id', 'createdAt', ['shippingLine', shippingRateQuery(['price'])],
      ['shippingAddress', mailingAddressQuery(['address1'])],
      ['lineItems', lineItemConnectionQuery(['title', ['customAttributes', customAttributeQuery(['value'])]])]]);
    const input = {
      lineItems: [
        {variantId: 'gid://shopify/ProductVariant/1', quantity: 5}
      ]
    };
    const query = client.graphQLClient.mutation((root) => {
      root.add('checkoutCreate', {args: {input}}, (checkoutCreate) => {
        customQuery(checkoutCreate, 'checkout');
      });
    });

    const queryString = `mutation {
      checkoutCreate (input: {lineItems: [{variantId: "gid://shopify/ProductVariant/1" quantity: 5}]}) {
        checkout {
          id
          createdAt
          shippingLine {
            price
          }
          shippingAddress {
            address1
          }
          lineItems (first: 250) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                title
                customAttributes {
                  value
                }
              }
            }
          }
        }
      }
    }`;

    assert.deepEqual(tokens(query.toString()), tokens(queryString));
  });
});

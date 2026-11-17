const productService = require("./product.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success, fail } = require("../../utils/apiResponse");
const redis = require("../../config/redis");

const getCategories = asyncHandler(async (req, res) => {
  const result = await productService.listCategories(req.query);
  return success(res, {
    message: "Categories fetched",
    data: {
      categories: result.data,
      meta: result.pagination,
    },
  });
});

// const getProducts = asyncHandler(async (req, res) => {
//   const result = await productService.listProducts(req.query, {
//     restrictedOnly: false,
//   });

//   let categoryName = null;
//   if (req.query.category_id) {
//     const match = result.data[0];
//     categoryName = match?.category_name || null;
//   }

//   return success(res, {
//     message: "Products fetched",
//     data: {
//       products: result.data,
//       meta: result.pagination,
//       category_name: categoryName,
//     },
//   });
// });

const getProducts = asyncHandler(async (req, res) => {
  // 1. Generate cache key based on query parameters
  const cacheKey = `products:${JSON.stringify(req.query)}`;

  const ttl = Number(process.env.REDIS_CACHE_TTL_SECONDS || 60);

  // 2. Check Redis cache
  const cachedProducts = await redis.get(cacheKey);

  if (cachedProducts) {
    return success(res, {
      message: "Products fetched from cache",
      data: cachedProducts,
    });
  }

  // 3. Fetch products using existing service
  const result = await productService.listProducts(req.query, {
    restrictedOnly: false,
  });

  let categoryName = null;

  if (req.query.category_id) {
    const match = result.data[0];
    categoryName = match?.category_name || null;
  }

  // 4. Prepare response data
  const responseData = {
    products: result.data,
    meta: result.pagination,
    category_name: categoryName,
  };

  // 5. Save response data in Redis
  await redis.set(cacheKey, responseData, {
    ex: ttl,
  });

  // 6. Return response
  return success(res, {
    message: "Products fetched",
    data: responseData,
  });
});
const getRestrictedProducts = asyncHandler(async (req, res) => {
  if (!req.user?.isRestricted) {
    return fail(res, {
      statusCode: 403,
      message: "Age verification required",
    });
  }

  const result = await productService.listProducts(req.query, {
    restrictedOnly: true,
  });

  return success(res, {
    message: "Restricted products fetched",
    data: {
      products: result.data,
      meta: result.pagination,
    },
  });
});

const searchProducts = asyncHandler(async (req, res) => {
  const result = await productService.searchProducts(req.query);
  return success(res, {
    message: "Search results",
    data: {
      products: result.products,
      event: result.events,
    },
  });
});

const getProductDetails = asyncHandler(async (req, res) => {
  const data = await productService.getProductBySlug(req.params.slug);
  return success(res, {
    message: "Product details",
    data: {
      ...data,
      meta: {
        meta_title: data.title,
        meta_description: data.description || data.introduction,
      },
    },
  });
});

const getProductBanner = asyncHandler(async (_req, res) => {
  const result = await productService.getPageContent("product-page");
  return success(res, {
    message: "Product page",
    data: result.data || { productPage: null },
  });
});

const getRestrictedBanner = asyncHandler(async (_req, res) => {
  const result = await productService.getPageContent("restricted-product-page");
  return success(res, {
    message: "Restricted product page",
    data: result.data || { productPage: null },
  });
});

// Sitemap expects a raw string[] (not the usual success envelope).
const getProductSlugs = asyncHandler(async (_req, res) => {
  const slugs = await productService.listProductSlugs();
  return res.status(200).json(slugs);
});

module.exports = {
  getCategories,
  getProducts,
  getRestrictedProducts,
  searchProducts,
  getProductDetails,
  getProductBanner,
  getRestrictedBanner,
  getProductSlugs,
};

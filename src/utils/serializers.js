function decimalToNumber(value) {
  if (value == null) return null;
  return Number(value);
}

function mapUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    date_of_birth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    gender: user.gender,
    is_restricted: user.isRestricted,
    is_verified: user.isVerified,
  };
}

function mapCategory(category) {
  return {
    id: category.id,
    title: category.title,
    slug: category.slug,
    image: category.image,
  };
}

function mapAvailability(value) {
  return String(value).replace(/_/g, "-");
}

function mapProductListItem(product) {
  return {
    id: product.id,
    title: product.title,
    sub: product.sub,
    thumbnail_web: product.thumbnailWeb,
    thumbnail_mobile: product.thumbnailMobile,
    price: decimalToNumber(product.price),
    availability: mapAvailability(product.availability),
    banner_web: product.bannerWeb,
    description: product.description,
    category_name: product.category?.title || null,
    slug: product.slug,
    is_restricted: product.isRestricted,
  };
}

function mapProductDetails(product) {
  return {
    id: product.id,
    title: product.title,
    price: decimalToNumber(product.price),
    quantity: product.quantity,
    availability: mapAvailability(product.availability),
    thumbnail_web: product.thumbnailWeb,
    thumbnail_mobile: product.thumbnailMobile,
    is_stock: product.isStock,
    introduction: product.introduction,
    product_use: product.productUse,
    weight: product.weight,
    vents: product.vents,
    feature: product.feature,
    mips: product.mips,
    material: product.material,
    technology: product.technology,
    certification: product.certification,
    other_description: product.otherDescription,
    product_images: (product.images || []).map((img) => ({
      id: img.id,
      url: img.url,
    })),
    related_products: (product.related || []).map(mapProductDetails),
    category_name: product.category?.title || null,
    category: product.category
      ? { id: product.category.id, title: product.category.title }
      : null,
    created_at: product.createdAt,
    is_restricted: product.isRestricted,
    slug: product.slug,
    banner_web: product.bannerWeb,
    description: product.description,
  };
}

function mapCartItem(item) {
  if (item.itemType === "product" && item.product) {
    const unit = decimalToNumber(item.product.price) || 0;
    return {
      id: item.id,
      item_id: item.productId,
      item_type: "product",
      item_title: item.product.title,
      item_image: item.product.thumbnailWeb,
      quantity: item.quantity,
      unit_price: unit,
      totalPrice: unit * item.quantity,
      slug: item.product.slug,
      category_name: item.product.category?.title || null,
    };
  }

  if (item.itemType === "ticket" && item.ticket) {
    const unit = decimalToNumber(item.ticket.price) || 0;
    return {
      id: item.id,
      item_id: item.ticketId,
      item_type: "ticket",
      item_title: item.ticket.title,
      item_image: item.ticket.imageUrl,
      quantity: item.quantity,
      unit_price: unit,
      totalPrice: unit * item.quantity,
      event_id: item.ticket.eventId,
    };
  }

  return {
    id: item.id,
    item_type: item.itemType,
    quantity: item.quantity,
    totalPrice: 0,
  };
}

function mapAddress(address) {
  if (!address) return null;
  return {
    id: address.id,
    user_id: address.userId,
    email: address.email,
    phone: address.phone,
    first_name: address.firstName,
    last_name: address.lastName,
    country: address.country,
    address: address.address,
    additional_info: address.additionalInfo,
    town: address.town,
    city: address.city,
    post_code: address.postCode,
  };
}

function mapOrder(order) {
  return {
    order_no: order.orderNo,
    grand_total_price: decimalToNumber(order.grandTotalPrice),
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    order_items: (order.items || []).map((item) => ({
      id: item.id,
      order_id: item.orderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: String(item.unitPrice),
      total_price: String(item.totalPrice),
      discount_price: String(item.discountPrice),
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      product_name: item.productName,
      category_id: item.categoryId,
      category_name: item.categoryName,
      image: item.image,
    })),
  };
}

function mapEventListItem(event) {
  const banner = {
    web_url: event.bannerWeb,
    mobile_url: event.bannerMobile,
  };

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    date: event.date?.toISOString?.().slice(0, 10) || event.date,
    start_time: event.startTime,
    end_time: event.endTime,
    location: event.location,
    banner,
    // Home carousel reads thumbnail.*; keep banner for typed clients.
    thumbnail: banner,
    event_category_id: event.eventCategoryId,
    event_category_title: event.eventCategory?.title || null,
    event_category_slug: event.eventCategory?.slug || null,
  };
}

function mapEventDetails(event) {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    date: event.date?.toISOString?.().slice(0, 10) || event.date,
    time: event.startTime,
    endTime: event.endTime,
    location: event.location,
    media: event.mediaUrl || event.bannerWeb,
    url: event.mediaUrl,
    mobileImage: event.bannerMobile,
    webImage: event.bannerWeb,
    stages: event.stages || [],
    tickets: (event.tickets || []).map((ticket) => ({
      id: ticket.id,
      event_id: ticket.eventId,
      title: ticket.title,
      description: ticket.description,
      price: String(ticket.price),
      quantity: ticket.quantity,
      image_url: ticket.imageUrl,
    })),
    products: [],
  };
}

module.exports = {
  decimalToNumber,
  mapUser,
  mapCategory,
  mapProductListItem,
  mapProductDetails,
  mapCartItem,
  mapAddress,
  mapOrder,
  mapEventListItem,
  mapEventDetails,
};

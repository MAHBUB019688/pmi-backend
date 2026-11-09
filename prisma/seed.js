const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PLACEHOLDER = "/imagePlaceHolder.webp";

async function main() {
  // ── Categories ──────────────────────────────────────────────────────────
  const apparel = await prisma.category.upsert({
    where: { slug: "apparel" },
    update: {},
    create: {
      title: "Apparel",
      slug: "apparel",
      image: PLACEHOLDER,
      sortOrder: 1,
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      title: "Accessories",
      slug: "accessories",
      image: PLACEHOLDER,
      sortOrder: 2,
    },
  });

  const footwear = await prisma.category.upsert({
    where: { slug: "footwear" },
    update: {},
    create: {
      title: "Footwear",
      slug: "footwear",
      image: PLACEHOLDER,
      sortOrder: 3,
    },
  });

  // ── Products ────────────────────────────────────────────────────────────
  const helmet = await prisma.product.upsert({
    where: { slug: "carpe-diem-helmet" },
    update: {},
    create: {
      categoryId: accessories.id,
      title: "Carpe Diem Helmet",
      slug: "carpe-diem-helmet",
      sub: "MIPS certified",
      price: 12990,
      oldPrice: 14990,
      availability: "in_stock",
      isStock: true,
      quantity: 50,
      thumbnailWeb: PLACEHOLDER,
      thumbnailMobile: PLACEHOLDER,
      bannerWeb: PLACEHOLDER,
      description: "Premium lifestyle helmet built for everyday rides.",
      introduction: "Designed for comfort and style.",
      feature: "Lightweight shell, premium padding",
      material: "Polycarbonate",
      technology: "MIPS",
      certification: "CE",
      images: {
        create: [
          { url: PLACEHOLDER, sortOrder: 1 },
          { url: PLACEHOLDER, sortOrder: 2 },
        ],
      },
    },
  });

  const tee = await prisma.product.upsert({
    where: { slug: "carpe-diem-tee" },
    update: {},
    create: {
      categoryId: apparel.id,
      title: "Carpe Diem Tee",
      slug: "carpe-diem-tee",
      sub: "Everyday essential",
      price: 2490,
      availability: "in_stock",
      isStock: true,
      quantity: 100,
      thumbnailWeb: PLACEHOLDER,
      thumbnailMobile: PLACEHOLDER,
      bannerWeb: PLACEHOLDER,
      description: "Soft cotton tee with Carpe Diem branding.",
      images: {
        create: [{ url: PLACEHOLDER, sortOrder: 1 }],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "restricted-drop" },
    update: {},
    create: {
      categoryId: apparel.id,
      title: "Restricted Drop",
      slug: "restricted-drop",
      sub: "Adults only",
      price: 4990,
      availability: "in_stock",
      isStock: true,
      isRestricted: true,
      quantity: 20,
      thumbnailWeb: PLACEHOLDER,
      thumbnailMobile: PLACEHOLDER,
      bannerWeb: PLACEHOLDER,
      description: "Age-gated exclusive drop.",
      images: {
        create: [{ url: PLACEHOLDER, sortOrder: 1 }],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "carpe-diem-sneakers" },
    update: {},
    create: {
      categoryId: footwear.id,
      title: "Carpe Diem Sneakers",
      slug: "carpe-diem-sneakers",
      sub: "Limited pre-order",
      price: 8990,
      oldPrice: 9990,
      availability: "pre_order",
      isStock: true,
      quantity: 30,
      thumbnailWeb: PLACEHOLDER,
      thumbnailMobile: PLACEHOLDER,
      bannerWeb: PLACEHOLDER,
      description: "Street-ready sneakers dropping soon.",
      images: {
        create: [
          { url: PLACEHOLDER, sortOrder: 1 },
          { url: PLACEHOLDER, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "carpe-diem-cap" },
    update: {},
    create: {
      categoryId: accessories.id,
      title: "Carpe Diem Cap",
      slug: "carpe-diem-cap",
      sub: "Sold out",
      price: 1490,
      availability: "out_of_stock",
      isStock: false,
      quantity: 0,
      thumbnailWeb: PLACEHOLDER,
      thumbnailMobile: PLACEHOLDER,
      bannerWeb: PLACEHOLDER,
      description: "Classic embroidered cap — currently out of stock.",
      images: {
        create: [{ url: PLACEHOLDER, sortOrder: 1 }],
      },
    },
  });

  // Ensure tee has at least one ProductImage when it already existed without nested create
  const teeImageCount = await prisma.productImage.count({
    where: { productId: tee.id },
  });
  if (teeImageCount === 0) {
    await prisma.productImage.create({
      data: { productId: tee.id, url: PLACEHOLDER, sortOrder: 1 },
    });
  }

  // ── Event category + event + tickets ────────────────────────────────────
  const nightlife = await prisma.eventCategory.upsert({
    where: { slug: "nightlife" },
    update: {},
    create: { title: "Nightlife", slug: "nightlife" },
  });

  const festivalDay = await prisma.eventCategory.upsert({
    where: { slug: "festival" },
    update: {},
    create: { title: "Festival", slug: "festival" },
  });

  const festival = await prisma.event.upsert({
    where: { slug: "carpe-diem-night" },
    update: {},
    create: {
      eventCategoryId: nightlife.id,
      title: "Carpe Diem Night",
      slug: "carpe-diem-night",
      description: "An unforgettable night of music and culture.",
      date: new Date("2026-12-20"),
      startTime: "06:00 PM",
      endTime: "02:00 AM",
      location: "Dhaka",
      bannerWeb: PLACEHOLDER,
      bannerMobile: PLACEHOLDER,
      mediaUrl: PLACEHOLDER,
      isUpcoming: true,
      stages: [
        {
          title: "Main Stage",
          time_lines: [
            { time: "07:00 PM", title: "Opening Set" },
            { time: "09:00 PM", title: "Headliner" },
          ],
        },
      ],
      tickets: {
        create: [
          {
            title: "General Admission",
            description: "Standing access",
            price: 1500,
            quantity: 200,
            imageUrl: PLACEHOLDER,
          },
          {
            title: "VIP",
            description: "VIP lounge access",
            price: 4500,
            quantity: 50,
            imageUrl: PLACEHOLDER,
          },
        ],
      },
    },
  });

  await prisma.event.upsert({
    where: { slug: "summer-sounds" },
    update: {},
    create: {
      eventCategoryId: festivalDay.id,
      title: "Summer Sounds",
      slug: "summer-sounds",
      description: "Daytime outdoor festival with live acts.",
      date: new Date("2027-03-15"),
      startTime: "12:00 PM",
      endTime: "08:00 PM",
      location: "Chittagong",
      bannerWeb: PLACEHOLDER,
      bannerMobile: PLACEHOLDER,
      mediaUrl: PLACEHOLDER,
      isUpcoming: true,
      stages: [
        {
          title: "Sunset Stage",
          time_lines: [{ time: "04:00 PM", title: "Live Set" }],
        },
      ],
      tickets: {
        create: [
          {
            title: "Day Pass",
            description: "Full day access",
            price: 2000,
            quantity: 500,
            imageUrl: PLACEHOLDER,
          },
        ],
      },
    },
  });

  let tickets = await prisma.ticket.findMany({
    where: { eventId: festival.id },
    orderBy: { price: "asc" },
  });

  if (tickets.length === 0) {
    await prisma.ticket.createMany({
      data: [
        {
          eventId: festival.id,
          title: "General Admission",
          description: "Standing access",
          price: 1500,
          quantity: 200,
          imageUrl: PLACEHOLDER,
        },
        {
          eventId: festival.id,
          title: "VIP",
          description: "VIP lounge access",
          price: 4500,
          quantity: 50,
          imageUrl: PLACEHOLDER,
        },
      ],
    });
    tickets = await prisma.ticket.findMany({
      where: { eventId: festival.id },
      orderBy: { price: "asc" },
    });
  }

  const generalTicket = tickets[0];

  // ── Gallery ─────────────────────────────────────────────────────────────
  const galleryCount = await prisma.gallery.count();
  if (galleryCount < 4) {
    await prisma.gallery.createMany({
      data: [
        { eventCategoryId: nightlife.id, image: PLACEHOLDER, sortOrder: 1 },
        { eventCategoryId: nightlife.id, image: PLACEHOLDER, sortOrder: 2 },
        { eventCategoryId: festivalDay.id, image: PLACEHOLDER, sortOrder: 3 },
        { eventCategoryId: festivalDay.id, image: PLACEHOLDER, sortOrder: 4 },
      ],
      skipDuplicates: true,
    });
  }

  // ── Stores ──────────────────────────────────────────────────────────────
  const storeCount = await prisma.store.count();
  if (storeCount === 0) {
    await prisma.store.createMany({
      data: [
        {
          name: "Carpe Diem Flagship",
          address: "Gulshan, Dhaka",
          description: "Flagship lifestyle store",
          latitude: 23.7808875,
          longitude: 90.4166632,
        },
        {
          name: "Carpe Diem Banani",
          address: "Banani, Dhaka",
          description: "Boutique store",
          latitude: 23.7937,
          longitude: 90.4066,
        },
      ],
    });
  } else if (storeCount === 1) {
    await prisma.store.create({
      data: {
        name: "Carpe Diem Banani",
        address: "Banani, Dhaka",
        description: "Boutique store",
        latitude: 23.7937,
        longitude: 90.4066,
      },
    });
  }

  // ── Terms ───────────────────────────────────────────────────────────────
  let termCategory = await prisma.termCategory.findFirst({
    where: { title: "General" },
    include: { terms: true },
  });

  if (!termCategory) {
    termCategory = await prisma.termCategory.create({
      data: {
        title: "General",
        subtitle: "Basic terms",
        iconImageUrl: PLACEHOLDER,
        sortOrder: 1,
        terms: {
          create: [
            {
              title: "Acceptance",
              acknowledgment: "I agree",
              description: "By using this site you accept our terms.",
            },
            {
              title: "Purchases",
              acknowledgment: "I understand",
              description: "All sales are subject to stock availability.",
            },
          ],
        },
      },
      include: { terms: true },
    });
  } else if (termCategory.terms.length < 2) {
    await prisma.term.create({
      data: {
        termCategoryId: termCategory.id,
        title: "Purchases",
        acknowledgment: "I understand",
        description: "All sales are subject to stock availability.",
      },
    });
  }

  const shippingTerms = await prisma.termCategory.findFirst({
    where: { title: "Shipping" },
  });
  if (!shippingTerms) {
    await prisma.termCategory.create({
      data: {
        title: "Shipping",
        subtitle: "Delivery policy",
        iconImageUrl: PLACEHOLDER,
        sortOrder: 2,
        terms: {
          create: [
            {
              title: "Delivery window",
              acknowledgment: null,
              description: "Orders usually arrive within 3–5 business days.",
            },
          ],
        },
      },
    });
  }

  // ── Compliance ──────────────────────────────────────────────────────────
  await prisma.complianceMeta.upsert({
    where: { id: 1 },
    update: {
      mainSubtitleDescription: "Our commitment to responsible commerce.",
    },
    create: {
      id: 1,
      mainSubtitleDescription: "Our commitment to responsible commerce.",
    },
  });

  let complianceCategory = await prisma.complianceCategory.findFirst({
    where: { title: "Legal" },
    include: { compliances: true },
  });

  if (!complianceCategory) {
    complianceCategory = await prisma.complianceCategory.create({
      data: {
        title: "Legal",
        subtitle: "Policies",
        sortOrder: 1,
        compliances: {
          create: [
            {
              title: "Privacy",
              descriptionTitle: "Your data",
              description: "We protect customer data with care.",
            },
            {
              title: "Cookies",
              subtitle: "Tracking",
              descriptionTitle: "Cookie use",
              description: "We use cookies to improve site experience.",
            },
          ],
        },
      },
      include: { compliances: true },
    });
  } else if (complianceCategory.compliances.length < 2) {
    await prisma.compliance.create({
      data: {
        complianceCategoryId: complianceCategory.id,
        title: "Cookies",
        subtitle: "Tracking",
        descriptionTitle: "Cookie use",
        description: "We use cookies to improve site experience.",
      },
    });
  }

  const contactCount = await prisma.complianceContact.count();
  if (contactCount === 0) {
    await prisma.complianceContact.createMany({
      data: [
        {
          title: "Support",
          subtitle: "Help desk",
          email: "support@carpediem.example",
          phone: "+8801700000000",
        },
        {
          title: "Legal",
          subtitle: "Compliance office",
          email: "legal@carpediem.example",
          phone: "+8801700000001",
        },
      ],
    });
  }

  // ── Page contents ───────────────────────────────────────────────────────
  await prisma.pageContent.upsert({
    where: { key: "home" },
    update: {},
    create: {
      key: "home",
      title: "Home",
      data: {
        home: {
          heroBanners: [
            {
              id: 1,
              header: "CARPE DIEM",
              title: "Live the moment",
              subtitle: "Fashion, events, and lifestyle",
              buttonText1: "Shop Now",
              buttonUrl1: "/product",
              buttonText2: "Events",
              buttonUrl2: "/event",
              image: PLACEHOLDER,
            },
          ],
          hero_banner_video_media: null,
          hero_banner_video: null,
          events: {
            title: "Upcoming Events",
            subtitle: "Don't miss out",
          },
          trendingProducts: {
            title: "Trending",
            subtitle: "Popular picks",
            images: [PLACEHOLDER],
          },
          lookBook: {
            header: "Lookbook",
            title: "Season Edit",
            subtitle: "Styled for now",
            data: [
              {
                id: apparel.id,
                header: null,
                title: "Apparel",
                subtitle: "Fresh fits",
                buttonText1: null,
                buttonUrl1: null,
                buttonText2: null,
                buttonUrl2: null,
                image: PLACEHOLDER,
              },
            ],
          },
          zone: {
            header: "Zone",
            title: "Enter the zone",
            buttonText: "Explore",
            buttonUrl: "/product",
            image: PLACEHOLDER,
          },
          gallery: {
            header: "Gallery",
            title: "Moments",
          },
          explore: {
            title: "Explore",
          },
          weAre: {
            title: "Who we are",
          },
        },
      },
    },
  });

  await prisma.pageContent.upsert({
    where: { key: "product-page" },
    update: {},
    create: {
      key: "product-page",
      title: "Product Page",
      data: {
        productPage: {
          meta: {
            title: "Products",
            description: "Shop Carpe Diem collections",
            keywords: "products, carpe diem",
            og_image: "/og.png",
          },
          collection: {
            title: "Collections",
            subtitle: "Browse by category",
          },
          heroBanners: [
            {
              id: 1,
              header: null,
              title: "New Arrivals",
              subtitle: "Shop the latest",
              buttonText1: null,
              buttonUrl1: null,
              buttonText2: null,
              buttonUrl2: null,
              image: PLACEHOLDER,
            },
          ],
        },
      },
    },
  });

  await prisma.pageContent.upsert({
    where: { key: "restricted-product-page" },
    update: {},
    create: {
      key: "restricted-product-page",
      title: "Restricted Product Page",
      data: {
        productPage: {
          meta: {
            title: "Restricted",
            description: "Age gated products",
          },
          heroBanners: [
            {
              id: 1,
              header: null,
              title: "Restricted Zone",
              subtitle: "18+ only",
              buttonText1: null,
              buttonUrl1: null,
              buttonText2: null,
              buttonUrl2: null,
              image: PLACEHOLDER,
            },
          ],
        },
      },
    },
  });

  await prisma.pageContent.upsert({
    where: { key: "galleries-page" },
    update: {},
    create: {
      key: "galleries-page",
      title: "Galleries",
      data: {
        gallery_page: {
          title: "Gallery",
          description: "Captured moments from our events",
          meta_title: "Gallery",
          meta_description: "Event gallery",
          meta_keywords: "gallery, events",
        },
      },
    },
  });

  // ── Users ───────────────────────────────────────────────────────────────
  const shopper = await prisma.user.upsert({
    where: { phone: "01711111111" },
    update: {
      name: "Demo Shopper",
      email: "shopper@carpediem.example",
      isVerified: true,
      isRestricted: false,
    },
    create: {
      name: "Demo Shopper",
      email: "shopper@carpediem.example",
      phone: "01711111111",
      dateOfBirth: new Date("1994-05-20"),
      gender: "male",
      isVerified: true,
      isRestricted: false,
    },
  });

  await prisma.user.upsert({
    where: { phone: "01722222222" },
    update: {
      name: "Restricted Shopper",
      email: "restricted@carpediem.example",
      isVerified: true,
      isRestricted: true,
    },
    create: {
      name: "Restricted Shopper",
      email: "restricted@carpediem.example",
      phone: "01722222222",
      dateOfBirth: new Date("1990-08-12"),
      gender: "female",
      isVerified: true,
      isRestricted: true,
    },
  });

  // ── OTP codes (demo / expired) ──────────────────────────────────────────
  const otpCount = await prisma.otpCode.count({
    where: { phone: shopper.phone, purpose: "login" },
  });
  if (otpCount === 0) {
    await prisma.otpCode.createMany({
      data: [
        {
          userId: shopper.id,
          phone: shopper.phone,
          code: "123456",
          purpose: "login",
          expiresAt: new Date(Date.now() - 60 * 60 * 1000),
          consumed: true,
          payload: null,
        },
        {
          phone: "01733333333",
          code: "654321",
          purpose: "register",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          consumed: false,
          payload: {
            name: "Pending User",
            email: "pending@carpediem.example",
            phone: "01733333333",
            date_of_birth: "1998-01-01",
            gender: "other",
          },
        },
      ],
    });
  }

  // ── Customer address ────────────────────────────────────────────────────
  await prisma.customerAddress.upsert({
    where: { userId: shopper.id },
    update: {
      email: shopper.email,
      phone: shopper.phone,
      firstName: "Demo",
      lastName: "Shopper",
      country: "Bangladesh",
      address: "House 12, Road 5, Gulshan",
      additionalInfo: "Near the flagship store",
      town: "Gulshan",
      city: "Dhaka",
      postCode: "1212",
    },
    create: {
      userId: shopper.id,
      email: shopper.email,
      phone: shopper.phone,
      firstName: "Demo",
      lastName: "Shopper",
      country: "Bangladesh",
      address: "House 12, Road 5, Gulshan",
      additionalInfo: "Near the flagship store",
      town: "Gulshan",
      city: "Dhaka",
      postCode: "1212",
    },
  });

  // ── Cart + cart items ───────────────────────────────────────────────────
  const cart = await prisma.cart.upsert({
    where: { userId: shopper.id },
    update: {},
    create: { userId: shopper.id },
  });

  const existingProductCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      itemType: "product",
      productId: helmet.id,
    },
  });
  if (!existingProductCartItem) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemType: "product",
        productId: helmet.id,
        quantity: 1,
      },
    });
  }

  if (generalTicket) {
    const existingTicketCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        itemType: "ticket",
        ticketId: generalTicket.id,
      },
    });
    if (!existingTicketCartItem) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemType: "ticket",
          ticketId: generalTicket.id,
          quantity: 2,
        },
      });
    }
  }

  // ── Order + order items ─────────────────────────────────────────────────
  const existingOrder = await prisma.order.findUnique({
    where: { orderNo: "PMI-SEED-0001" },
  });

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        userId: shopper.id,
        orderNo: "PMI-SEED-0001",
        status: "paid",
        paymentMethod: "cash",
        grandTotalPrice: 15480,
        items: {
          create: [
            {
              itemType: "product",
              productId: tee.id,
              productName: tee.title,
              categoryId: apparel.id,
              categoryName: apparel.title,
              image: tee.thumbnailWeb || PLACEHOLDER,
              quantity: 1,
              unitPrice: 2490,
              totalPrice: 2490,
              discountPrice: 0,
            },
            {
              itemType: "product",
              productId: helmet.id,
              productName: helmet.title,
              categoryId: accessories.id,
              categoryName: accessories.title,
              image: helmet.thumbnailWeb || PLACEHOLDER,
              quantity: 1,
              unitPrice: 12990,
              totalPrice: 12990,
              discountPrice: 0,
            },
          ],
        },
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    otpCodes: await prisma.otpCode.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    productImages: await prisma.productImage.count(),
    pageContents: await prisma.pageContent.count(),
    eventCategories: await prisma.eventCategory.count(),
    events: await prisma.event.count(),
    tickets: await prisma.ticket.count(),
    carts: await prisma.cart.count(),
    cartItems: await prisma.cartItem.count(),
    customerAddresses: await prisma.customerAddress.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    stores: await prisma.store.count(),
    galleries: await prisma.gallery.count(),
    termCategories: await prisma.termCategory.count(),
    terms: await prisma.term.count(),
    complianceCategories: await prisma.complianceCategory.count(),
    compliances: await prisma.compliance.count(),
    complianceContacts: await prisma.complianceContact.count(),
    complianceMeta: await prisma.complianceMeta.count(),
  };

  console.log("Seed complete. Row counts:");
  console.table(counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

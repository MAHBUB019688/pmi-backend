const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Categories
  const apparel = await prisma.category.upsert({
    where: { slug: "apparel" },
    update: {},
    create: {
      title: "Apparel",
      slug: "apparel",
      image: "/imagePlaceHolder.webp",
      sortOrder: 1,
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      title: "Accessories",
      slug: "accessories",
      image: "/imagePlaceHolder.webp",
      sortOrder: 2,
    },
  });

  // Products
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
      thumbnailWeb: "/imagePlaceHolder.webp",
      thumbnailMobile: "/imagePlaceHolder.webp",
      bannerWeb: "/imagePlaceHolder.webp",
      description: "Premium lifestyle helmet built for everyday rides.",
      introduction: "Designed for comfort and style.",
      feature: "Lightweight shell, premium padding",
      material: "Polycarbonate",
      technology: "MIPS",
      certification: "CE",
      images: {
        create: [
          { url: "/imagePlaceHolder.webp", sortOrder: 1 },
          { url: "/imagePlaceHolder.webp", sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.upsert({
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
      thumbnailWeb: "/imagePlaceHolder.webp",
      thumbnailMobile: "/imagePlaceHolder.webp",
      bannerWeb: "/imagePlaceHolder.webp",
      description: "Soft cotton tee with Carpe Diem branding.",
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
      thumbnailWeb: "/imagePlaceHolder.webp",
      thumbnailMobile: "/imagePlaceHolder.webp",
      bannerWeb: "/imagePlaceHolder.webp",
      description: "Age-gated exclusive drop.",
    },
  });

  // Event category + event + tickets
  const nightlife = await prisma.eventCategory.upsert({
    where: { slug: "nightlife" },
    update: {},
    create: { title: "Nightlife", slug: "nightlife" },
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
      bannerWeb: "/imagePlaceHolder.webp",
      bannerMobile: "/imagePlaceHolder.webp",
      mediaUrl: "/imagePlaceHolder.webp",
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
            imageUrl: "/imagePlaceHolder.webp",
          },
          {
            title: "VIP",
            description: "VIP lounge access",
            price: 4500,
            quantity: 50,
            imageUrl: "/imagePlaceHolder.webp",
          },
        ],
      },
    },
  });

  // Gallery
  const galleryCount = await prisma.gallery.count();
  if (galleryCount === 0) {
    await prisma.gallery.createMany({
      data: [
        {
          eventCategoryId: nightlife.id,
          image: "/imagePlaceHolder.webp",
          sortOrder: 1,
        },
        {
          eventCategoryId: nightlife.id,
          image: "/imagePlaceHolder.webp",
          sortOrder: 2,
        },
      ],
    });
  }

  // Stores
  const storeCount = await prisma.store.count();
  if (storeCount === 0) {
    await prisma.store.create({
      data: {
        name: "Carpe Diem Flagship",
        address: "Gulshan, Dhaka",
        description: "Flagship lifestyle store",
        latitude: 23.7808875,
        longitude: 90.4166632,
      },
    });
  }

  // Terms
  const termCatCount = await prisma.termCategory.count();
  if (termCatCount === 0) {
    await prisma.termCategory.create({
      data: {
        title: "General",
        subtitle: "Basic terms",
        iconImageUrl: "/imagePlaceHolder.webp",
        terms: {
          create: [
            {
              title: "Acceptance",
              acknowledgment: "I agree",
              description: "By using this site you accept our terms.",
            },
          ],
        },
      },
    });
  }

  // Compliance
  const complianceCount = await prisma.complianceCategory.count();
  if (complianceCount === 0) {
    await prisma.complianceMeta.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        mainSubtitleDescription: "Our commitment to responsible commerce.",
      },
    });

    await prisma.complianceCategory.create({
      data: {
        title: "Legal",
        subtitle: "Policies",
        compliances: {
          create: [
            {
              title: "Privacy",
              descriptionTitle: "Your data",
              description: "We protect customer data with care.",
            },
          ],
        },
      },
    });

    await prisma.complianceContact.create({
      data: {
        title: "Support",
        subtitle: "Help desk",
        email: "support@carpediem.example",
        phone: "+8801700000000",
      },
    });
  }

  // Page contents matching frontend shapes
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
              image: "/imagePlaceHolder.webp",
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
            images: ["/imagePlaceHolder.webp"],
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
                image: "/imagePlaceHolder.webp",
              },
            ],
          },
          zone: {
            header: "Zone",
            title: "Enter the zone",
            buttonText: "Explore",
            buttonUrl: "/product",
            image: "/imagePlaceHolder.webp",
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
              image: "/imagePlaceHolder.webp",
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
              image: "/imagePlaceHolder.webp",
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

  console.log("Seed complete:", {
    helmet: helmet.slug,
    festival: festival.slug,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { defineCollection, z } from 'astro:content';

const galleryItemSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

const homePhotoSchema = z.object({
  src: z.string().optional(),
  altIt: z.string().optional(),
  altEn: z.string().optional(),
  desktopX: z.number().min(0).max(100).optional(),
  desktopY: z.number().min(0).max(100).optional(),
  mobileX: z.number().min(0).max(100).optional(),
  mobileY: z.number().min(0).max(100).optional(),
});

const commonSchema = z.object({
  homeHero: z.object({
    matrimonio: homePhotoSchema.optional(),
    macbett: homePhotoSchema.optional(),
    laboratorio: homePhotoSchema.optional(),
    accessibilita: homePhotoSchema.optional(),
    matrimonioFinale: homePhotoSchema.optional(),
  }).optional(),
  homePhotos: z.object({
    shows: z.string().optional(),
    lab: z.string().optional(),
    research: z.string().optional(),
    group: z.string().optional(),
  }).optional(),
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  thumbnail: z.string().optional(),
  templateKey: z.string().optional(),
  image: z.string().optional(),
  featuredimage: z.string().optional(),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  number: z.number().optional(),
  pagetype: z.array(z.string()).optional(),
  folder: z.string().optional(),
  gallery: z.array(galleryItemSchema).optional(),
  locale: z.enum(['it', 'en']).optional(),
  translationKey: z.string().optional(),

  bioKicker: z.string().optional(),
  bioHeading: z.string().optional(),
  bioLead: z.string().optional(),
  bioOpeningImage: z.string().optional(),
  bioStoryIntro: z.string().optional(),
  bioProduction: z.string().optional(),
  bioTraining: z.string().optional(),
  bioPath: z.string().optional(),
  bioSceneImage: z.string().optional(),
  bioMembersHeading: z.string().optional(),
  bioPerformers: z.string().optional(),
  bioMusic: z.string().optional(),
  bioDance: z.string().optional(),
  bioLighting: z.string().optional(),
  bioPhotography: z.string().optional(),
  bioDirection: z.string().optional(),
});

const workSchema = commonSchema.extend({
  cmsStructured: z.boolean().optional(),
  stageImage: z.string().optional(),
  stageImageAlt: z.string().optional(),
  originalTitle: z.string().optional(),
  year: z.coerce.string().optional(),
  author: z.string().optional(),

  synopsis: z.string().optional(),

  credits: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),

  duration: z.string().optional(),
  thanks: z.string().optional(),

  trailer: z.object({
    title: z.string().optional(),
    url: z.string(),
  }).optional(),

  performances: z.array(z.object({
    date: z.string(),
    name: z.string(),
    url: z.string().optional(),
    details: z.string().optional(),
  })).optional(),

  press: z.array(z.object({
    author: z.string(),
    title: z.string(),
    publication: z.string().optional(),
    issue: z.string().optional(),
    date: z.string().optional(),
    page: z.string().optional(),
    url: z.string().optional(),
  })).optional(),

  materials: z.array(z.object({
    label: z.string(),
    kind: z.string().optional(),
    url: z.string(),
  })).optional(),

  photoAlbums: z.array(z.object({
    title: z.string(),
    meta: z.string().optional(),
    folder: z.string().optional(),
    cover: z.string().optional(),
    images: z.array(z.object({
      src: z.string(),
      caption: z.string().optional(),
    })).optional(),
  })).optional(),

  accessibility: z.string().optional(),
});

const news = defineCollection({ type: 'content', schema: commonSchema });
const work = defineCollection({ type: 'content', schema: workSchema });
const sold = defineCollection({ type: 'content', schema: commonSchema });
const pages = defineCollection({ type: 'content', schema: commonSchema });

export const collections = { news, work, sold, pages };

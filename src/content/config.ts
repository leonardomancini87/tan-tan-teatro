import { defineCollection, z } from 'astro:content';

const galleryItemSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

const commonSchema = z.object({
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
});

const workSchema = commonSchema.extend({
  cmsStructured: z.boolean().optional(),
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

  accessibility: z.string().optional(),
});

const news = defineCollection({ type: 'content', schema: commonSchema });
const work = defineCollection({ type: 'content', schema: workSchema });
const sold = defineCollection({ type: 'content', schema: commonSchema });
const pages = defineCollection({ type: 'content', schema: commonSchema });

export const collections = { news, work, sold, pages };

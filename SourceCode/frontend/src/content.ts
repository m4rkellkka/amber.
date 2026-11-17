/**
 * Hand-written site content that is not stored in the database.
 * Edit here: the "Recent work" tiles. Images live in public/work/.
 */
export interface Work {
  title: string
  /** Short line under the title: what it is and what it is built with. */
  meta: string
  image: string
  /** Describes the screenshot for screen readers. */
  alt: string
}

export const content: { recentWork: Work[] } = {
  recentWork: [
    {
      title: 'way to 11-11',
      meta: 'Game · TypeScript, three.js',
      image: '/work/game.jpg',
      alt: 'Two characters holding hands in lamp-lit grass by the swings, drawn entirely in ASCII characters',
    },
    {
      title: 'Farina Spa',
      meta: 'Website + booking · 3 languages',
      image: '/work/farina.jpg',
      alt: 'Farina Spa website: massage and spa rituals in the heart of Istanbul',
    },
    {
      title: 'Güven İlaçlama',
      meta: 'Business website · TR / EN',
      image: '/work/guven.jpg',
      alt: 'Güven İlaçlama pest control website with a green radar illustration',
    },
  ],
}

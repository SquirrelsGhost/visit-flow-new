import type { Metadata } from "next";

/**
 * Shape of the meta tag data each page translation must provide.
 * Stored inside the translation files so meta tags are localised too.
 */
export interface IMetaTags {
  url: string;
  title: string;
  description: string;
  imgUrl: string;
  tags: string[];
}

/**
 * MetaTagService
 *
 * Converts an IMetaTags object (coming from translations) into a
 * fully-formed Next.js Metadata object covering title, description,
 * keywords, Open Graph and Twitter card.
 *
 * Usage in a page:
 *
 *   export async function generateMetadata(): Promise<Metadata> {
 *     const t = await TranslationService.GetUserTranslations();
 *     return MetaTagService.CreateMetaTags(t.HomePage.MetaTags);
 *   }
 */
export class MetaTagService {
  static CreateMetaTags = (props: IMetaTags): Metadata => {
    return {
      title: props.title,
      description: props.description,
      keywords: props.tags,

      openGraph: {
        title: props.title,
        description: props.description,
        url: props.url,
        siteName: "Visit Flow",
        images: [
          {
            url: props.imgUrl,
            width: 1200,
            height: 630,
            alt: "Visit Flow",
          },
        ],
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: props.title,
        description: props.description,
        images: [props.imgUrl],
      },
    };
  };
}

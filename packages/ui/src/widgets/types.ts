/**
 * The base properties for all widgets.
 */
export interface BaseWidgetProps {
  /**
   * The unique identifier for the widget.
   * Used for anchor links.
   */
  id?: string;

  /**
   * Additional CSS classes to apply to the widget container.
   */
  class?: string;

  /**
   * Whether the widget is hidden.
   * @default false
   */
  hidden?: boolean;
}

/**
 * The properties for a call-to-action button.
 */
export interface Cta {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'link';
  icon?: string;
}

/**
 * The properties for the Hero widget.
 */
export interface HeroWidgetProps extends BaseWidgetProps {
  title: string;
  subtitle?: string;
  ctas?: Cta[];
  image?: {
    src: string;
    alt: string;
  };
}

/**
 * An item for the Features widget.
 */
export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

/**
 * The properties for the Features widget.
 */
export interface FeaturesWidgetProps extends BaseWidgetProps {
  items: FeatureItem[];
  layout?: 'grid' | 'list' | 'cards';
} 
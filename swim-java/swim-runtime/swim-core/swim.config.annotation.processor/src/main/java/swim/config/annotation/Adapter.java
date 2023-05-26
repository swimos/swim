package swim.config.annotation;

import swim.config.Configurable;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 *
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Adapter {
  /**
   * Configuration interface for the adapter.
   * @return
   */
  Class<? extends Configurable> configuration();

  /**
   * Display name for the adapter
   * @return
   */
  String displayName();

  String iconGalleryName() default "";

  String iconGalleryType() default "";

  String iconSmallName() default "";

  String iconSmallType() default "";

  String iconLargeName() default "";

  String iconLargeType() default "";
}

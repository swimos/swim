package processor;

import swim.config.annotation.Adapter;

/**
 * <p>This is the first paragraph of documentation. This should show up at the beginning of the documentation.</p>
 *
 * <p>This is the second paragraph of documentation. This should display similar to the last paragraph.</p>
 * <p class='code-java'>
 * // This should be rendered as a code sample in Java.
 * public class Foo {
 *   protected String bar;
 *   protected String baz;
 * }
 * </p>
 * <p>This is the third paragraph and should be rendered like the first two.</p>
 * <p class='code-recon'>
 * This is the last paragraph and it should be rendered as recon.
 * </p>
 */
@Adapter(
    configuration = ExampleConfig.class,
    displayName = "Example Adapter",
    iconGalleryName = "swim-marlin-logo-black.svg",
    iconGalleryType = "image/svg+xml",
    iconSmallName = "swim-marlin-logo-black.svg",
    iconSmallType = "image/svg+xml",
    iconLargeName = "swim-marlin-logo-black.svg",
    iconLargeType = "image/svg+xml"
)
public class ExampleAdapter {

}

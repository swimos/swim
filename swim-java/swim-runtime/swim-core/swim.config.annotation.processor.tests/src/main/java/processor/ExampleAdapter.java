package processor;

import swim.config.Adapter;

/**
 * This is an example adapter that is used to retrieve data from one system and write it to the swim runtime.
 *
 * <p>This is some additional information about this adapter that should show up in the documentation</p>
 * <p>This is some additional information about this adapter that should show up in the documentation</p>
 * <p>This is some additional information about this adapter that should show up in the documentation</p>
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

// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.spatial;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class GeoProjectionSpec {
  static final double MAX_LAT = Math.toDegrees(Math.atan(Math.sinh(Math.PI)));

  @Test
  public void testWGS84() {
    assertEquals(GeoProjection.wgs84().transformX(-180.0, -90.0), 0L);
    assertEquals(GeoProjection.wgs84().transformY(-180.0, -90.0), 0L);
    assertEquals(GeoProjection.wgs84().transformX(-181.0, -91.0), 0L);
    assertEquals(GeoProjection.wgs84().transformY(-181.0, -91.0), 0L);
    assertEquals(GeoProjection.wgs84().transformX(0.0, 0.0), 0x4000000000000000L);
    assertEquals(GeoProjection.wgs84().transformY(0.0, 0.0), 0x4000000000000000L);
    assertEquals(GeoProjection.wgs84().transformX(180.0, 90.0), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.wgs84().transformY(180.0, 90.0), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.wgs84().transformX(181.0, 91.0), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.wgs84().transformY(181.0, 91.0), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.wgs84().transformX(-121.895259, 37.333447), 0x14a8d299063d7900L);
    assertEquals(GeoProjection.wgs84().transformY(-121.895259, 37.333447), 0x5a8c58bbfa466c00L);
  }

  @Test
  public void testInverseWGS84() {
    assertEquals(GeoProjection.wgs84Inverse().transformX(0L, 0L), -180.0);
    assertEquals(GeoProjection.wgs84Inverse().transformY(0L, 0L), -90.0);
    assertEquals(GeoProjection.wgs84Inverse().transformX(0x4000000000000000L, 0x4000000000000000L), 0.0);
    assertEquals(GeoProjection.wgs84Inverse().transformY(0x4000000000000000L, 0x4000000000000000L), 0.0);
    assertEquals(GeoProjection.wgs84Inverse().transformX(0x7fffffffffffffffL, 0x7fffffffffffffffL), 180.0);
    assertEquals(GeoProjection.wgs84Inverse().transformY(0x7fffffffffffffffL, 0x7fffffffffffffffL), 90.0);
    assertEquals(GeoProjection.wgs84Inverse().transformX(0x14a8d299063d7900L, 0x5a8c58bbfa466c00L), -121.895259);
    assertEquals(GeoProjection.wgs84Inverse().transformY(0x14a8d299063d7900L, 0x5a8c58bbfa466c00L), 37.333447);
  }

  @Test(description = "fixme: fails", enabled = false)
  public void testSphericalMercator() {
    assertEquals(GeoProjection.sphericalMercator().transformX(-180.0, -90.0), 0L);
    assertEquals(GeoProjection.sphericalMercator().transformY(-180.0, -90.0), 0L);
    assertEquals(GeoProjection.sphericalMercator().transformY(-180.0, -85.05112878), 0L);
    assertEquals(GeoProjection.sphericalMercator().transformX(-181.0, -91.0), 0L);
    assertEquals(GeoProjection.sphericalMercator().transformY(-181.0, -91.0), 0L);
    assertEquals(GeoProjection.sphericalMercator().transformX(0.0, 0.0), 0x4000000000000000L);
    assertEquals(GeoProjection.sphericalMercator().transformY(0.0, 0.0), 0x4000000000000000L);
    assertEquals(GeoProjection.sphericalMercator().transformX(180.0, 90.0), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.sphericalMercator().transformY(180.0, 90.0), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.sphericalMercator().transformY(180.0, 85.05112878), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.sphericalMercator().transformX(181.0, 91.0), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.sphericalMercator().transformY(181.0, 91.0), 0x7fffffffffffffffL);
    assertEquals(GeoProjection.sphericalMercator().transformX(-121.895259, 37.333447), 0x14a8d299063d7800L);
    assertEquals(GeoProjection.sphericalMercator().transformY(-121.895259, 37.333447), 0x4e53cbe98b71c400L);
  }

  @Test
  public void testInverseSphericalMercator() {
    assertEquals(GeoProjection.sphericalMercatorInverse().transformX(0L, 0L), -180.0);
    assertEquals(GeoProjection.sphericalMercatorInverse().transformY(0L, 0L), -85.05112878);
    assertEquals(GeoProjection.sphericalMercatorInverse().transformX(0x4000000000000000L, 0x4000000000000000L), 0.0);
    assertEquals(GeoProjection.sphericalMercatorInverse().transformY(0x4000000000000000L, 0x4000000000000000L), 0.0);
    assertEquals(GeoProjection.sphericalMercatorInverse().transformX(0x7fffffffffffffffL, 0x7fffffffffffffffL), 180.0);
    assertEquals(GeoProjection.sphericalMercatorInverse().transformY(0x7fffffffffffffffL, 0x7fffffffffffffffL), 85.05112878);
    assertEquals(GeoProjection.sphericalMercatorInverse().transformX(0x14a8d299063d7800L, 0x4e53cbe98b71c400L), -121.895259);
    assertEquals(GeoProjection.sphericalMercatorInverse().transformY(0x14a8d299063d7800L, 0x4e53cbe98b71c400L), 37.333447);
  }
}

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

import swim.math.R2Shape;
import swim.math.R2ToZ2Operator;
import swim.math.Z2Form;
import swim.math.Z2ToR2Operator;

public final class GeoProjection {
  private GeoProjection() {
    // stub
  }

  private static WGS84 wgs84;
  private static WGS84Inverse wgs84Inverse;
  private static SphericalMercator sphericalMercator;
  private static SphericalMercatorInverse sphericalMercatorInverse;

  public static R2ToZ2Operator wgs84() {
    if (wgs84 == null) {
      wgs84 = new WGS84();
    }
    return wgs84;
  }

  public static Z2ToR2Operator wgs84Inverse() {
    if (wgs84Inverse == null) {
      wgs84Inverse = new WGS84Inverse();
    }
    return wgs84Inverse;
  }

  public static Z2Form<R2Shape> wgs84Form() {
    if (wgs84 == null) {
      wgs84 = new WGS84();
    }
    return wgs84;
  }

  public static R2ToZ2Operator sphericalMercator() {
    if (sphericalMercator == null) {
      sphericalMercator = new SphericalMercator();
    }
    return sphericalMercator;
  }

  public static Z2ToR2Operator sphericalMercatorInverse() {
    if (sphericalMercatorInverse == null) {
      sphericalMercatorInverse = new SphericalMercatorInverse();
    }
    return sphericalMercatorInverse;
  }

  public static Z2Form<R2Shape> sphericalMercatorForm() {
    if (sphericalMercator == null) {
      sphericalMercator = new SphericalMercator();
    }
    return sphericalMercator;
  }
}

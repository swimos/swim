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

import swim.math.R2ToZ2Operator;
import swim.math.Z2ToR2Operator;

final class WGS84Inverse implements Z2ToR2Operator {
  @Override
  public double transformX(long x, long y) {
    return transformX(x);
  }

  @Override
  public double transformY(long x, long y) {
    return transformY(y);
  }

  @Override
  public R2ToZ2Operator inverse() {
    return GeoProjection.wgs84();
  }

  static double transformX(long x) {
    return round(((double) x / (double) 0x7fffffffffffffffL) * 360.0 - 180.0);
  }

  static double transformY(long y) {
    return round(((double) y / (double) 0x7fffffffffffffffL) * 180.0 - 90.0);
  }

  static double round(double value) {
    return (double) Math.round(value * 100000000.0) / 100000000.0;
  }
}

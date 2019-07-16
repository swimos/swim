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
import swim.structure.Item;

final class SphericalMercator extends Z2Form<R2Shape> implements R2ToZ2Operator {
  @Override
  public Class<?> type() {
    return R2Shape.class;
  }

  @Override
  public long getXMin(R2Shape shape) {
    return transformLng(shape.xMin());
  }

  @Override
  public long getYMin(R2Shape shape) {
    return transformLat(shape.yMin());
  }

  @Override
  public long getXMax(R2Shape shape) {
    return transformLng(shape.xMax());
  }

  @Override
  public long getYMax(R2Shape shape) {
    return transformLat(shape.yMax());
  }

  @Override
  public boolean contains(R2Shape outer, R2Shape inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(R2Shape s, R2Shape t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(R2Shape shape) {
    return R2Shape.shapeForm().mold(shape);
  }

  @Override
  public R2Shape cast(Item item) {
    return R2Shape.shapeForm().cast(item);
  }

  @Override
  public long transformX(double lng, double lat) {
    return transformLng(lng);
  }

  @Override
  public long transformY(double lng, double lat) {
    return transformLat(lat);
  }

  @Override
  public Z2ToR2Operator inverse() {
    return GeoProjection.sphericalMercatorInverse();
  }

  static final double MAX_LAT = Math.atan(Math.sinh(Math.PI));

  static long transformLng(double lng) {
    return scale(Math.toRadians(lng));
  }

  static long transformLat(double lat) {
    return scale(Math.log(Math.tan(Math.PI / 4.0 + Math.min(Math.max(-MAX_LAT, Math.toRadians(lat)), MAX_LAT) / 2.0)));
  }

  static long scale(double x) {
    return (long) (((Math.min(Math.max(-Math.PI, x), Math.PI) + Math.PI) / (Math.PI * 2.0)) * (double) 0x7fffffffffffffffL);
  }
}

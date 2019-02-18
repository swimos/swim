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

package swim.math;

import swim.structure.Form;

public abstract class R3Form<T> extends Form<T> implements R3Boundary<T> {
  @Override
  public abstract double getXMin(T object);

  @Override
  public abstract double getYMin(T object);

  @Override
  public abstract double getZMin(T object);

  @Override
  public abstract double getXMax(T object);

  @Override
  public abstract double getYMax(T object);

  @Override
  public abstract double getZMax(T object);

  @Override
  public abstract boolean contains(T outer, T inner);

  @Override
  public abstract boolean intersects(T s, T t);

  //public static <T> Z3Form<T> transformed(R3Form<T> form, R3ToZ3Function function) {
  //  return new R3ToZ3Form<T>(form, function);
  //}
}

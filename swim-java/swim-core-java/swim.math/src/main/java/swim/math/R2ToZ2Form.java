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

import swim.structure.Item;

final class R2ToZ2Form<T> extends Z2Form<T> {
  final R2Form<T> form;
  final R2ToZ2Function function;

  R2ToZ2Form(R2Form<T> form, R2ToZ2Function function) {
    this.form = form;
    this.function = function;
  }

  @Override
  public String tag() {
    return this.form.tag();
  }

  @Override
  public T unit() {
    return this.form.unit();
  }

  @Override
  public Class<?> type() {
    return this.form.type();
  }

  @Override
  public long getXMin(T object) {
    return this.function.transformX(this.form.getXMin(object), this.form.getYMin(object));
  }

  @Override
  public long getYMin(T object) {
    return this.function.transformY(this.form.getXMin(object), this.form.getYMin(object));
  }

  @Override
  public long getXMax(T object) {
    return this.function.transformX(this.form.getXMax(object), this.form.getYMax(object));
  }

  @Override
  public long getYMax(T object) {
    return this.function.transformY(this.form.getXMax(object), this.form.getYMax(object));
  }

  @Override
  public boolean contains(T outer, T inner) {
    return this.form.contains(outer, inner);
  }

  @Override
  public boolean intersects(T s, T t) {
    return this.form.intersects(s, t);
  }

  @Override
  public Item mold(T object) {
    return this.form.mold(object);
  }

  @Override
  public T cast(Item item) {
    return this.form.cast(item);
  }
}

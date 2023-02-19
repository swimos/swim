// Copyright 2015-2022 Swim.inc
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

package swim.waml;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.repr.Attrs;
import swim.repr.Repr;

@Public
@Since("5.0")
public abstract class WamlReprForm<T> implements WamlForm<T> {

  protected final Attrs attrs;

  protected WamlReprForm(Attrs attrs) {
    this.attrs = attrs;
  }

  public abstract WamlForm<T> withAttrs(Attrs attrs);

  @Override
  public WamlAttrForm<?, ? extends T> getAttrForm(String name) {
    return new WamlReprAttrForm<T>(this);
  }

}

final class WamlReprAttrForm<T> implements WamlAttrForm<Repr, T> {

  final WamlReprForm<T> form;

  WamlReprAttrForm(WamlReprForm<T> form) {
    this.form = form;
  }

  @Override
  public WamlForm<Repr> argsForm() {
    return WamlReprs.tupleForm();
  }

  @Override
  public boolean isNullary(@Nullable Repr args) {
    return Repr.unit().equals(args);
  }

  @Override
  public WamlForm<T> refineForm(WamlForm<T> form, String name, @Nullable Repr args) {
    return this.form.withAttrs(this.form.attrs.updated(name, args));
  }

  @Override
  public WamlForm<T> refineForm(WamlForm<T> form, String name) {
    return this.form.withAttrs(this.form.attrs.updated(name, Repr.unit()));
  }

}

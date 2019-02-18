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

package swim.recon;

import swim.codec.Output;
import swim.codec.Writer;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Value;

final class ReconFormWriter<T> extends Writer<T, T> {
  final ReconWriter<Item, Value> recon;
  final Form<T> form;
  final T object;
  final Writer<?, ?> part;

  ReconFormWriter(ReconWriter<Item, Value> recon, Form<T> form, T object, Writer<?, ?> part) {
    this.recon = recon;
    this.form = form;
    this.object = object;
    this.part = part;
  }

  ReconFormWriter(ReconWriter<Item, Value> recon, Form<T> form) {
    this(recon, form, null, null);
  }

  @Override
  public Writer<T, T> feed(T object) {
    return new ReconFormWriter<T>(recon, form, object, null);
  }

  @Override
  public Writer<T, T> pull(Output<?> output) {
    return write(output, this.recon, this.form, this.object, this.part);
  }

  static <T> Writer<T, T> write(Output<?> output, ReconWriter<Item, Value> recon,
                                Form<T> form, T object, Writer<?, ?> part) {
    if (output == null) {
      return done();
    }
    if (part == null) {
      final Value value = form.mold(object).toValue();
      part = recon.writeValue(value, output);
    } else {
      part = part.pull(output);
    }
    if (part.isDone()) {
      return done(object);
    } else if (part.isError()) {
      return part.asError();
    }
    return new ReconFormWriter<T>(recon, form, object, part);
  }

  static <T> Writer<T, T> write(Output<T> output, ReconWriter<Item, Value> recon,
                                Form<T> form, T object) {
    return write(output, recon, form, object, null);
  }
}

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

package swim.avro;

import swim.codec.Format;
import swim.codec.Output;

final class AvroNamespaceComponent extends AvroNamespace {
  final String head;
  AvroNamespace tail;
  String string;

  AvroNamespaceComponent(String head, AvroNamespace tail) {
    if (head.isEmpty()) {
      throw new IllegalArgumentException();
    }
    this.head = head;
    this.tail = tail;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public String head() {
    return this.head;
  }

  @Override
  public AvroNamespace tail() {
    return this.tail;
  }

  @Override
  void setTail(AvroNamespace tail) {
    this.tail = tail;
  }

  @Override
  AvroNamespace dealias() {
    return new AvroNamespaceComponent(this.head, this.tail);
  }

  @Override
  public AvroNamespace prepended(String component) {
    return AvroNamespace.component(component, this);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("AvroNamespace").write('.').write("parse").write('(').write('"')
        .display(this).write('"').write(')');
  }

  @Override
  public void display(Output<?> output) {
    if (this.string != null) {
      output = output.write(this.string);
    } else {
      AvroNamespace.display(this, output);
    }
  }

  @Override
  public String toString() {
    if (this.string == null) {
      this.string = Format.display(this);
    }
    return this.string;
  }
}

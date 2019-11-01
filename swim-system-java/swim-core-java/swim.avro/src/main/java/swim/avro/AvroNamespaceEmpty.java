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

import java.util.Collection;
import java.util.NoSuchElementException;
import swim.codec.Output;

final class AvroNamespaceEmpty extends AvroNamespace {
  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return true;
  }

  @Override
  public String head() {
    throw new NoSuchElementException();
  }

  @Override
  public AvroNamespace tail() {
    throw new UnsupportedOperationException();
  }

  @Override
  void setTail(AvroNamespace tail) {
    throw new UnsupportedOperationException();
  }

  @Override
  AvroNamespace dealias() {
    return this;
  }

  @Override
  public AvroNamespace appended(String component) {
    return AvroNamespace.component(component);
  }

  @Override
  public AvroNamespace appended(Collection<? extends String> components) {
    return AvroNamespace.from(components);
  }

  @Override
  public AvroNamespace prepended(String component) {
    return AvroNamespace.component(component);
  }

  @Override
  public AvroNamespace prepended(Collection<? extends String> components) {
    return AvroNamespace.from(components);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("AvroNamespace").write('.').write("empty").write('(').write(')');
  }

  @Override
  public void display(Output<?> output) {
    // nop
  }

  @Override
  public String toString() {
    return "";
  }
}

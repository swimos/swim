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

package swim.streamlet;

/**
 * An {@code Inlet} that invalidates a parameterized {@code Streamlet} whenever
 * the {@code Inlet} is invalidated, and that updates the parameterized {@code
 * Streamlet} whenever the {@code Inlet} updates.
 */
public class StreamletInlet<I> extends AbstractInlet<I> {
  protected final Streamlet<? super I, ?> streamlet;

  public StreamletInlet(Streamlet<? super I, ?> streamlet) {
    this.streamlet = streamlet;
  }

  public Streamlet<? super I, ?> streamlet() {
    return this.streamlet;
  }

  @Override
  protected void willInvalidateOutput() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ?>) this.streamlet).willInvalidateInlet(this);
    }
  }

  @Override
  protected void didInvalidateOutput() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ?>) this.streamlet).didInvalidateInlet(this);
    } else {
      this.streamlet.invalidate();
    }
  }

  @Override
  protected void willReconcileOutput(int version) {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ?>) this.streamlet).willReconcileInlet(this, version);
    }
  }

  @Override
  protected void didReconcileOutput(int version) {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ?>) this.streamlet).didReconcileInlet(this, version);
    } else {
      this.streamlet.reconcile(version);
    }
  }
}

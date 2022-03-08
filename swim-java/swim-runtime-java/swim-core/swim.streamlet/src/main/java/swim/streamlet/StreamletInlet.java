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

package swim.streamlet;

/**
 * An {@code Inlet} that decoheres a parameterized {@code Streamlet} whenever
 * the {@code Inlet} decoheres, and that recoheres the parameterized {@code
 * Streamlet} whenever the {@code Inlet} recoheres.
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
  protected void willDecohereOutput() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ?>) this.streamlet).willDecohereInlet(this);
    }
  }

  @Override
  protected void didDecohereOutput() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ?>) this.streamlet).didDecohereInlet(this);
    } else {
      this.streamlet.decohere();
    }
  }

  @Override
  protected void willRecohereOutput(int version) {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ?>) this.streamlet).willRecohereInlet(this, version);
    }
  }

  @Override
  protected void didRecohereOutput(int version) {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ?>) this.streamlet).didRecohereInlet(this, version);
    } else {
      this.streamlet.recohere(version);
    }
  }

}

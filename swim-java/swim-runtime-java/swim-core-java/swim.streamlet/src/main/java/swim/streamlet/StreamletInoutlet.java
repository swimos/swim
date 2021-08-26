// Copyright 2015-2021 Swim Inc.
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
 * An {@code Inoutlet} that decoheres a parameterized {@code Streamlet}
 * whenever the {@code Inoutlet} decoheres, that recoheres the parameterized
 * {@code Streamlet} whenever the {@code Inoutlet} recoheres, and which gets
 * its state from the parameterized {@code Streamlet}.
 */
public class StreamletInoutlet<I, O> extends AbstractInoutlet<I, O> {

  protected final Streamlet<? super I, ? extends O> streamlet;

  public StreamletInoutlet(Streamlet<? super I, ? extends O> streamlet) {
    this.streamlet = streamlet;
  }

  public Streamlet<? super I, ? extends O> streamlet() {
    return this.streamlet;
  }

  @SuppressWarnings("unchecked")
  @Override
  public O get() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      final O output = ((GenericStreamlet<?, ? extends O>) this.streamlet).getOutput(this);
      if (output != null) {
        return output;
      }
    }
    if (this.input != null) {
      return (O) this.input.get();
    }
    return null;
  }

  @Override
  protected void willDecohere() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ? extends O>) this.streamlet).willDecohereOutlet(this);
    }
  }

  @Override
  protected void didDecohere() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ? extends O>) this.streamlet).didDecohereOutlet(this);
    } else {
      this.streamlet.decohere();
    }
  }

  @Override
  protected void willRecohere(int version) {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ? extends O>) this.streamlet).willRecohereOutlet(this, version);
    }
  }

  @Override
  protected void didRecohere(int version) {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<? super I, ? extends O>) this.streamlet).didRecohereOutlet(this, version);
    }
  }

}

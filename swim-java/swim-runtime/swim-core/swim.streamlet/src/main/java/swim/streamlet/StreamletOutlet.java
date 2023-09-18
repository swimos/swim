// Copyright 2015-2023 Nstream, inc.
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
 * An {@code Outlet} that decoheres a parameterized {@code Streamlet}
 * whenever the {@code Outlet} decoheres, and which gets its state from
 * the parameterized {@code Streamlet}.
 */
public class StreamletOutlet<O> extends AbstractOutlet<O> {

  protected final Streamlet<?, ? extends O> streamlet;

  public StreamletOutlet(Streamlet<?, ? extends O> streamlet) {
    this.streamlet = streamlet;
  }

  public Streamlet<?, ? extends O> streamlet() {
    return this.streamlet;
  }

  @Override
  public O get() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      return ((GenericStreamlet<?, ? extends O>) this.streamlet).getOutput(this);
    }
    return null;
  }

  @Override
  protected void willDecohereInput() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<?, ? extends O>) this.streamlet).willDecohereOutlet(this);
    }
  }

  @Override
  protected void didDecohereInput() {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<?, ? extends O>) this.streamlet).didDecohereOutlet(this);
    } else {
      this.streamlet.decohere();
    }
  }

  @Override
  protected void willRecohereInput(int version) {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<?, ? extends O>) this.streamlet).willRecohereOutlet(this, version);
    }
  }

  @Override
  protected void didRecohereInput(int version) {
    if (this.streamlet instanceof GenericStreamlet<?, ?>) {
      ((GenericStreamlet<?, ? extends O>) this.streamlet).didRecohereOutlet(this, version);
    }
  }

}

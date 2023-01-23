// Copyright 2015-2023 Swim.inc
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

public abstract class AbstractInlet<I> implements Inlet<I> {

  protected Outlet<? extends I> input;
  protected int version;

  public AbstractInlet() {
    this.input = null;
    this.version = -1;
  }

  @Override
  public Outlet<? extends I> input() {
    return this.input;
  }

  @Override
  public void bindInput(Outlet<? extends I> input) {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = input;
    if (this.input != null) {
      this.input.bindOutput(this);
    }
  }

  @Override
  public void unbindInput() {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = null;
  }

  @Override
  public void disconnectInputs() {
    final Outlet<? extends I> input = this.input;
    if (input != null) {
      input.unbindOutput(this);
      this.input = null;
      input.disconnectInputs();
    }
  }

  @Override
  public void disconnectOutputs() {
    // nop
  }

  @Override
  public void decohereOutput() {
    if (this.version >= 0) {
      this.willDecohereOutput();
      this.version = -1;
      this.onDecohereOutput();
      this.didDecohereOutput();
    }
  }

  @Override
  public void recohereOutput(int version) {
    if (this.version < 0) {
      this.willRecohereOutput(version);
      this.version = version;
      if (this.input != null) {
        this.input.recohereInput(version);
      }
      this.onRecohereOutput(version);
      this.didRecohereOutput(version);
    }
  }

  protected void willDecohereOutput() {
    // hook
  }

  protected void onDecohereOutput() {
    // hook
  }

  protected void didDecohereOutput() {
    // hook
  }

  protected void willRecohereOutput(int version) {
    // hook
  }

  protected void onRecohereOutput(int version) {
    // hook
  }

  protected void didRecohereOutput(int version) {
    // hook
  }

}

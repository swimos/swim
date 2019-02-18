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
  public void invalidateOutput() {
    if (this.version >= 0) {
      willInvalidateOutput();
      this.version = -1;
      onInvalidateOutput();
      didInvalidateOutput();
    }
  }

  @Override
  public void reconcileOutput(int version) {
    if (this.version < 0) {
      willReconcileOutput(version);
      this.version = version;
      if (this.input != null) {
        this.input.reconcileInput(version);
      }
      onReconcileOutput(version);
      didReconcileOutput(version);
    }
  }

  protected void willInvalidateOutput() {
    // stub
  }

  protected void onInvalidateOutput() {
    // stub
  }

  protected void didInvalidateOutput() {
    // stub
  }

  protected void willReconcileOutput(int version) {
    // stub
  }

  protected void onReconcileOutput(int version) {
    // stub
  }

  protected void didReconcileOutput(int version) {
    // stub
  }
}

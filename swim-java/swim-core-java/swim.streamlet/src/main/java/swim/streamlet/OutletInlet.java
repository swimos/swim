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
 * An {@code Inlet} that invalidates a parameterized {@code Outlet} whenever
 * the {@code Inlet} is invalidated, and that updates the parameterized {@code
 * Outlet} whenever the {@code Inlet} updates.
 */
public class OutletInlet<I> extends AbstractInlet<I> {
  protected final Outlet<?> outlet;

  public OutletInlet(Outlet<?> outlet) {
    this.outlet = outlet;
  }

  public Outlet<?> outlet() {
    return this.outlet;
  }

  @Override
  protected void onInvalidateOutput() {
    this.outlet.invalidateInput();
  }

  @Override
  protected void onReconcileOutput(int version) {
    this.outlet.reconcileInput(version);
  }
}

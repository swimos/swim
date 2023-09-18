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

public interface GenericStreamlet<I, O> extends Streamlet<I, O> {

  O getOutput(Outlet<? super O> outlet);

  void willDecohereInlet(Inlet<? extends I> inlet);

  void didDecohereInlet(Inlet<? extends I> inlet);

  void willRecohereInlet(Inlet<? extends I> inlet, int version);

  void didRecohereInlet(Inlet<? extends I> inlet, int version);

  void willDecohereOutlet(Outlet<? super O> outlet);

  void didDecohereOutlet(Outlet<? super O> outlet);

  void willRecohereOutlet(Outlet<? super O> outlet, int version);

  void didRecohereOutlet(Outlet<? super O> outlet, int version);

}
